#Requires -Version 5.1
<#
.SYNOPSIS
  Deploys pre-built Al-Nass Insights images to one isolated Compose stack.

.DESCRIPTION
  - Pulls the exact backend/frontend image references from the CI run (immutable SHA tags).
  - Updates only the target stack (dev | ppr | prod).
  - Does not rebuild application images on the server.
  - Does not run `docker compose down -v` (Redis/SQL named volumes are preserved).
  - Does not provision, migrate, or modify customer Oracle.
  - App-cache SQL migrations apply only when AppCache provider is SqlServer
    (Docker stacks use Redis by default — migrations are skipped for Redis).

.NOTES
  Stack env files (.env.dev / .env.ppr / .env) must already exist on the deploy host
  with secrets. They are never written by this script.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'ppr', 'prod')]
    [string]$Stack,

    [Parameter(Mandatory = $true)]
    [string]$BackendImage,

    [Parameter(Mandatory = $true)]
    [string]$FrontendImage,

    [Parameter(Mandatory = $true)]
    [string]$CommitSha,

    [string]$RepoRoot = '',

    [int]$HealthyTimeoutSec = 180
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = Split-Path -Parent $PSScriptRoot
}

Set-Location -LiteralPath $RepoRoot

$envFile = switch ($Stack) {
    'dev'  { '.env.dev' }
    'ppr'  { '.env.ppr' }
    'prod' { '.env' }
}

$composeFile = Join-Path $RepoRoot 'docker-compose.yml'
if (-not (Test-Path -LiteralPath $composeFile)) {
    throw "docker-compose.yml not found at $composeFile"
}
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot $envFile))) {
    throw "Missing $envFile in $RepoRoot — copy from .env.example and fill secrets on the deploy host."
}

if ($BackendImage -match ':(latest|dev|ppr|prod|main)$' -and $BackendImage -notmatch $CommitSha) {
    Write-Warning "Backend image tag looks mutable ($BackendImage). Prefer immutable SHA tags."
}
if ($FrontendImage -match ':(latest|dev|ppr|prod|main)$' -and $FrontendImage -notmatch $CommitSha) {
    Write-Warning "Frontend image tag looks mutable ($FrontendImage). Prefer immutable SHA tags."
}

# Load UI_HOST_PORT / COMPOSE_PROJECT_NAME from the stack file for smoke checks (values only; not re-exported as secrets).
$uiPort = '8080'
$projectName = "alnass-$Stack"
Get-Content -LiteralPath (Join-Path $RepoRoot $envFile) | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^(UI_HOST_PORT)=(.+)$') { $uiPort = $Matches[2].Trim().Trim('"') }
    if ($_ -match '^(COMPOSE_PROJECT_NAME)=(.+)$') { $projectName = $Matches[2].Trim().Trim('"') }
}

$env:BACKEND_IMAGE = $BackendImage
$env:FRONTEND_IMAGE = $FrontendImage
$env:PULL_POLICY = 'always'

Write-Host "Deploying stack '$Stack' (project=$projectName) commit=$CommitSha"
Write-Host "  BACKEND_IMAGE=$BackendImage"
Write-Host "  FRONTEND_IMAGE=$FrontendImage"

# Pull application images only; redis/sql use public base images and keep volumes.
docker compose --env-file $envFile pull backend frontend
if ($LASTEXITCODE -ne 0) { throw "docker compose pull failed (exit $LASTEXITCODE)" }

# Recreate application containers from pulled images. Do not pass --build.
# Do not use `down -v` — named volumes redis_data/sql_data must survive.
docker compose --env-file $envFile up -d --no-build --remove-orphans
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed (exit $LASTEXITCODE)" }

Write-Host "Waiting for containers to become healthy (timeout ${HealthyTimeoutSec}s)..."
$deadline = [DateTime]::UtcNow.AddSeconds($HealthyTimeoutSec)
$required = @(
    "alnass-$Stack-redis",
    "alnass-$Stack-sql",
    "alnass-$Stack-backend",
    "alnass-$Stack-frontend-nginx"
)

$allHealthy = $false
do {
    $allHealthy = $true
    foreach ($name in $required) {
        $health = docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' $name 2>$null
        if ($LASTEXITCODE -ne 0 -or $health -ne 'healthy') {
            $allHealthy = $false
            Write-Host "  waiting: $name -> $health"
            break
        }
    }
    if ($allHealthy) { break }
    Start-Sleep -Seconds 5
} while ([DateTime]::UtcNow -lt $deadline)

if (-not $allHealthy) {
    Write-Host "--- docker compose ps ---"
    docker compose --env-file $envFile ps
    Write-Host "--- backend logs (tail) ---"
    docker logs --tail 80 "alnass-$Stack-backend" 2>&1
    Write-Host "--- frontend-nginx logs (tail) ---"
    docker logs --tail 40 "alnass-$Stack-frontend-nginx" 2>&1
    throw "Stack '$Stack' did not become healthy within ${HealthyTimeoutSec}s."
}

$base = "http://127.0.0.1:$uiPort"
Write-Host "Smoke checks against $base ..."

function Assert-HttpOk([string]$Url) {
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
        if ($resp.StatusCode -ne 200) {
            throw "Expected 200 from $Url, got $($resp.StatusCode)"
        }
        return $resp
    }
    catch {
        throw "Smoke check failed for $Url : $_"
    }
}

Assert-HttpOk "$base/"
Assert-HttpOk "$base/health/live"
try {
    Assert-HttpOk "$base/health/ready"
}
catch {
    # Ready depends on app cache (Redis). Treat as deployment failure.
    throw
}

# Confirm running containers use the requested image references
$backendRunning = docker inspect --format '{{.Config.Image}}' "alnass-$Stack-backend"
$frontendRunning = docker inspect --format '{{.Config.Image}}' "alnass-$Stack-frontend-nginx"
if ($backendRunning -ne $BackendImage) {
    throw "Backend image mismatch: running='$backendRunning' expected='$BackendImage'"
}
if ($frontendRunning -ne $FrontendImage) {
    throw "Frontend image mismatch: running='$frontendRunning' expected='$FrontendImage'"
}

$metaDir = Join-Path $RepoRoot ".deploy"
New-Item -ItemType Directory -Force -Path $metaDir | Out-Null
$metaPath = Join-Path $metaDir "$Stack-release.json"
@"
{
  "stack": "$Stack",
  "commitSha": "$CommitSha",
  "backendImage": "$BackendImage",
  "frontendImage": "$FrontendImage",
  "deployedAtUtc": "$([DateTime]::UtcNow.ToString('o'))",
  "uiPort": "$uiPort"
}
"@ | Set-Content -LiteralPath $metaPath -Encoding utf8

Write-Host "Deployment succeeded for stack '$Stack' @ $CommitSha"
Write-Host "Release metadata: $metaPath"
docker compose --env-file $envFile ps

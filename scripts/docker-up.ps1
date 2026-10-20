#Requires -Version 5.1
<#
.SYNOPSIS
  Start one isolated Al-Nass stack: dev | ppr | prod

.DESCRIPTION
  Local/dev helper. Uses `docker compose up` and optionally `--build`.
  For CI/CD image-based deploys (no rebuild), use Deploy-ComposeStack.ps1.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'ppr', 'prod')]
    [string]$Stack,

    [switch]$Build
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$envFile = switch ($Stack) {
    'dev'  { '.env.dev' }
    'ppr'  { '.env.ppr' }
    'prod' { '.env' }
}

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing $envFile — copy from .env.example and fill secrets."
}

# Local builds tag as alnass-backend:local / alnass-frontend:local (compose defaults).
$env:PULL_POLICY = 'missing'
if (-not $env:BACKEND_IMAGE) { $env:BACKEND_IMAGE = 'alnass-backend:local' }
if (-not $env:FRONTEND_IMAGE) { $env:FRONTEND_IMAGE = 'alnass-frontend:local' }

$composeArgs = @('--env-file', $envFile, 'up', '-d')
if ($Build) { $composeArgs += '--build' }

Write-Host "Starting stack '$Stack' using $envFile ..."
docker compose @composeArgs
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed (exit $LASTEXITCODE)" }
docker compose --env-file $envFile ps

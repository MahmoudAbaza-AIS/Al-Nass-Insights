#Requires -Version 5.1
<#
.SYNOPSIS
  [LEGACY / OPTIONAL] Deploys a win-x64 published Insights.Presentation artifact as a Windows Service.

.DESCRIPTION
  The primary delivery path for this monorepo is Docker Compose
  (see scripts/Deploy-ComposeStack.ps1 and .github/workflows/ci-cd.yml).
  Keep this script only if a non-container Windows Service host is required.

.NOTES
  - Never serves from actions-runner/_work
  - Does not migrate customer Oracle schemas
  - Does not reverse app-cache migrations on rollback
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('development', 'preproduction', 'production')]
    [string]$EnvironmentName,

    [Parameter(Mandatory = $true)]
    [string]$ArtifactZipPath,

    [Parameter(Mandatory = $true)]
    [string]$CommitSha,

    [string]$RootPath = 'C:\Apps\AlNass.Insights',

    [string]$ServiceNamePrefix = 'AlNassInsights',

    [int]$RetainReleases = 5,

    [switch]$SkipMigrations,

    [string]$MigrationConnectionString
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-PathSafe([string]$Path, [string]$Root) {
    $full = [System.IO.Path]::GetFullPath($Path)
    $rootFull = [System.IO.Path]::GetFullPath($Root)
    if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing path outside environment root: $full"
    }
}

$envRoot = Join-Path $RootPath $EnvironmentName
$releases = Join-Path $envRoot 'releases'
$currentLink = Join-Path $envRoot 'current'
$configDir = Join-Path $envRoot 'config'
$logsDir = Join-Path $envRoot 'logs'
$serviceName = "$ServiceNamePrefix-$EnvironmentName"
$releaseDir = Join-Path $releases ("{0:yyyyMMdd-HHmmss}-{1}" -f (Get-Date).ToUniversalTime(), $CommitSha.Substring(0, [Math]::Min(12, $CommitSha.Length)))

Assert-PathSafe $envRoot $RootPath
New-Item -ItemType Directory -Force -Path $releases, $configDir, $logsDir | Out-Null

if (-not (Test-Path -LiteralPath $ArtifactZipPath)) {
    throw "Artifact not found: $ArtifactZipPath"
}

Write-Host "Extracting artifact to $releaseDir"
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
Expand-Archive -LiteralPath $ArtifactZipPath -DestinationPath $releaseDir -Force
Assert-PathSafe $releaseDir $envRoot

$dll = Join-Path $releaseDir 'Insights.Presentation.dll'
if (-not (Test-Path -LiteralPath $dll)) {
    throw "Insights.Presentation.dll missing from artifact."
}

Set-Content -Path (Join-Path $releaseDir 'VERSION.txt') -Value $CommitSha -Encoding utf8

if (-not $SkipMigrations) {
    if ([string]::IsNullOrWhiteSpace($MigrationConnectionString)) {
        Write-Warning "Migration connection string not provided; skipping owned-cache migrations."
    }
    else {
        Write-Host "Running application-cache migrations (owned schema only)..."
        $migrateScript = Join-Path $PSScriptRoot 'Invoke-AppCacheMigrations.ps1'
        & $migrateScript -ConnectionString $MigrationConnectionString -PresentationDllPath (Join-Path $releaseDir 'Insights.Presentation.dll')
    }
}

$previous = $null
if (Test-Path -LiteralPath $currentLink) {
    $previous = (Get-Item -LiteralPath $currentLink).Target
    if (-not $previous) { $previous = (Get-Item -LiteralPath $currentLink).FullName }
}

Write-Host "Stopping service $serviceName (if present)..."
$svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -ne 'Stopped') {
    Stop-Service -Name $serviceName -Force -ErrorAction Stop
    Start-Sleep -Seconds 3
}

# Activate release via junction (no recursive delete of other environments)
if (Test-Path -LiteralPath $currentLink) {
    cmd /c rmdir "$currentLink"
}
cmd /c mklink /J "$currentLink" "$releaseDir" | Out-Null

$env:ASPNETCORE_ENVIRONMENT = switch ($EnvironmentName) {
    'production' { 'Production' }
    'preproduction' { 'Production' } # hardened; not Development
    'development' { 'Staging' }      # never expose developer exception pages as "Development" on shared host
}

try {
    if (-not $svc) {
        Write-Host "Creating Windows service $serviceName"
        $binPath = "`"C:\Program Files\dotnet\dotnet.exe`" `"$currentLink\Insights.Presentation.dll`""
        New-Service -Name $serviceName -BinaryPathName $binPath -DisplayName "Al-Nass Insights ($EnvironmentName)" -StartupType Automatic | Out-Null
        # Prefer sc.exe config for AppDirectory via environment — document working directory in ops guide.
    }

    Start-Service -Name $serviceName
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        try {
            $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5080/health/live' -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) { $ready = $true; break }
        }
        catch { }
    }

    if (-not $ready) { throw "Readiness smoke failed for $serviceName" }

    $runningVersion = Get-Content -LiteralPath (Join-Path $currentLink 'VERSION.txt') -ErrorAction Stop
    if ($runningVersion -ne $CommitSha) { throw "Version mismatch: expected $CommitSha got $runningVersion" }

    Write-Host "Deployment succeeded for $EnvironmentName @ $CommitSha"
}
catch {
    Write-Error "Deployment failed: $_"
    if ($previous -and (Test-Path -LiteralPath $previous)) {
        Write-Warning "Rolling back application release to $previous"
        if (Test-Path -LiteralPath $currentLink) { cmd /c rmdir "$currentLink" }
        cmd /c mklink /J "$currentLink" "$previous" | Out-Null
        try { Start-Service -Name $serviceName -ErrorAction SilentlyContinue } catch { }
    }
    throw
}

# Retain bounded releases
Get-ChildItem -Path $releases -Directory |
    Sort-Object Name -Descending |
    Select-Object -Skip $RetainReleases |
    ForEach-Object {
        Write-Host "Removing old release $($_.FullName)"
        Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }

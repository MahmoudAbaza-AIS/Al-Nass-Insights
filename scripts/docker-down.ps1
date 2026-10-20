#Requires -Version 5.1
<#
.SYNOPSIS
  Stop one isolated Al-Nass stack: dev | ppr | prod

.DESCRIPTION
  Default: `docker compose down` — removes containers/network for that project only.
  Named volumes are kept unless -Volumes is passed.

  WARNING: -Volumes deletes Redis and SQL Server data for that stack only.
  CI/CD never uses -Volumes. Prefer Deploy-ComposeStack.ps1 for releases.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('dev', 'ppr', 'prod')]
    [string]$Stack,

    [switch]$Volumes
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
    throw "Missing $envFile"
}

$composeArgs = @('--env-file', $envFile, 'down')
if ($Volumes) {
    Write-Warning "Removing named volumes for stack '$Stack' (Redis + SQL data will be deleted)."
    $composeArgs += '--volumes'
}

Write-Host "Stopping stack '$Stack' ..."
docker compose @composeArgs
if ($LASTEXITCODE -ne 0) { throw "docker compose down failed (exit $LASTEXITCODE)" }

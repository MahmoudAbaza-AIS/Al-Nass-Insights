#Requires -Version 5.1
param(
    [Parameter(Mandatory = $true)]
    [string]$ConnectionString,

    [Parameter(Mandatory = $true)]
    [string]$PresentationDllPath
)

$ErrorActionPreference = 'Stop'

if ($ConnectionString -match '(?i)Data Source=.*:1521') {
    throw "Refusing migration: connection appears to target Oracle."
}

if (-not (Test-Path -LiteralPath $PresentationDllPath)) {
    throw "Presentation assembly not found: $PresentationDllPath"
}

$env:AppCache__Provider = 'SqlServer'
$env:AppCache__ConnectionString = $ConnectionString
$dotnet = (Get-Command dotnet -ErrorAction Stop).Source
& $dotnet exec $PresentationDllPath --migrate-app-cache
if ($LASTEXITCODE -ne 0) {
    throw "Migration failed with exit code $LASTEXITCODE"
}

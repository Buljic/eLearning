$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $root "Frontend/tutoringfrontend"
$backendPath = Join-Path $root "Backend/tutoring"

Write-Host "==> Frontend lint"
Push-Location $frontendPath
npm run lint

Write-Host "==> Frontend build"
npm run build
Pop-Location

Write-Host "==> Backend tests"
Push-Location $backendPath
./mvnw.cmd -q test
Pop-Location

Write-Host "Quality gate passed."

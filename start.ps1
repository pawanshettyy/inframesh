$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

# Ensure Unicode startup logs work on Windows PowerShell and Python.
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONPATH = $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$createdEnvironment = $false
if (-not (Test-Path $python)) {
    Write-Host "Creating Python virtual environment..."
    & python -m venv (Join-Path $PSScriptRoot ".venv")
    $createdEnvironment = $true
}

if ($createdEnvironment) {
    Write-Host "Installing backend dependencies..."
    & $python -m pip install -r (Join-Path $PSScriptRoot "backend\requirements.txt")
}

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Installing frontend dependencies..."
    & npm ci
}

$backend = Start-Process -FilePath $python `
    -ArgumentList "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $PSScriptRoot `
    -PassThru

try {
    Write-Host "Starting InframeSH backend on http://localhost:8000..."
    Write-Host "Starting InframeSH frontend on http://localhost:3000..."
    & npm run dev
}
finally {
    if ($backend -and -not $backend.HasExited) {
        Stop-Process -Id $backend.Id
    }
}

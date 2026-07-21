param(
    [string]$BackendPath = "$env:USERPROFILE\Documents\New project\multisports-ai-coach",
    [int]$Port = 8000,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$webRoot = Join-Path $projectRoot "web"
$webDist = Join-Path $webRoot "dist"
$backendRoot = (Resolve-Path $BackendPath).Path
$venvPython = Join-Path $backendRoot ".venv\Scripts\python.exe"
$python = if (Test-Path $venvPython) { $venvPython } else { (Get-Command python).Source }
$cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cloudflared) {
    $cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
}
if (-not (Test-Path $cloudflared)) {
    throw "cloudflared was not found. Install Cloudflare Tunnel first."
}

if (-not $SkipBuild) {
    Push-Location $webRoot
    try {
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
    }
    finally {
        Pop-Location
    }
}

$env:XUNMOVE_WEB_DIST = $webDist
$env:XUNMOVE_DB_PATH = Join-Path $backendRoot "data\xunmove-api.sqlite3"
$env:XUNMOVE_DEVICE_MODE = "demo"
$logDirectory = Join-Path $projectRoot ".tools"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$stdout = Join-Path $logDirectory "hosted-api.stdout.log"
$stderr = Join-Path $logDirectory "hosted-api.stderr.log"
$tunnelStdout = Join-Path $logDirectory "cloudflared-quick.stdout.log"
$tunnelStderr = Join-Path $logDirectory "cloudflared-quick.stderr.log"
$shareUrlFile = Join-Path $logDirectory "share-url.txt"

$existingListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$server = $null
$tunnel = $null
if (-not $existingListener) {
    $server = Start-Process -FilePath $python -ArgumentList @(
        "-m", "uvicorn", "multisport_ai_coach.api.app:app",
        "--host", "127.0.0.1", "--port", "$Port"
    ) -WorkingDirectory $backendRoot -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
}

try {
    $ready = $false
    foreach ($attempt in 1..20) {
        try {
            $health = Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 2
            if ($health.status -eq "ok") { $ready = $true; break }
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }
    if (-not $ready) { throw "The local service did not start. Check $stderr" }

    Remove-Item -LiteralPath $tunnelStdout -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $tunnelStderr -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $shareUrlFile -Force -ErrorAction SilentlyContinue
    $tunnel = Start-Process -FilePath $cloudflared -ArgumentList @(
        "tunnel",
        "--url", "http://127.0.0.1:$Port"
    ) -WindowStyle Hidden -RedirectStandardOutput $tunnelStdout -RedirectStandardError $tunnelStderr -PassThru

    $shareUrl = $null
    foreach ($attempt in 1..30) {
        if ($tunnel.HasExited) {
            throw "Cloudflare Tunnel exited before a public URL was created. Check $tunnelStderr"
        }
        $logText = ""
        if (Test-Path $tunnelStdout) {
            $logText += Get-Content -LiteralPath $tunnelStdout -Raw
        }
        if (Test-Path $tunnelStderr) {
            $logText += Get-Content -LiteralPath $tunnelStderr -Raw
        }
        if ($logText) {
            $match = [regex]::Match($logText, "https://[a-z0-9-]+\.trycloudflare\.com")
            if ($match.Success) {
                $shareUrl = $match.Value
                break
            }
        }
        Start-Sleep -Seconds 1
    }
    if (-not $shareUrl) {
        throw "Cloudflare Tunnel did not return a public URL. Check $tunnelStderr"
    }

    Set-Content -LiteralPath $shareUrlFile -Value $shareUrl -Encoding utf8
    Write-Host "Public test URL: $shareUrl" -ForegroundColor Green
    Write-Host "The URL remains available while this script is running." -ForegroundColor DarkGray
    Wait-Process -Id $tunnel.Id
}
finally {
    if ($tunnel -and -not $tunnel.HasExited) {
        Stop-Process -Id $tunnel.Id
    }
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id
    }
}

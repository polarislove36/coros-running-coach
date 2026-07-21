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

if (-not $SkipBuild) {
    Push-Location $webRoot
    try {
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw "前端构建失败" }
    }
    finally {
        Pop-Location
    }
}

if (-not (Test-Path (Join-Path $webDist "index.html"))) {
    throw "未找到前端构建结果，请先移除 -SkipBuild 后重试"
}

$env:XUNMOVE_WEB_DIST = $webDist
$env:XUNMOVE_DB_PATH = Join-Path $backendRoot "data\xunmove-api.sqlite3"
$env:XUNMOVE_DEVICE_MODE = "demo"

Write-Host "XUNMOVE 已准备好：http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务。当前为朋友测试用演示设备模式。" -ForegroundColor DarkGray

Push-Location $backendRoot
try {
    & $python -m uvicorn multisport_ai_coach.api.app:app --host 127.0.0.1 --port $Port
}
finally {
    Pop-Location
}

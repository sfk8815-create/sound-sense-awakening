@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "server.pid" (
  echo Server is not running.
  powershell -NoProfile -Command "Start-Sleep -Seconds 2"
  exit /b 0
)

set /p SERVERPID=<server.pid
powershell -NoProfile -Command "try { Stop-Process -Id %SERVERPID% -Force -ErrorAction Stop; Write-Host 'Server stopped.' } catch { Write-Host 'Server was not running.' }"
del /q "server.pid" >nul 2>nul
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
exit /b 0

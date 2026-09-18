@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem 检查本地服务是否已在运行
powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; $r=$false; try { $c.Connect('127.0.0.1',8080); $r=$true } catch { }; $c.Close(); if ($r) { exit 0 } else { exit 1 }"
if not errorlevel 1 goto open

rem 用 Windows 自带的 PowerShell 启动本地服务（隐藏窗口，不依赖 Node.js）
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile','-WindowStyle','Hidden','-ExecutionPolicy','Bypass','-File','%~dp0server.ps1' -WindowStyle Hidden"
powershell -NoProfile -Command "Start-Sleep -Seconds 2"

:open
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
  rem 窗口级全屏：切换模块不会退出全屏
  start "" "%EDGE%" --app=http://127.0.0.1:8080/home.html --start-fullscreen --no-first-run --no-default-browser-check
) else (
  start "" http://127.0.0.1:8080/home.html
)
exit /b 0

@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; $r=$false; try { $c.Connect('127.0.0.1',8080); $r=$true } catch { }; $c.Close(); if ($r) { exit 0 } else { exit 1 }"
if not errorlevel 1 goto open

echo Starting local server, please wait...
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile','-WindowStyle','Hidden','-ExecutionPolicy','Bypass','-File','%~dp0server.ps1' -WindowStyle Hidden"
powershell -NoProfile -Command "Start-Sleep -Seconds 2"

:open
start "" http://127.0.0.1:8080/home.html
exit /b 0

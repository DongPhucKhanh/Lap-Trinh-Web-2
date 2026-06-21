@echo off
title Khoi Dong Tro Ly Antigravity - Lap Trinh Web 2
echo ===================================================
echo [!] Dang mo VS Code va khoi dong tro ly...
echo ===================================================

:: Di chuyen vao thu muc do an
cd /d "D:\ltw2"

:: Mo VS Code tai thu muc nay
start "" code .

:: Mo cua so dong lenh moi de chay tro ly
start "" cmd /k "agy"

echo [OK] Da khoi dong xong! Ban co the tat cua so nay.
timeout /t 3
exit

@echo off
title EventHub Local Launcher
echo =======================================================
echo           EventHub - Online Event Booking System
echo =======================================================
echo.
echo [1/2] Starting Node.js + Express Backend on Port 5000...
start "EventHub Backend API [Port 5000]" cmd /k "cd server && npm run dev"

echo [2/2] Starting React + Vite Frontend on Port 5173...
start "EventHub Frontend Client [Port 5173]" cmd /k "cd client && npm run dev"

echo.
echo =======================================================
echo   Services are starting in dedicated terminal windows!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5000/api/health
echo =======================================================
echo.
timeout /t 3 >nul
start http://localhost:5173

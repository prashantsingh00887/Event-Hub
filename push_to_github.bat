@echo off
title Push EventHub to GitHub
color 0A
echo ======================================================================
echo           EventHub - Push Codebase to GitHub
echo ======================================================================
echo Target Repository: https://github.com/prashantsingh00887/Event-Hub.git
echo.
cd /d "%~dp0"

echo [1/2] Verifying git remote and branch...
git branch -M main
git remote set-url origin https://github.com/prashantsingh00887/Event-Hub.git

echo [2/2] Pushing all 84 project files to GitHub...
echo (If prompted, click Sign in with Browser in the popup window)
echo.
git push -u origin main --force

echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo   SUCCESS! All project files are now live on GitHub:
    echo   https://github.com/prashantsingh00887/Event-Hub
    echo ======================================================================
) else (
    echo ======================================================================
    echo   Push failed or was cancelled. Please check your GitHub credentials.
    echo ======================================================================
)
echo.
pause

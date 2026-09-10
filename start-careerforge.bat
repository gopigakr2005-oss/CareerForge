@echo off
title CareerForge AI Launcher
cd /d "C:\Users\renga\.gemini\antigravity\scratch\ai-resume-builder"

netstat -ano | findstr ":5173" >nul
if errorlevel 1 (
    echo Starting CareerForge AI server...
    start /min cmd /c "npm run dev"
    timeout /t 4 /nobreak >nul
)

echo Opening CareerForge AI in your browser...
start http://localhost:5173/

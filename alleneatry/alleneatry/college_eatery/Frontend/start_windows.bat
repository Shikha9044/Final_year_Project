@echo off
REM Start frontend directly with node to bypass npm spawn issues
REM Usage: double-click this file or run from cmd in this folder: start_windows.bat
cd /d %~dp0
if exist node_modules\react-scripts\scripts\start.js (
  echo Starting react-scripts via node...
  node "%~dp0node_modules\react-scripts\scripts\start.js"
) else (
  echo react-scripts is not installed.
  echo Run: npm install
  exit /b 1
)

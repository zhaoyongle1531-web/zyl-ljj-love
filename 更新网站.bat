@echo off
cd /d "%~dp0"
python optimize_images.py
if errorlevel 1 pause & exit /b 1
python build_publish.py
if errorlevel 1 pause & exit /b 1
echo.
echo Website files updated. Preview locally, then commit and push to GitHub.
pause

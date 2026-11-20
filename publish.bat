@echo off
rem Double-click this after changing anything in the public folder.
rem It sends the change to GitHub; the VPS picks it up within about a minute.
cd /d "%~dp0"
git add -A
git commit -m "Update site"
if errorlevel 1 echo Nothing new to publish.
git push
echo.
pause

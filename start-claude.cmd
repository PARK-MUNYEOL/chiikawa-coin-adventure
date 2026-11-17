@echo off
cd /d "%~dp0"
if exist "%USERPROFILE%\.local\bin\claude.exe" (
  "%USERPROFILE%\.local\bin\claude.exe" %*
) else (
  claude %*
)
if errorlevel 1 pause

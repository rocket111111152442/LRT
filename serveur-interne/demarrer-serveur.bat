@echo off
setlocal
cd /d "%~dp0"

REM ============================================
REM  Serveur interne Body Studio - lanceur
REM  Double-clique sur ce fichier pour demarrer.
REM ============================================

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe sur ce PC.
  echo          Telecharge-le sur https://nodejs.org puis relance ce fichier.
  pause
  exit /b 1
)

if exist cert.pem if exist key.pem goto :run

REM --- Generation du certificat HTTPS local (une seule fois) ---
set "OPENSSL=openssl"
where openssl >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\Git\usr\bin\openssl.exe" (
    set "OPENSSL=%ProgramFiles%\Git\usr\bin\openssl.exe"
  ) else (
    echo [INFO] openssl introuvable : demarrage sans HTTPS.
    echo        La camera ne marchera que sur CE PC via http://localhost:8443/
    goto :run
  )
)
echo Generation du certificat local ^(une seule fois^)...
"%OPENSSL%" req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/CN=body-studio-local" >nul 2>nul

:run
node serveur.mjs
pause

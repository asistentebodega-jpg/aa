@echo off
title Servidor local - Impresor de Etiquetas
cd /d "%~dp0"

echo ============================================
echo   Iniciando servidor local en el puerto 8000
echo ============================================
echo.
echo No cierres esta ventana mientras uses la herramienta.
echo.

start "" http://localhost:8000/impresor_etiquetas.html

python -m http.server 8000

pause

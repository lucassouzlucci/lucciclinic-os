@echo off
title Lucci Clinic OS - Servidor Medico
cd /d "%~dp0"
echo =======================================================
echo   LUCCI CLINIC OS - SISTEMA MEDICO ^& PEP INTELIGENTE
echo   Dr. Lucas Lucci ^| Balneario Camboriu - SC
echo =======================================================
echo.
echo Abrindo aplicacao no navegador (http://localhost:3000)...
start http://localhost:3000
echo.
echo Servidor em execucao. Para encerrar, feche esta janela.
echo =======================================================
"%APPDATA%\Antigravity\bin\agy-node.cmd" server.js
pause

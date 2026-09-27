# Lucci Clinic OS - Script de Inicialização PowerShell
Set-Location -Path $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  LUCCI CLINIC OS - SISTEMA MÉDICO & PEP INTELIGENTE   " -ForegroundColor Green
Write-Host "  Dr. Lucas Lucci | Balneário Camboriú - SC            " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando aplicação em http://localhost:3000..." -ForegroundColor White

Start-Process "http://localhost:3000"

& "$env:APPDATA\Antigravity\bin\agy-node.cmd" server.js

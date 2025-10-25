@echo off
echo ========================================
echo    DEPLOY AUTOMATICO PARA GITHUB
echo ========================================
echo.

echo 1. Verificando configuracoes do Git...
git config --global user.name "Liamor24"
git config --global user.email "lmflix15@gmail.com"
echo ✓ Configuracoes do Git atualizadas

echo.
echo 2. Verificando status do repositorio...
git status

echo.
echo 3. Tentando fazer push para o GitHub...
git push origin main

echo.
echo ========================================
echo    DEPLOY CONCLUIDO!
echo ========================================
pause

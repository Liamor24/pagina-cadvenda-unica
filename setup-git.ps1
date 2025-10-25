# Script para configurar Git e fazer push automaticamente
Write-Host "=== CONFIGURANDO GIT E ENVIANDO PARA GITHUB ===" -ForegroundColor Green

# 1. Configurar Git
Write-Host "1. Configurando Git..." -ForegroundColor Yellow
git config --global user.name "Liamor24"
git config --global user.email "lmflix15@gmail.com"
git config --global credential.helper manager-core

# 2. Verificar configurações
Write-Host "2. Verificando configurações..." -ForegroundColor Yellow
Write-Host "Nome: $(git config --global user.name)"
Write-Host "Email: $(git config --global user.email)"

# 3. Verificar status
Write-Host "3. Verificando status do repositório..." -ForegroundColor Yellow
git status

# 4. Tentar fazer push
Write-Host "4. Tentando fazer push para o GitHub..." -ForegroundColor Yellow
Write-Host "Se pedir credenciais, use:" -ForegroundColor Cyan
Write-Host "- Username: Liamor24" -ForegroundColor Cyan
Write-Host "- Password: Seu Personal Access Token do GitHub" -ForegroundColor Cyan
Write-Host ""

try {
    git push origin main
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no push. Verifique as credenciais." -ForegroundColor Red
    Write-Host "Para criar um Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Clique em 'Generate new token'" -ForegroundColor Cyan
    Write-Host "3. Marque 'repo' e clique em 'Generate'" -ForegroundColor Cyan
    Write-Host "4. Copie o token e use como senha" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== CONFIGURAÇÃO CONCLUÍDA ===" -ForegroundColor Green

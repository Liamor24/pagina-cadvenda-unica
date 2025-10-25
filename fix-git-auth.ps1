# Script para resolver problema de autenticação Git
Write-Host "=== RESOLVENDO AUTENTICAÇÃO GIT ===" -ForegroundColor Green

# 1. Limpar credenciais salvas
Write-Host "1. Limpando credenciais antigas..." -ForegroundColor Yellow
git config --global --unset credential.helper
git config --global credential.helper manager-core

# 2. Configurar Git corretamente
Write-Host "2. Configurando Git..." -ForegroundColor Yellow
git config --global user.name "Liamor24"
git config --global user.email "lmflix15@gmail.com"

# 3. Verificar status
Write-Host "3. Verificando commits pendentes..." -ForegroundColor Yellow
git status

# 4. Tentar push com URL que força autenticação
Write-Host "4. Tentando push com autenticação..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Se pedir credenciais, use:" -ForegroundColor Cyan
Write-Host "- Username: Liamor24" -ForegroundColor White
Write-Host "- Password: Seu Personal Access Token" -ForegroundColor White
Write-Host ""

# Tentar push
try {
    git push https://github.com/Liamor24/pagina-cadvenda-unica.git main
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Ainda precisa de autenticação." -ForegroundColor Red
    Write-Host ""
    Write-Host "Para criar um Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Clique em 'Generate new token (classic)'" -ForegroundColor Cyan
    Write-Host "3. Nome: 'pagina-cadvenda-unica'" -ForegroundColor Cyan
    Write-Host "4. Expiration: 'No expiration'" -ForegroundColor Cyan
    Write-Host "5. Scopes: Marque 'repo' (acesso completo)" -ForegroundColor Cyan
    Write-Host "6. Clique em 'Generate token'" -ForegroundColor Cyan
    Write-Host "7. COPIE O TOKEN e use como senha" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== SCRIPT CONCLUÍDO ===" -ForegroundColor Green

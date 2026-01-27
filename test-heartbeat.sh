#!/bin/bash

# 🧪 TESTES: Verificar que Supabase está respondendo
# 
# Use este script para testar se o heartbeat está funcionando corretamente
# Antes de configurar Uptime Robot, execute este script para confirmar.
#
# Uso: bash test-heartbeat.sh

echo "🔍 Testando Heartbeat do Supabase..."
echo ""
echo "Project ID: hdbrkxlmrzvhwdegzlqf"
echo "URL: https://hdbrkxlmrzvhwdegzlqf.supabase.co"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Variáveis
PROJECT_ID="hdbrkxlmrzvhwdegzlqf"
PROJECT_URL="https://hdbrkxlmrzvhwdegzlqf.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYnJreGxtcnp2aHdkZWd6bHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzAwOTQsImV4cCI6MjA3NjUwNjA5NH0.4X97L1eLX6frGlVo7ezQt_qjRRKqjnGM5mBZZreVOHY"

# Função para testar e contar registros
test_table() {
    local table_name=$1
    local display_name=$2
    
    echo "📊 Testando tabela: $display_name"
    echo ""
    
    response=$(curl -s \
        -H "apikey: $ANON_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: count=exact" \
        "$PROJECT_URL/rest/v1/$table_name?limit=1")
    
    count=$(echo "$response" | grep -o '"count":"[0-9]*' | grep -o '[0-9]*')
    
    if [ -z "$count" ]; then
        count=$(echo "$response" | jq 'length' 2>/dev/null)
        if [ -z "$count" ]; then
            count="?"
        fi
    fi
    
    if [[ "$response" == *"200"* ]] || [[ "$count" != "?" ]]; then
        echo "✅ Status: OK"
        echo "   Registros: $count"
    else
        echo "❌ Status: ERRO"
        echo "   Resposta: $response"
    fi
    
    echo ""
}

# Teste 1: Conexão básica
echo "TESTE 1: Conexão Básica"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "GET $PROJECT_URL/rest/v1/sales?limit=1"
echo ""

response=$(curl -i -s \
    -H "apikey: $ANON_KEY" \
    "$PROJECT_URL/rest/v1/sales?limit=1" 2>&1)

http_code=$(echo "$response" | head -n 1)

if [[ "$http_code" == *"200"* ]]; then
    echo "✅ Conexão bem-sucedida!"
    echo "   HTTP: $http_code"
else
    echo "❌ Erro de conexão"
    echo "   Response: $http_code"
fi

echo ""
echo ""

# Teste 2: Listar tabelas
echo "TESTE 2: Verificar Tabelas Disponíveis"
echo "─────────────────────────────────────────────────────────────"
echo ""

# Testar sales
test_table "sales" "Vendas (Sales)"

# Testar expenses  
test_table "expenses" "Despesas (Expenses)"

# Testar products (se existir)
test_table "products" "Produtos (Products)"

echo ""

# Teste 3: Query com detalhes
echo "TESTE 3: Amostra de Dados - Últimas 3 Vendas"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "GET $PROJECT_URL/rest/v1/sales?limit=3&order=id.desc"
echo ""

curl -s \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    "$PROJECT_URL/rest/v1/sales?limit=3&order=id.desc" \
    | jq '.' 2>/dev/null || echo "Sem jq instalado. Instalando com: apt install jq"

echo ""
echo ""

# Teste 4: Teste exatamente o que Uptime Robot vai fazer
echo "TESTE 4: Simular Uptime Robot (GET simples)"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "GET $PROJECT_URL/rest/v1/sales?limit=1"
echo ""

start_time=$(date +%s%N)

response=$(curl -w "\n%{http_code}" -s \
    -H "apikey: $ANON_KEY" \
    "$PROJECT_URL/rest/v1/sales?limit=1")

end_time=$(date +%s%N)
elapsed=$((($end_time - $start_time) / 1000000))

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "Status HTTP: $http_code"
echo "Tempo resposta: ${elapsed}ms"
echo "Registros retornados: $(echo "$body" | jq 'length' 2>/dev/null)"
echo ""

if [[ "$http_code" == "200" ]]; then
    echo "✅ SUCESSO! Este é o teste que Uptime Robot executará a cada 5 minutos"
else
    echo "❌ ERRO! Verifique as credenciais"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "📋 RESULTADO FINAL:"
echo ""
if [[ "$http_code" == "200" ]]; then
    echo "✅ Supabase está respondendo corretamente"
    echo "✅ Pronto para configurar Uptime Robot"
    echo "✅ Keep-Alive irá funcionar sem problemas"
else
    echo "❌ Erro de conexão. Verifique:"
    echo "   - Se o Project ID está correto"
    echo "   - Se as credenciais estão atualizadas"
    echo "   - Se .env contém VITE_SUPABASE_PUBLISHABLE_KEY"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "💡 Próximos passos:"
echo "1. Se passou em todos os testes, seu setup está OK"
echo "2. Configure Uptime Robot em: https://uptimerobot.com"
echo "3. Use esta URL no Uptime Robot:"
echo "   https://hdbrkxlmrzvhwdegzlqf.supabase.co/rest/v1/sales?limit=1"
echo ""

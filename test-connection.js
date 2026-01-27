#!/usr/bin/env node

/**
 * Teste de Comunicação Banco-Site
 * Verifica se a conexão está funcionando corretamente
 */

const SUPABASE_URL = "https://aaavxylbuwkyfpnzyzfx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYXZ4eWxidXdreWZwbnp5emZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzgxOTAsImV4cCI6MjA4NTExNDE5MH0.vDL-hUDvKR58ijENlPwSTgHoAPuuvdlrBzZWo5Wo-Tw";

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(color, ...msg) {
  console.log(`${color}${msg.join(' ')}${colors.reset}`);
}

async function testConnection() {
  log(colors.bold + colors.cyan, '\n🔗 TESTE DE COMUNICAÇÃO BANCO-SITE\n');

  // 1. Verificar variáveis de ambiente
  log(colors.cyan, '1️⃣  Verificando Credenciais...');
  log(colors.yellow, `   URL: ${SUPABASE_URL}`);
  log(colors.yellow, `   Chave: ${SUPABASE_KEY.substring(0, 20)}...`);
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log(colors.red, '   ❌ Credenciais faltando!');
    return false;
  }
  log(colors.green, '   ✅ Credenciais carregadas');

  // 2. Teste de Health Check
  log(colors.cyan, '\n2️⃣  Health Check do Supabase...');
  try {
    const healthResponse = await fetch(`${SUPABASE_URL}/health`, {
      headers: {
        'apikey': SUPABASE_KEY,
      }
    });
    
    if (healthResponse.ok) {
      log(colors.green, '   ✅ Supabase respondendo');
    } else {
      log(colors.yellow, `   ⚠️  Status: ${healthResponse.status}`);
    }
  } catch (error) {
    log(colors.red, `   ❌ Erro: ${error.message}`);
  }

  // 3. Teste de Autenticação
  log(colors.cyan, '\n3️⃣  Teste de Autenticação...');
  try {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': SUPABASE_KEY,
      }
    });
    
    if (authResponse.ok) {
      log(colors.green, '   ✅ Autenticação funcionando');
    } else {
      log(colors.red, `   ❌ Falha na autenticação: ${authResponse.status}`);
    }
  } catch (error) {
    log(colors.red, `   ❌ Erro: ${error.message}`);
  }

  // 4. Teste de Acesso às Tabelas
  log(colors.cyan, '\n4️⃣  Teste de Acesso às Tabelas...');
  
  const tables = ['sales', 'products', 'expenses'];
  let hasData = false;

  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentRange = response.headers.get('content-range');
        const count = contentRange ? contentRange.split('/')[1] : '?';
        log(colors.green, `   ✅ ${table}: ${count} registros`);
        if (count !== '0' && count !== '?') hasData = true;
      } else if (response.status === 403) {
        log(colors.red, `   ❌ ${table}: RLS bloqueando (403)`);
      } else {
        log(colors.yellow, `   ⚠️  ${table}: Status ${response.status}`);
      }
    } catch (error) {
      log(colors.red, `   ❌ ${table}: ${error.message}`);
    }
  }

  // 5. Teste de RLS
  log(colors.cyan, '\n5️⃣  Teste de RLS...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=id,customer_name&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        log(colors.green, '   ✅ RLS permitindo leitura');
        log(colors.yellow, `       Dados amostra: ${JSON.stringify(data[0]).substring(0, 100)}`);
      } else {
        log(colors.yellow, '   ⚠️  RLS permite, mas tabela vazia');
      }
    } else if (response.status === 403) {
      log(colors.red, '   ❌ RLS BLOQUEANDO acesso anônimo');
    } else {
      const error = await response.json();
      log(colors.red, `   ❌ Erro: ${error.message}`);
    }
  } catch (error) {
    log(colors.red, `   ❌ Erro: ${error.message}`);
  }

  // 6. Teste CORS
  log(colors.cyan, '\n6️⃣  Teste de CORS...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Origin': 'http://localhost:5173'
      }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader) {
      log(colors.green, `   ✅ CORS habilitado: ${corsHeader}`);
    } else {
      log(colors.yellow, '   ⚠️  Sem header CORS específico');
    }
  } catch (error) {
    log(colors.red, `   ❌ Erro CORS: ${error.message}`);
  }

  // Resumo
  log(colors.cyan, '\n' + '═'.repeat(60));
  
  if (hasData) {
    log(colors.green, '✅ TUDO OK - Banco tem dados e está acessível');
    log(colors.yellow, '\n💡 Se o site ainda não mostra dados:');
    log(colors.yellow, '   1. Limpe o cache: Ctrl+Shift+R');
    log(colors.yellow, '   2. Verifique o console (F12) para erros');
    log(colors.yellow, '   3. Verifique as credenciais no .env');
  } else {
    log(colors.red, '❌ Problemas encontrados:');
    log(colors.yellow, '   • RLS pode estar bloqueando');
    log(colors.yellow, '   • Chaves podem estar incorretas');
    log(colors.yellow, '   • Banco pode estar inacessível');
  }

  log(colors.cyan, '═'.repeat(60) + '\n');
}

testConnection().catch(e => {
  log(colors.red, 'Erro fatal:', e.message);
  process.exit(1);
});

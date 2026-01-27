#!/usr/bin/env node

/**
 * Teste Detalhado de Dados nas Tabelas
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

async function getTableData(tableName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=100`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      return { error: `Status ${response.status}`, count: 0, data: [] };
    }

    const data = await response.json();
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

    return { count, data, error: null };
  } catch (error) {
    return { error: error.message, count: 0, data: [] };
  }
}

async function main() {
  log(colors.bold + colors.cyan, '\n📊 DETALHAMENTO DE DADOS NAS TABELAS\n');

  const tables = [
    { name: 'sales', desc: 'Vendas' },
    { name: 'products', desc: 'Produtos' },
    { name: 'expenses', desc: 'Despesas' }
  ];

  for (const table of tables) {
    log(colors.cyan, `\n${table.desc.toUpperCase()} (${table.name}):`);
    log(colors.cyan, '─'.repeat(50));

    const result = await getTableData(table.name);

    if (result.error) {
      log(colors.red, `❌ Erro: ${result.error}`);
      continue;
    }

    log(colors.green, `✅ Total de registros: ${result.count}`);

    if (result.data.length === 0) {
      log(colors.yellow, '⚠️  Nenhum dado retornado');
      continue;
    }

    // Mostrar estrutura (colunas)
    const firstRecord = result.data[0];
    const columns = Object.keys(firstRecord);
    log(colors.yellow, `\nColunas (${columns.length}): ${columns.join(', ')}`);

    // Mostrar amostras dos registros
    log(colors.yellow, `\nAmostra dos dados (primeiros 3):`);
    result.data.slice(0, 3).forEach((record, idx) => {
      log(colors.dim = '\x1b[2m', `\n  Registro ${idx + 1}:`);
      Object.entries(record).forEach(([key, value]) => {
        const displayValue = typeof value === 'object' 
          ? JSON.stringify(value).substring(0, 50) 
          : String(value).substring(0, 50);
        log(colors.yellow, `    ${key}: ${displayValue}`);
      });
    });
  }

  // Teste de JOIN
  log(colors.bold + colors.cyan, '\n\n🔗 TESTE DE JOIN (Como o Site Carrega)\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=*,products(*)&limit=10`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      log(colors.green, `✅ JOIN Funcionando: ${data.length} vendas carregadas`);
      
      if (data.length > 0) {
        log(colors.yellow, `\nVenda com produtos:`);
        const sale = data[0];
        log(colors.yellow, `  ID: ${sale.id}`);
        log(colors.yellow, `  Cliente: ${sale.customer_name}`);
        log(colors.yellow, `  Produtos vinculados: ${(sale.products || []).length}`);
        
        if (sale.products && sale.products.length > 0) {
          log(colors.yellow, `  └─ Primeiro produto:`, JSON.stringify(sale.products[0], null, 2).split('\n').slice(0, 5).join('\n     '));
        }
      }
    } else {
      log(colors.red, `❌ Erro no JOIN: ${response.status}`);
    }
  } catch (error) {
    log(colors.red, `❌ Erro: ${error.message}`);
  }

  log(colors.cyan, '\n' + '═'.repeat(60) + '\n');
}

main().catch(e => {
  log(colors.red, 'Erro:', e.message);
  process.exit(1);
});

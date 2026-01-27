#!/usr/bin/env node

/**
 * Verificar estrutura REAL das tabelas no Supabase
 */

const SUPABASE_URL = "https://aaavxylbuwkyfpnzyzfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYXZ4eWxidXdreWZwbnp5emZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzgxOTAsImV4cCI6MjA4NTExNDE5MH0.vDL-hUDvKR58ijENlPwSTgHoAPuuvdlrBzZWo5Wo-Tw";

async function checkTableNames() {
  console.log('🔍 Verificando nomes reais das tabelas...\n');

  const tableNames = ['sales', 'products', 'expenses', 'vendas', 'produtos', 'despesas'];

  for (const tableName of tableNames) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        console.log(`✅ Tabela EXISTE: ${tableName}`);
        
        // Tentar obter a contagem
        const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact'
          }
        });
        
        if (countResponse.ok) {
          const count = countResponse.headers.get('content-range')?.split('/')[1] || 0;
          console.log(`   └─ Registros: ${count}`);
        }
      } else if (response.status === 404) {
        console.log(`❌ Tabela NÃO EXISTE: ${tableName}`);
      } else {
        console.log(`⚠️  Tabela ${tableName}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`🔴 Erro ao verificar ${tableName}: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('Verificação concluída. Verifique acima qual a estrutura real.');
}

checkTableNames();

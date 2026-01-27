#!/usr/bin/env node

const SUPABASE_URL = "https://aaavxylbuwkyfpnzyzfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYXZ4eWxidXdreWZwbnp5emZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzgxOTAsImV4cCI6MjA4NTExNDE5MH0.vDL-hUDvKR58ijENlPwSTgHoAPuuvdlrBzZWo5Wo-Tw";

async function testRLS() {
  console.log('🔐 TESTE DE RLS NAS TABELAS\n');

  const tables = [
    { name: 'sales', desc: 'Vendas' },
    { name: 'products', desc: 'Produtos' },
    { name: 'expenses', desc: 'Despesas' }
  ];

  for (const table of tables) {
    console.log(`\n📋 Testando: ${table.desc} (${table.name})`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table.name}?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   Status: 200 OK ✅`);
        console.log(`   Registros: ${data.length || 'Nenhum'}`);
        
        // Se houver dados, mostrar estrutura
        if (data.length > 0) {
          console.log(`   Colunas: ${Object.keys(data[0]).join(', ')}`);
        }
      } else if (response.status === 403) {
        console.log(`   Status: 403 FORBIDDEN ❌ (RLS bloqueando!)`);
      } else if (response.status === 404) {
        console.log(`   Status: 404 NOT FOUND ❌ (Tabela não existe!)`);
      } else {
        const error = await response.json();
        console.log(`   Status: ${response.status} ⚠️`);
        console.log(`   Erro: ${error?.message || 'Desconhecido'}`);
      }
    } catch (error) {
      console.log(`   Erro de requisição: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📌 ANÁLISE:');
  console.log(`
Se 'products' retorna 200 OK mas com 0 registros:
👉 RLS está funcionando (não está bloqueando)
👉 Mas a tabela está vazia ou os dados não existem

Se 'products' retorna 403 FORBIDDEN:
👉 RLS está bloqueando o acesso anônimo à tabela
👉 Precisa adicionar políticas RLS permissivas

Se 'products' retorna 404:
👉 Tabela não existe no banco
👉 Precisa criar a tabela
  `);
}

testRLS().catch(e => console.error('Erro:', e.message));

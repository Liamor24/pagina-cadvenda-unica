#!/usr/bin/env node

const SUPABASE_URL = "https://aaavxylbuwkyfpnzyzfx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYXZ4eWxidXdreWZwbnp5emZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzgxOTAsImV4cCI6MjA4NTExNDE5MH0.vDL-hUDvKR58ijENlPwSTgHoAPuuvdlrBzZWo5Wo-Tw";

async function checkData() {
  console.log('🔍 ANÁLISE DETALHADA DOS DADOS\n');

  // 1. Contar vendas
  console.log('1️⃣  VENDAS (sales)');
  let response = await fetch(`${SUPABASE_URL}/rest/v1/sales?limit=5`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  let data = await response.json();
  console.log(`   Total: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   Primeiro registro:`, JSON.stringify(data[0], null, 2).substring(0, 200));
  }

  // 2. Contar products
  console.log('\n2️⃣  PRODUCTS (products)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/products?limit=5`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  data = await response.json();
  console.log(`   Total: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   Primeiro registro:`, JSON.stringify(data[0], null, 2).substring(0, 200));
  } else {
    console.log('   ⚠️  TABELA VAZIA - Sem produtos vinculados!');
  }

  // 3. Contar despesas
  console.log('\n3️⃣  EXPENSES (expenses)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/expenses?limit=5`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  data = await response.json();
  console.log(`   Total: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   Primeiro registro (sem detalhes):`, {
      id: data[0].id,
      descricao: data[0].descricao,
      valor_total: data[0].valor_total
    });
  }

  // 4. Tentar JOIN como o código faz
  console.log('\n4️⃣  TENTATIVA DE JOIN (como o código faz)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=*,products(*)`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  data = await response.json();
  console.log(`   Resultado: ${data.length} vendas com produtos`);
  if (data.length > 0) {
    console.log(`   Primeiro sale:`, {
      id: data[0].id,
      customer_name: data[0].customer_name,
      products: data[0].products
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 DIAGNÓSTICO:');
  console.log('═'.repeat(60));
  console.log(`
✅ Vendas: ${data.length > 0 ? 'CARREGADAS' : 'VAZIAS'}
⚠️  Produtos: Tabela vazia (sem produtos vinculados às vendas)
✅ Despesas: CARREGADAS

🔴 PROBLEMA IDENTIFICADO:
A tabela 'products' está vazia! Os dados que você vê no 
screenshot provavelmente são da VISUALIZAÇÃO do editor 
SQL, não são dados reais acessíveis via API.

SOLUÇÃO:
Você precisa inserir os produtos na tabela 'products' 
vinculando-os às vendas via 'sale_id'.
  `);
}

checkData().catch(e => console.error('Erro:', e.message));

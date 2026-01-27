#!/usr/bin/env node

/**
 * Teste Simulando Exatamente Como o Site Comunica
 */

const SUPABASE_URL = "https://aaavxylbuwkyfpnzyzfx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhYXZ4eWxidXdreWZwbnp5emZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzgxOTAsImV4cCI6MjA4NTExNDE5MH0.vDL-hUDvKR58ijENlPwSTgHoAPuuvdlrBzZWo5Wo-Tw";

async function testSiteSimulation() {
  console.log('\n🌐 SIMULANDO COMUNICAÇÃO DO SITE\n');

  // Teste 1: GET sales sem autorização (como o site faz)
  console.log('1️⃣  GET /rest/v1/sales (sem Authorization)');
  let response = await fetch(`${SUPABASE_URL}/rest/v1/sales?limit=2`, {
    headers: {
      'apikey': SUPABASE_KEY
    }
  });
  
  console.log(`   Status: ${response.status}`);
  console.log(`   Content-Length: ${response.headers.get('content-length')}`);
  let data = await response.json();
  console.log(`   Dados retornados: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   ✅ Primeiro: ${data[0].customer_name}`);
  } else {
    console.log('   ❌ VAZIO!');
  }

  // Teste 2: Tentar com Authorization
  console.log('\n2️⃣  GET /rest/v1/sales (COM Authorization)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/sales?limit=2`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  console.log(`   Status: ${response.status}`);
  data = await response.json();
  console.log(`   Dados retornados: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   ✅ Funcionando`);
  } else {
    console.log('   ❌ VAZIO!');
  }

  // Teste 3: Com SELECT especificado
  console.log('\n3️⃣  GET /rest/v1/sales?select=* (como o código faz)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=*&limit=2`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  console.log(`   Status: ${response.status}`);
  data = await response.json();
  console.log(`   Dados retornados: ${data.length} registros`);

  // Teste 4: Com JOIN
  console.log('\n4️⃣  GET /rest/v1/sales?select=*,products(*) (JOIN)');
  response = await fetch(`${SUPABASE_URL}/rest/v1/sales?select=*,products(*)&limit=2`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  console.log(`   Status: ${response.status}`);
  data = await response.json();
  console.log(`   Dados retornados: ${data.length} registros`);
  if (data.length > 0) {
    console.log(`   Primeiro sale tem ${(data[0].products || []).length} produtos`);
  }

  // Teste 5: Expenses
  console.log('\n5️⃣  GET /rest/v1/expenses?select=*');
  response = await fetch(`${SUPABASE_URL}/rest/v1/expenses?select=*&limit=2`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  console.log(`   Status: ${response.status}`);
  data = await response.json();
  console.log(`   Dados retornados: ${data.length} registros`);

  console.log('\n' + '═'.repeat(60));
}

testSiteSimulation().catch(e => console.error('Erro:', e.message));

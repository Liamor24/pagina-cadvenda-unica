#!/usr/bin/env node

/**
 * Script de Heartbeat para Supabase
 * 
 * Mantém o projeto Supabase ativo fazendo pings periódicos.
 * Supabase pausa projetos gratuitos após 7 dias de inatividade.
 * 
 * Uso:
 *   node keep-alive.js
 * 
 * Ou agendar para rodar a cada 5 minutos:
 *   # Linux/Mac (crontab -e):
 *   */5 * * * * cd /path/to/project && node keep-alive.js
 * 
 *   # Windows (Task Scheduler):
 *   - Criar tarefa que execute: node C:\path\to\project\keep-alive.js
 *   - Repetir a cada 5 minutos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID;
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const URL = process.env.VITE_SUPABASE_URL;

if (!PROJECT_ID || !PUBLISHABLE_KEY || !URL) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('   Certifique-se de que .env contém:');
  console.error('   - VITE_SUPABASE_PROJECT_ID');
  console.error('   - VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('   - VITE_SUPABASE_URL');
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(URL, PUBLISHABLE_KEY);

/**
 * Faz um ping ao Supabase para manter o projeto ativo
 */
async function sendHeartbeat() {
  try {
    const timestamp = new Date().toISOString();
    
    // Query leve que apenas toca o banco
    const { data, error } = await supabase
      .from('sales')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log(`[${timestamp}] ✅ Heartbeat enviado com sucesso`);
    console.log(`   Projeto: ${PROJECT_ID}`);
    console.log(`   Status: Ativo`);
    console.log(`   Próximo heartbeat em 5 minutos`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar heartbeat:`, error.message);
    return false;
  }
}

/**
 * Executa heartbeat contínuo a cada 5 minutos
 */
async function runContinuous() {
  console.log('🔄 Iniciando heartbeat contínuo...');
  console.log(`   Projeto: ${PROJECT_ID}`);
  console.log(`   Intervalo: 5 minutos`);
  console.log('   Pressione Ctrl+C para parar\n');

  // Enviar heartbeat imediatamente
  await sendHeartbeat();

  // Enviar heartbeat a cada 5 minutos
  setInterval(sendHeartbeat, 5 * 60 * 1000);
}

/**
 * Executa um único heartbeat
 */
async function runOnce() {
  const success = await sendHeartbeat();
  process.exit(success ? 0 : 1);
}

// Determinar modo de execução
const mode = process.argv[2] || 'continuous';

if (mode === 'once' || mode === '--once') {
  runOnce();
} else {
  runContinuous();
}

// Simple CRUD verification for expenses persistence, including pago_em
// Run with: node tests/expenses_crud.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or matching SUPABASE_* vars) are set.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('--- Expenses CRUD Test Start ---');

  // 1) Check column pago_em
  const { data: cols, error: colsErr } = await supabase
    .from('expenses')
    .select('pago_em')
    .limit(1);
  if (colsErr) {
    console.error('Schema read error:', colsErr.message);
  } else {
    const hasPagoEm = cols && (cols.length === 0 || typeof cols[0]?.pago_em !== 'undefined');
    console.log('Has column pago_em:', !!hasPagoEm);
  }

  // 2) Insert PIX expense
  const baseDate = new Date().toISOString().split('T')[0];
  const pix = {
    descricao: 'Teste PIX CRUD',
    categoria: 'Outros',
    data: baseDate,
    valor_total: 12.34,
    forma_pagamento: 'PIX',
    mes_referencia: new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^./, c => c.toUpperCase()) + ' ' + new Date().getFullYear(),
    observacao: 'CRUD pix'
  };
  const { data: insertedPix, error: insertPixErr } = await supabase.from('expenses').insert(pix).select('id').single();
  if (insertPixErr) {
    console.error('Insert PIX error:', insertPixErr.message);
  } else {
    console.log('Inserted PIX id:', insertedPix.id);
  }

  // 3) Insert installment expense (parcela 1 de 3)
  const parc = {
    descricao: 'Teste Parc CRUD',
    categoria: 'Outros',
    data: baseDate,
    valor_total: 10.00,
    forma_pagamento: 'Parcelado',
    parcelas: 3,
    parcela_atual: 1,
    mes_referencia: new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^./, c => c.toUpperCase()) + ' ' + new Date().getFullYear(),
    observacao: 'CRUD parcela'
  };
  const { data: insertedParc, error: insertParcErr } = await supabase.from('expenses').insert(parc).select('id').single();
  if (insertParcErr) {
    console.error('Insert Parcela error:', insertParcErr.message);
  } else {
    console.log('Inserted Parcela id:', insertedParc.id);
  }

  // 4) Update pago_em on the parcela row
  if (insertedParc?.id) {
    const today = new Date().toISOString().split('T')[0];
    const { error: updErr } = await supabase.from('expenses').update({ pago_em: today }).eq('id', insertedParc.id);
    if (updErr) {
      console.error('Update pago_em error:', updErr.message);
      // Fallback: persist pago_em marker into observacao
      const { data: currRows } = await supabase.from('expenses').select('observacao').eq('id', insertedParc.id).limit(1);
      const currentObs = currRows && currRows[0]?.observacao ? currRows[0].observacao : '';
      const cleaned = currentObs.replace(/\s*pago_em[:=]\s*\d{4}-\d{2}-\d{2}\s*/g, ' ').trim();
      const merged = cleaned ? `${cleaned} pago_em=${today}` : `pago_em=${today}`;
      const { error: obsErr } = await supabase.from('expenses').update({ observacao: merged }).eq('id', insertedParc.id);
      if (obsErr) {
        console.error('Fallback update observacao error:', obsErr.message);
      } else {
        console.log('Fallback: marked parcela as paid via observacao on', today);
      }
    } else {
      console.log('Marked parcela as paid on', today);
    }
  }

  // 5) Read back latest 5 expenses
  const { data: latest, error: latestErr } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(5);
  if (latestErr) {
    console.error('Read latest error:', latestErr.message);
  } else {
    console.log('Latest expenses sample:');
    for (const e of latest) {
      console.log({ id: e.id, forma_pagamento: e.forma_pagamento, parcelas: e.parcelas, parcela_atual: e.parcela_atual, pago_em: e.pago_em, observacao: e.observacao, valor_total: e.valor_total });
    }
  }

  console.log('--- Expenses CRUD Test End ---');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
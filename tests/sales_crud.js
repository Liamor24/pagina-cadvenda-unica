import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(url, key);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function run() {
  console.log('Running Sales CRUD tests...');

  // 1) Create sale with products
  const sale = {
    customer_name: 'Teste Cliente CRUD',
    purchase_date: new Date().toISOString(),
    payment_date: new Date().toISOString(),
    payment_method: 'pix',
    installments: null,
    installment_values: null,
    installment_dates: null,
    advance_payment: null,
    discount: 5,
  };

  const { data: insSale, error: insErr } = await supabase
    .from('sales')
    .insert(sale)
    .select('id')
    .single();
  assert(!insErr, `Insert sale failed: ${insErr?.message}`);
  assert(!!insSale?.id, 'Insert sale returned no id');
  const saleId = insSale.id;
  console.log('Created sale id:', saleId);

  const products = [
    { sale_id: saleId, product_ref: 'P1', product_name: 'Produto 1', purchase_value: 25, sale_value: 50 },
    { sale_id: saleId, product_ref: 'P2', product_name: 'Produto 2', purchase_value: 30, sale_value: 60 }
  ];
  const { error: prodInsErr } = await supabase.from('products').insert(products);
  assert(!prodInsErr, `Insert products failed: ${prodInsErr?.message}`);

  // 2) Read back and verify
  const { data: saleFull, error: selErr } = await supabase
    .from('sales')
    .select('*, products(*)')
    .eq('id', saleId)
    .single();
  assert(!selErr, `Select sale failed: ${selErr?.message}`);
  assert(Array.isArray(saleFull.products) && saleFull.products.length === 2, 'Products count mismatch after insert');

  // 3) Update sale fields and replace products
  const update = {
    customer_name: 'Cliente Atualizado',
    payment_method: 'installment',
    installments: 2,
    installment_values: [50, 55],
    installment_dates: [new Date().toISOString(), new Date(Date.now() + 86400000).toISOString()],
    discount: 10,
  };
  const { error: updErr } = await supabase.from('sales').update(update).eq('id', saleId);
  assert(!updErr, `Update sale failed: ${updErr?.message}`);

  const { error: delProdErr } = await supabase.from('products').delete().eq('sale_id', saleId);
  assert(!delProdErr, `Delete products failed: ${delProdErr?.message}`);

  const newProducts = [
    { sale_id: saleId, product_ref: 'P3', product_name: 'Produto 3', purchase_value: 40, sale_value: 90 },
  ];
  const { error: insNewProdErr } = await supabase.from('products').insert(newProducts);
  assert(!insNewProdErr, `Insert new products failed: ${insNewProdErr?.message}`);

  const { data: saleFull2, error: selErr2 } = await supabase
    .from('sales')
    .select('*, products(*)')
    .eq('id', saleId)
    .single();
  assert(!selErr2, `Select after update failed: ${selErr2?.message}`);
  assert(saleFull2.customer_name === 'Cliente Atualizado', 'Customer name did not update');
  assert(Array.isArray(saleFull2.products) && saleFull2.products.length === 1, 'Products replace did not apply');

  // 4) Installment-only update
  const newDates = [new Date(Date.now() + 172800000).toISOString(), new Date(Date.now() + 259200000).toISOString()];
  const { error: instUpdErr } = await supabase
    .from('sales')
    .update({ installment_dates: newDates })
    .eq('id', saleId);
  assert(!instUpdErr, `Installment dates update failed: ${instUpdErr?.message}`);
  const { data: saleFull3, error: selErr3 } = await supabase
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();
  assert(!selErr3, `Select after installment update failed: ${selErr3?.message}`);
  assert(Array.isArray(saleFull3.installment_dates) && saleFull3.installment_dates.length === 2, 'Installment dates length mismatch');

  // 5) Error handling: invalid insert
  const { error: badInsErr } = await supabase.from('sales').insert({ customer_name: null });
  assert(!!badInsErr, 'Expected error on invalid insert but got none');

  // 6) Cleanup
  const { error: cleanupProdErr } = await supabase.from('products').delete().eq('sale_id', saleId);
  assert(!cleanupProdErr, `Cleanup products failed: ${cleanupProdErr?.message}`);
  const { error: cleanupSaleErr } = await supabase.from('sales').delete().eq('id', saleId);
  assert(!cleanupSaleErr, `Cleanup sale failed: ${cleanupSaleErr?.message}`);

  console.log('All Sales CRUD tests passed');
}

run().then(() => process.exit(0)).catch(async (e) => {
  console.error('Sales CRUD tests failed:', e);
  await sleep(100);
  process.exit(1);
});
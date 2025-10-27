import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log('Checking Supabase tables and columns...');

  // Check sales table exists
  const { error: salesErr } = await supabase.from('sales').select('id').limit(1);
  console.log('sales table:', salesErr ? `ERROR: ${salesErr.message}` : 'OK');

  // Check products table exists
  const { error: prodErr } = await supabase.from('products').select('id').limit(1);
  console.log('products table:', prodErr ? `ERROR: ${prodErr.message}` : 'OK');

  // Check discount column exists
  const { error: discountErr } = await supabase.from('sales').select('discount').limit(1);
  console.log('sales.discount column:', discountErr ? `ERROR: ${discountErr.message}` : 'OK');

  process.exit(0);
}

check();
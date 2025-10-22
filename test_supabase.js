import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hdbrkxlmrzvhwdegzlqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYnJreGxtcnp2aHdkZWd6bHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzAwOTQsImV4cCI6MjA3NjUwNjA5NH0.4X97L1eLX6frGlVo7ezQt_qjRRKqjnGM5mBZZreVOHY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('sales')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('Connection successful!');
    
    // Test adding discount column
    console.log('Adding discount column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;'
    });
    
    if (alterError) {
      console.error('Error adding discount column:', alterError);
    } else {
      console.log('Discount column added successfully!');
    }
    
    // Test inserting a sale with discount
    console.log('Testing sale insertion with discount...');
    const { data: insertData, error: insertError } = await supabase
      .from('sales')
      .insert({
        customer_name: 'Test Customer',
        purchase_date: '2025-01-21',
        payment_date: '2025-01-21',
        payment_method: 'pix',
        discount: 10.50
      })
      .select();
    
    if (insertError) {
      console.error('Error inserting test sale:', insertError);
    } else {
      console.log('Test sale inserted successfully:', insertData);
      
      // Clean up test data
      await supabase
        .from('sales')
        .delete()
        .eq('customer_name', 'Test Customer');
      console.log('Test data cleaned up');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
-- Fix database structure to match the application code
-- This migration ensures the database structure matches what the application expects

-- First, let's check if we need to add the discount field to sales table
DO $$ 
BEGIN
    -- Add discount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'discount') THEN
        ALTER TABLE public.sales ADD COLUMN discount DECIMAL(10, 2);
    END IF;
END $$;

-- Ensure the products table exists with the correct structure
-- (The migration should have created it, but let's make sure)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_ref TEXT NOT NULL,
  product_name TEXT NOT NULL,
  purchase_value DECIMAL(10, 2) NOT NULL,
  sale_value DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_sale_id ON public.products(sale_id);

-- Ensure RLS is enabled
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
    -- Sales policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Permitir leitura de vendas') THEN
        CREATE POLICY "Permitir leitura de vendas" ON public.sales FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Permitir inserção de vendas') THEN
        CREATE POLICY "Permitir inserção de vendas" ON public.sales FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Permitir atualização de vendas') THEN
        CREATE POLICY "Permitir atualização de vendas" ON public.sales FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Permitir exclusão de vendas') THEN
        CREATE POLICY "Permitir exclusão de vendas" ON public.sales FOR DELETE USING (true);
    END IF;

    -- Products policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir leitura de produtos') THEN
        CREATE POLICY "Permitir leitura de produtos" ON public.products FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir inserção de produtos') THEN
        CREATE POLICY "Permitir inserção de produtos" ON public.products FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir atualização de produtos') THEN
        CREATE POLICY "Permitir atualização de produtos" ON public.products FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir exclusão de produtos') THEN
        CREATE POLICY "Permitir exclusão de produtos" ON public.products FOR DELETE USING (true);
    END IF;
END $$;

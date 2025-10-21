-- Migration: create_supabase_tables.sql
-- Run this on your Supabase Postgres database (via SQL editor or psql)

-- Enable extensions (if not present)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (optional)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  purchase_date date NOT NULL,
  payment_date date NOT NULL,
  payment_method text NOT NULL,
  installments int,
  installment_values numeric[],
  installment_dates date[],
  advance_payment numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_payment_date ON sales(payment_date);

-- Sales products (one-to-many)
CREATE TABLE IF NOT EXISTS sales_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_ref text,
  product_name text NOT NULL,
  purchase_value numeric NOT NULL,
  sale_value numeric NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_products_sale_id ON sales_products(sale_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  categoria text NOT NULL,
  data date NOT NULL,
  valor_total numeric NOT NULL,
  forma_pagamento text NOT NULL,
  parcelas int,
  parcela_atual int,
  mes_referencia text,
  observacao text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_mes_referencia ON expenses(mes_referencia);

-- Expense installments (if you want to track each parcela separately)
CREATE TABLE IF NOT EXISTS expense_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  parcela_num int,
  valor numeric,
  data date,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_installments_expense_id ON expense_installments(expense_id);

-- Useful view: sales with totals
CREATE OR REPLACE VIEW sales_with_totals AS
SELECT
  s.*, 
  COALESCE((SELECT SUM(sp.sale_value) FROM sales_products sp WHERE sp.sale_id = s.id), 0) AS total_products_value
FROM sales s;

-- Grant minimal permissions to anon (optional, configure via Supabase policies in production)
-- NOTE: for security, prefer Row Level Security policies instead of broad grants.

-- End of migration

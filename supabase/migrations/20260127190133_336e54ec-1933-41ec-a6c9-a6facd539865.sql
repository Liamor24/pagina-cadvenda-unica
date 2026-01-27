-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  installments INTEGER,
  installment_values JSONB,
  installment_dates JSONB,
  installment_type TEXT DEFAULT 'mensal',
  advance_payment NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_ref TEXT NOT NULL,
  product_name TEXT NOT NULL,
  purchase_value NUMERIC NOT NULL,
  sale_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_sale_id ON public.products(sale_id);

-- Criar tabela de despesas
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  valor_total NUMERIC NOT NULL,
  forma_pagamento TEXT NOT NULL,
  parcelas INTEGER,
  parcela_atual INTEGER,
  mes_referencia TEXT NOT NULL,
  observacao TEXT,
  grupo_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_expenses_mes_referencia ON public.expenses(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_expenses_grupo_id ON public.expenses(grupo_id);

-- Habilitar RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS permissivas para desenvolvimento (público pode ler/escrever)
CREATE POLICY "Permitir leitura de vendas" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de vendas" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de vendas" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de vendas" ON public.sales FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de produtos" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de produtos" ON public.products FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de despesas" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de despesas" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de despesas" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de despesas" ON public.expenses FOR DELETE USING (true);

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
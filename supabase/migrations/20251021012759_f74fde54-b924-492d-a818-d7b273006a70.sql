-- Criar tabela de vendas (sales)
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'installment')),
  installments INTEGER,
  installment_dates JSONB,
  installment_values JSONB,
  advance_payment DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de produtos (products)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_ref TEXT NOT NULL,
  product_name TEXT NOT NULL,
  purchase_value DECIMAL(10, 2) NOT NULL,
  sale_value DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de despesas (expenses)
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Estoque', 'Embalagens', 'Fornecedor', 'Despesa Operacional', 'Outros')),
  data DATE NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('PIX', 'Parcelado')),
  parcelas INTEGER,
  parcela_atual INTEGER,
  mes_referencia TEXT NOT NULL,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sales (acesso público para todos os usuários)
CREATE POLICY "Permitir leitura de vendas" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de vendas" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de vendas" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de vendas" ON public.sales FOR DELETE USING (true);

-- Políticas RLS para products (acesso público)
CREATE POLICY "Permitir leitura de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de produtos" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de produtos" ON public.products FOR DELETE USING (true);

-- Políticas RLS para expenses (acesso público)
CREATE POLICY "Permitir leitura de despesas" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de despesas" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de despesas" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de despesas" ON public.expenses FOR DELETE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_sales_payment_date ON public.sales(payment_date);
CREATE INDEX idx_sales_customer_name ON public.sales(customer_name);
CREATE INDEX idx_products_sale_id ON public.products(sale_id);
CREATE INDEX idx_expenses_data ON public.expenses(data);
CREATE INDEX idx_expenses_mes_referencia ON public.expenses(mes_referencia);
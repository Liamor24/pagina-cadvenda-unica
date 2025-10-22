-- Adicionar campo discount à tabela sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;

-- Comentário para documentar o campo
COMMENT ON COLUMN public.sales.discount IS 'Desconto aplicado na venda em reais';
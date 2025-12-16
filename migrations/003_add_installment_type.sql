-- Adicionar coluna installment_type na tabela sales
-- Valores possíveis: 'mensal' (padrão) ou 'quinzenal'

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS installment_type TEXT DEFAULT 'mensal';

-- Comentário explicativo
COMMENT ON COLUMN sales.installment_type IS 'Tipo de parcelamento: mensal (30 dias) ou quinzenal (15 dias)';

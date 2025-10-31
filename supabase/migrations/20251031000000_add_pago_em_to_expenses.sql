-- Adicionar coluna pago_em à tabela expenses para controlar pagamento de parcelas
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS pago_em DATE;

-- Índice opcional para consultas por status de pagamento
CREATE INDEX IF NOT EXISTS idx_expenses_pago_em ON public.expenses(pago_em);

-- Comentário para documentação
COMMENT ON COLUMN public.expenses.pago_em IS 'Data em que a parcela foi marcada como paga. Nulo indica parcela em aberto.';
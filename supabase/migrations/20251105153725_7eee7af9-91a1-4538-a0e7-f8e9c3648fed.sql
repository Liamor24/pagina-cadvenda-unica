-- Fase 1: Adicionar campo grupo_id para agrupar despesas e suas parcelas

-- Adicionar coluna grupo_id
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS grupo_id UUID;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_expenses_grupo_id ON expenses(grupo_id);

-- Atualizar registros existentes: cada despesa PIX recebe seu próprio grupo_id
UPDATE expenses 
SET grupo_id = id 
WHERE forma_pagamento = 'PIX' AND grupo_id IS NULL;

-- Para despesas parceladas, agrupar por descrição + parcelas + data similar
-- Primeiro, criar uma tabela temporária com os grupos e seus UUIDs
CREATE TEMP TABLE expense_groups AS
SELECT DISTINCT ON (descricao, parcelas, DATE_TRUNC('day', data))
  descricao,
  parcelas,
  DATE_TRUNC('day', data) as data_truncada,
  gen_random_uuid() as grupo_uuid
FROM expenses
WHERE forma_pagamento = 'Parcelado' AND grupo_id IS NULL;

-- Atualizar as despesas com os grupo_id correspondentes
UPDATE expenses e
SET grupo_id = eg.grupo_uuid
FROM expense_groups eg
WHERE e.forma_pagamento = 'Parcelado' 
  AND e.grupo_id IS NULL
  AND e.descricao = eg.descricao 
  AND e.parcelas = eg.parcelas
  AND DATE_TRUNC('day', e.data) = eg.data_truncada;

-- Limpar tabela temporária
DROP TABLE expense_groups;
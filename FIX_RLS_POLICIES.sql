-- ==========================================
-- SCRIPT DE CORREÇÃO: Dados Não Aparecem
-- ==========================================
-- Execute isto no Supabase SQL Editor se os dados não aparecerem

-- ⚠️ PASSO 1: VERIFICAR SE RLS É O PROBLEMA
-- Copie e execute APENAS isto primeiro:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('sales', 'products', 'expenses');

-- Se rowsecurity = true = RLS está ativado
-- Se rowsecurity = false = RLS está desativado

-- ==========================================
-- ⚠️ PASSO 2: VERIFICAR POLÍTICAS EXISTENTES
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('sales', 'products', 'expenses')
ORDER BY tablename;

-- ==========================================
-- ✅ PASSO 3: SOLUTION - ATIVAR RLS COM POLÍTICAS PERMISSIVAS
-- Execute isto se os dados não aparecerem:

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (pode dar erro se não existirem, ignore)
DROP POLICY IF EXISTS "Permitir leitura de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir inserção de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir atualização de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir exclusão de vendas" ON public.sales;
DROP POLICY IF EXISTS "Allow select sales" ON public.sales;
DROP POLICY IF EXISTS "Allow insert sales" ON public.sales;
DROP POLICY IF EXISTS "Allow update sales" ON public.sales;
DROP POLICY IF EXISTS "Allow delete sales" ON public.sales;

DROP POLICY IF EXISTS "Permitir leitura de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir exclusão de produtos" ON public.products;
DROP POLICY IF EXISTS "Allow select products" ON public.products;
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
DROP POLICY IF EXISTS "Allow update products" ON public.products;
DROP POLICY IF EXISTS "Allow delete products" ON public.products;

DROP POLICY IF EXISTS "Permitir leitura de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir inserção de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir atualização de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir exclusão de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Allow select expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow delete expenses" ON public.expenses;

-- Criar políticas PERMISSIVAS para testes/desenvolvimento
-- TABLE: sales
CREATE POLICY "Enable all operations for sales" ON public.sales
AS PERMISSIVE FOR ALL
USING (true)
WITH CHECK (true);

-- TABLE: products
CREATE POLICY "Enable all operations for products" ON public.products
AS PERMISSIVE FOR ALL
USING (true)
WITH CHECK (true);

-- TABLE: expenses
CREATE POLICY "Enable all operations for expenses" ON public.expenses
AS PERMISSIVE FOR ALL
USING (true)
WITH CHECK (true);

-- ==========================================
-- ✅ VERIFICAÇÃO FINAL
-- Execute isto para confirmar que funcionou:
SELECT COUNT(*) as total_vendas FROM public.sales;
SELECT COUNT(*) as total_produtos FROM public.products;
SELECT COUNT(*) as total_despesas FROM public.expenses;

-- Se contar > 0, as políticas estão funcionando!
-- Agora teste no site: os dados devem aparecer

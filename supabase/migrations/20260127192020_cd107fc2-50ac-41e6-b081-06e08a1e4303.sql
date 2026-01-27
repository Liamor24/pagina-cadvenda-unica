-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Permitir leitura de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir inserção de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir atualização de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir exclusão de vendas" ON public.sales;

DROP POLICY IF EXISTS "Permitir leitura de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir exclusão de produtos" ON public.products;

DROP POLICY IF EXISTS "Permitir leitura de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir inserção de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir atualização de despesas" ON public.expenses;
DROP POLICY IF EXISTS "Permitir exclusão de despesas" ON public.expenses;

-- Recriar políticas como PERMISSIVE (padrão)
-- Sales
CREATE POLICY "Permitir leitura de vendas" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de vendas" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de vendas" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de vendas" ON public.sales FOR DELETE USING (true);

-- Products
CREATE POLICY "Permitir leitura de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de produtos" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de produtos" ON public.products FOR DELETE USING (true);

-- Expenses
CREATE POLICY "Permitir leitura de despesas" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de despesas" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de despesas" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de despesas" ON public.expenses FOR DELETE USING (true);
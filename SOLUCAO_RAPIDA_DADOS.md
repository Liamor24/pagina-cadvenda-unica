# 🔧 SOLUÇÃO RÁPIDA: Dados Não Aparecem no Site

## O Problema
✅ Banco de dados tem dados
❌ Site não mostra nada

## A Causa Provável
**Row Level Security (RLS)** está bloqueando o acesso aos dados

## ⚡ Como Corrigir em 2 Minutos

### Passo 1: Abra o Supabase SQL Editor
1. Vá para: https://supabase.com
2. Seu projeto: `aaavxylbuwkyfpnzyzfx`
3. Clique em "SQL Editor"

### Passo 2: Cole e Execute Este SQL
```sql
-- Habilitar RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
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

-- Criar políticas permissivas
CREATE POLICY "Enable all sales" ON public.sales AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all products" ON public.products AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all expenses" ON public.expenses AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);
```

### Passo 3: Atualize o Site
- Abra o site: `http://localhost:5173`
- Limpe cache: `Ctrl+Shift+R`
- Veja os dados aparecerem! ✅

---

## 🧪 Se Ainda Não Funcionar

### Teste 1: Verificar Dados no SQL
```sql
SELECT COUNT(*) FROM public.sales;
SELECT * FROM public.sales LIMIT 1;
```

Se retorna dados = SQL funciona, problema é na política
Se retorna vazio = banco não tem dados

### Teste 2: Verificar Políticas
```sql
SELECT * FROM pg_policies WHERE tablename IN ('sales', 'products', 'expenses');
```

### Teste 3: Desabilitar RLS Temporariamente
```sql
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
```

Teste no site. Se funcionar = RLS é o problema.

---

## 📚 Arquivo Completo
Ver: `FIX_RLS_POLICIES.sql` para mais detalhes

---

**Sucesso!** Se seguiu os passos, os dados devem estar aparecendo agora. ✅

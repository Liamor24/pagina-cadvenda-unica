# 🔍 Diagnóstico: Dados Não Aparecem no Site

## ⚠️ Problema Identificado

**Status**: Banco de dados ALIMENTADO mas dados NÃO aparecem no site

---

## 🔎 Possíveis Causas

### 1. **Row Level Security (RLS) Bloqueando Acesso** 🔴 MAIOR PROBABILIDADE
Supabase tem RLS ativado mas:
- Políticas podem estar muito restritivas
- Usuário anônimo não tem permissão
- `auth.uid()` retorna NULL para usuários sem login

**Sintomas**:
```
✅ Banco de dados tem dados
❌ Site recebe array vazio []
❌ Console não mostra erro (retorno silencioso)
```

### 2. **RLS Policies Incorretas**
Arquivo: `/workspaces/pagina-cadvenda-unica/supabase/migrations/20250121030000_fix_database_structure.sql`

Políticas atuais:
```sql
CREATE POLICY "Permitir leitura de vendas" ON public.sales FOR SELECT USING (true);
```

Problema: `USING (true)` deveria funcionar, mas se a política está com erro pode não estar aplicada.

### 3. **Tipo de Cliente Supabase**
O cliente está configurado com `VITE_SUPABASE_PUBLISHABLE_KEY` (chave pública).
Sem autenticação (usuário anônimo), as políticas podem bloquear.

---

## ✅ Solução Rápida

### Opção A: Desabilitar RLS para Testes (TEMPORARY)

```sql
-- Conecte no Supabase SQL Editor e execute:

-- Desabilitar RLS temporariamente
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Teste se dados aparecem
-- Se aparecerem = problema é RLS
-- Se não aparecerem = problema é outro
```

### Opção B: Criar Políticas Permissivas (RECOMENDADO)

```sql
-- Se desabilitar RLS funcionou, execute isto no Supabase SQL Editor:

-- Enable RLS novamente
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop políticas antigas
DROP POLICY IF EXISTS "Permitir leitura de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir inserção de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir atualização de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir exclusão de vendas" ON public.sales;
DROP POLICY IF EXISTS "Permitir leitura de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON public.products;
DROP POLICY IF EXISTS "Permitir exclusão de produtos" ON public.products;

-- Criar novas políticas permissivas
CREATE POLICY "Allow select sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update sales" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Allow delete sales" ON public.sales FOR DELETE USING (true);

CREATE POLICY "Allow select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow select expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow delete expenses" ON public.expenses FOR DELETE USING (true);
```

---

## 🧪 Como Diagnosticar

### Passo 1: Verificar os Logs
```bash
# Abra o DevTools (F12)
# Vá para Console
# Procure por:
# - "Carregamento de vendas..." - aparece?
# - "Vendas carregadas com sucesso: 0" - retorna 0?
# - Erro específico do Supabase?
```

### Passo 2: Testar Query Diretamente
Cole isso no **Supabase SQL Editor**:
```sql
-- Teste 1: Verificar se há dados
SELECT COUNT(*) as total_vendas FROM public.sales;
SELECT * FROM public.sales LIMIT 5;

-- Teste 2: Verificar se há políticas
SELECT * FROM pg_policies WHERE tablename = 'sales';

-- Teste 3: Verificar RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'sales';
```

### Passo 3: Testar com curl (se houver dados)
```bash
# Copie a chave pública e URL do Supabase
curl -X GET "https://aaavxylbuwkyfpnzyzfx.supabase.co/rest/v1/sales?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📋 Checklist de Diagnóstico

- [ ] Banco tem dados? (verificar no Supabase Dashboard)
- [ ] RLS está ativado? (verificar em Settings → Security)
- [ ] Políticas estão criadas? (checklist do SQL)
- [ ] Console mostra erro ou retorna array vazio?
- [ ] Dados aparecem se desabilitar RLS?

---

## 🚀 Próximos Passos

1. **Execute o Passo 1** (verificar logs)
2. **Execute o Teste SQL** (Opção B) para confirmar
3. Se dados NÃO aparecem = RLS é o culpado
4. **Execute a Solução B** (políticas permissivas)
5. Teste novamente no site

---

## 📞 Se Ainda Não Funcionar

**Verifique também**:
- Credenciais do Supabase corretas?
- URL do Supabase correta em `.env.local`?
- Chave pública (anon) configurada corretamente?
- Tabelas existem mesmo no Supabase?

---

**Status**: 🔍 Aguardando diagnóstico

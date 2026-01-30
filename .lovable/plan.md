
# Plano: Corrigir Produtos Não Aparecendo nos Cards de Venda

## Problema Identificado

Os produtos cadastrados não estão aparecendo nos cards de venda porque as queries que buscam vendas usam apenas `select('*')` em vez de `select('*, products(*)')`.

Há dois lugares que precisam ser corrigidos:

1. **`src/pages/Index.tsx` (linha 54-56)**: A query inicial de vendas não inclui a relação com produtos
2. **`src/pages/APagar.tsx` (linha 40-42)**: Mesmo problema, causando também um erro de build TypeScript

## O Que Será Corrigido

### 1. Arquivo: `src/pages/Index.tsx`
**Localização**: Linhas 54-57

**Problema**: 
```typescript
const { data: salesData, error: salesError } = await supabase
  .from('sales')
  .select('*')  // ❌ Não inclui produtos
  .order('created_at', { ascending: false });
```

**Solução**:
```typescript
const { data: salesData, error: salesError } = await supabase
  .from('sales')
  .select('*, products(*)')  // ✅ Inclui produtos relacionados
  .order('created_at', { ascending: false });
```

### 2. Arquivo: `src/pages/APagar.tsx`
**Localização**: Linhas 40-43

**Problema**: Mesmo que acima - a query não inclui produtos e o código tenta acessar `sale.products`, causando erro TypeScript.

**Solução**: Alterar a query para incluir `products(*)` na seleção.

## Detalhes Técnicos

A tabela `products` possui uma foreign key `sale_id` que referencia `sales.id`. O Supabase permite fazer joins automáticos usando a sintaxe `select('*, products(*)')`, que retorna cada venda com seus produtos associados.

O código de transformação (`transformSalesData`) já está preparado para receber os produtos na linha 36-42 do Index.tsx:
```typescript
products: sale.products ? sale.products.map((product: any) => ({
  id: product.id,
  productRef: product.product_ref,
  ...
})) : []
```

O problema é que sem a inclusão na query, `sale.products` sempre será `undefined`, resultando em um array vazio.

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Alterar `.select('*')` para `.select('*, products(*)')` |
| `src/pages/APagar.tsx` | Alterar `.select('*')` para `.select('*, products(*)')` |

## Resultado Esperado

Após a correção:
- Os cards de venda exibirão os produtos com seus valores de compra, venda e lucro
- O botão "Ver Produtos" mostrará a lista completa de produtos de cada venda
- O erro de build TypeScript será resolvido
- Os cálculos de valor total e lucro funcionarão corretamente

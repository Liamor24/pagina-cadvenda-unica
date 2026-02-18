
## Problemas Identificados

### 1. Data errada abaixo do nome do cliente
No arquivo `SalesList.tsx` (linha 137), o sistema mostra a **Data de Pagamento** (`paymentDate`) em vez da **Data da Compra** (`purchaseDate`). Alem disso, o uso de `new Date()` para formatar causa deslocamento de fuso horario (a data pode pular um dia ou um mes).

### 2. Erros de build com tabela "produtos"
Os arquivos `Index.tsx` e `APagar.tsx` tentam acessar uma tabela chamada `produtos` que nao existe no banco de dados. O TypeScript rejeita isso porque o tipo gerado so conhece `products`, `sales` e `expenses`.

---

## Plano de Correcao

### Passo 1 - Corrigir a data exibida no card da venda
- Em `SalesList.tsx` linha 137, trocar `sale.paymentDate` por `sale.purchaseDate`
- Usar parsing manual da string de data (formato `YYYY-MM-DD`) para evitar problemas de fuso horario:
  ```
  const [y, m, d] = sale.purchaseDate.split('-');
  exibir: `${d}/${m}/${y}`
  ```

### Passo 2 - Corrigir o formatDate no SalesForm
- Em `SalesForm.tsx` linha 44-46, trocar `toISOString().split('T')[0]` por formatacao local usando `getFullYear()`, `getMonth()`, `getDate()` para evitar que a data inicial ja venha errada

### Passo 3 - Remover referencias a tabela "produtos"
- Em `Index.tsx`: remover as chamadas `supabase.from('produtos')` (linhas ~52-55 e ~325-328) e a funcao `enrichSalesWithProdutos`
- Em `APagar.tsx`: remover o bloco que tenta buscar da tabela `produtos` (linhas ~76-79)
- Essa tabela nunca existiu no banco atual; os dados de produtos estao na tabela `products`

---

## Detalhes Tecnicos

Arquivos modificados:
- `src/components/SalesList.tsx` - corrigir campo de data e formatacao
- `src/components/SalesForm.tsx` - corrigir funcao formatDate
- `src/pages/Index.tsx` - remover referencias a 'produtos'
- `src/pages/APagar.tsx` - remover referencias a 'produtos'

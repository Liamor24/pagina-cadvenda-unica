

## Correcoes e Melhorias

### 1. Corrigir contagem de parcelas (SalesList.tsx)

**Problema:** A contagem de parcelas mostra as restantes em ordem decrescente (6/6, 5/6...). O correto e mostrar quantas ja foram pagas: 1/6, 2/6, 3/6...

**Solucao:** Na linha 194-198 de `SalesList.tsx`, inverter a logica: em vez de contar parcelas restantes (`remaining`), contar parcelas pagas (`paid = total - remaining`) e exibir `paid/total parcelas`.

```
const paid = sale.installmentDates.filter(d => d !== null && d !== undefined && new Date(d) < now).length;
return `${paid}/${sale.installments} parcelas`;
```

### 2. Botao de olho para ocultar valores (Index.tsx + SalesList.tsx)

**Problema:** O usuario quer poder ocultar os valores de "Valor Total de Compra" e "Lucro Total" nos cards de venda.

**Solucao:**
- Adicionar um estado `hideValues` no componente `Index.tsx`
- Criar um botao com icone `Eye` / `EyeOff` no topo da pagina (proximo ao titulo ou filtros)
- Passar `hideValues` como prop para `SalesList`
- No `SalesList`, quando `hideValues` for `true`, substituir os valores monetarios de "Valor Total de Compra" e "Lucro Total" por `R$ ••••••`

**Arquivos modificados:**
- `src/pages/Index.tsx` - estado + botao de olho
- `src/components/SalesList.tsx` - nova prop + logica de ocultar valores

### 3. Corrigir erros de build (referencias a tabela 'produtos')

**Problema:** Os arquivos `Index.tsx` e `APagar.tsx` referenciam uma tabela `produtos` que nao existe no esquema do banco. O TypeScript rejeita isso.

**Solucao:** Remover todos os blocos que tentam buscar da tabela `produtos`:
- `Index.tsx`: remover a funcao `enrichSalesWithProdutos` (linhas 46-90) e os dois blocos de fallback dentro dos handlers de realtime (linhas 255-275 e 322-342)
- `APagar.tsx`: remover o bloco de compatibilidade (linhas 72-104)

Os dados de produtos ja vem corretamente pela tabela `products` via relation nas queries principais.

---

### Detalhes Tecnicos

**SalesList.tsx - Prop nova:**
```typescript
interface SalesListProps {
  sales: Sale[];
  onDeleteSale: (saleId: string) => void;
  onEditSale: (sale: Sale) => void;
  onUpdateSale?: (sale: Partial<Sale> & { id: string }) => void | Promise<void>;
  selectedMonth?: string;
  hideValues?: boolean;  // NOVA
}
```

**Index.tsx - Botao de olho:**
- Importar `Eye` e `EyeOff` de `lucide-react`
- Estado: `const [hideValues, setHideValues] = useState(false)`
- Botao no topo da pagina com toggle
- Passar `hideValues={hideValues}` para `<SalesList />`

**Campos ocultados quando `hideValues=true`:**
- "Valor Total de Compra" (grid col 1)
- "Lucro Total" (grid col 2)
- Os valores dentro de "Ver Produtos" (compra, venda, lucro por produto)


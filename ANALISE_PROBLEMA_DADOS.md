# Análise: Dados não aparecem após pausa do banco Supabase

## 🔴 Problemas Identificados

### 1. **Sem validação de sessão após reconexão**
**Localização**: `src/integrations/supabase/client.ts`

O cliente Supabase está configurado com `persistSession: true`, mas **não há verificação** se a sessão ainda é válida quando o banco retorna online.

```typescript
// ANTES (sem validação)
const { data, error } = await supabase.from('sales').select(...);
```

**Impacto**: Se a sessão expirou durante a pausa, as consultas falham silenciosamente.

---

### 2. **Sem retry logic nas requisições**
**Localização**: `src/pages/Index.tsx` e `src/pages/APagar.tsx`

As requisições são feitas uma única vez no `useEffect` com dependência vazia `[]`. Se falharem (ex: banco pausado), não há tentativa de reconexão.

```typescript
// ANTES (tenta uma única vez)
useEffect(() => {
  const fetchSales = async () => {
    const { data, error } = await supabase.from('sales').select(...);
    // Se falhar aqui, nunca mais tenta
  };
  fetchSales();
}, []);
```

**Impacto**: Dados não carregam quando o banco está indisponível temporariamente.

---

### 3. **Realtime sem reconexão automática**
**Localização**: `src/pages/Index.tsx` (linha ~127)

O canal de realtime fica desconectado após a pausa do banco e **não reconecta automaticamente**.

```typescript
// ANTES (sem tratamento de reconexão)
.subscribe();
// Se desconectar, fica desconectado
```

**Impacto**: Atualizações em tempo real param de funcionar após pausa do banco.

---

### 4. **Sem monitoramento de conexão**
Não há heartbeat ou validação periódica da conexão com o banco de dados.

**Impacto**: Usuário não sabe se o banco desconectou ou não.

---

## ✅ Soluções Implementadas

### 1. **Utilitário `supabase-utils.ts`**
Novo arquivo: `src/utils/supabase-utils.ts`

Implementa:
- **`executeWithRetry()`**: Executa operações com retry automático (5 tentativas, backoff exponencial)
- **`validateSupabaseConnection()`**: Valida se a conexão está ativa
- **`waitForSupabaseConnection()`**: Aguarda conexão ficar disponível (max 30s)
- **`setupConnectionHeartbeat()`**: Monitora conexão periodicamente

```typescript
// AGORA (com retry)
const salesData = await executeWithRetry(async () => {
  const { data, error } = await supabase.from('sales').select(...);
  if (error) throw error;
  return data;
}, 'Carregamento de vendas');
```

**Benefícios**:
- Retry automático com backoff exponencial + jitter
- Max 5 tentativas com delay crescente (1s → 30s)
- Log detalhado de cada tentativa

---

### 2. **Hook `useSuperbaseDataWithRetry()`**
Novo arquivo: `src/hooks/use-supabase-data-retry.ts`

Custom hook para simplificar carregamento de dados:

```typescript
const { data, loading, error, retry } = useSuperbaseDataWithRetry(
  fetchSalesFn,
  'Carregamento de vendas'
);
```

**Benefícios**:
- Encapsula lógica de retry
- Gerencia loading/error states automaticamente
- Método `retry()` para retentar manualmente

---

### 3. **Atualização do `Index.tsx`**
Mudanças implementadas:

✅ **Importa `executeWithRetry`**
```typescript
import { executeWithRetry } from "@/utils/supabase-utils";
```

✅ **Usa retry no carregamento de vendas**
```typescript
const salesData = await executeWithRetry(async () => {
  const { data, error } = await supabase.from('sales').select(...);
  if (error) throw new Error(...);
  return data || [];
}, 'Carregamento de vendas');
```

✅ **Usa retry no carregamento de despesas**
```typescript
const expensesData = await executeWithRetry(async () => {
  const { data, error } = await supabase.from('expenses').select(...);
  if (error) throw new Error(...);
  return data || [];
}, 'Carregamento de despesas');
```

✅ **Realtime com reconexão automática**
```typescript
.subscribe((status) => {
  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    // Tenta reconectar a cada 5 segundos
    reconnectInterval = setInterval(() => {
      setupRealtimeChannel();
    }, 5000);
  }
});
```

---

### 4. **Atualização do `APagar.tsx`**
Mudanças implementadas:

✅ **Importa `executeWithRetry`**
✅ **Usa retry no carregamento de vendas e despesas**

---

## 🔄 Como o fluxo funciona agora

```
Usuário acessa a página
    ↓
useEffect executa fetchSales()
    ↓
executeWithRetry(fetchSales, 'Carregamento de vendas')
    ↓
Tentativa 1: falha (banco pausado)
    ↓ (aguarda 1 segundo)
Tentativa 2: falha
    ↓ (aguarda 2 segundos)
Tentativa 3: SUCESSO ✅
    ↓
Dados são carregados e exibidos
```

---

## 📊 Resultado Esperado

### Antes:
- ❌ Dados desaparecem quando banco é pausado
- ❌ Nenhuma tentativa de reconexão automática
- ❌ Usuário fica vendo tela vazia indefinidamente

### Depois:
- ✅ Retry automático com 5 tentativas (durando ~30 segundos)
- ✅ Dados são carregados quando banco retorna
- ✅ Realtime reconecta automaticamente
- ✅ Logs detalhados para debug

---

## 🧪 Como testar

1. **Teste de pausa do banco**:
   - Abra o site com dados carregados
   - Pause o banco no Supabase Dashboard
   - Observe os logs (F12 → Console)
   - Veja as tentativas de retry
   - Retome o banco
   - Dados reaparecem automaticamente

2. **Teste de reconexão realtime**:
   - Abra o site em duas abas
   - Pause o banco
   - Crie uma nova venda em uma aba
   - Retome o banco
   - Verifique se a venda aparece em ambas as abas

3. **Verifique os logs**:
```
[Carregamento de vendas] Tentativa 1/5
[Carregamento de vendas] Erro na tentativa 1: ...
[Carregamento de vendas] Aguardando 1045ms antes da próxima tentativa...
[Carregamento de vendas] Tentativa 2/5
...
[Carregamento de vendas] Sucesso!
```

---

## 📝 Próximas Melhorias Sugeridas

1. **Cache local de dados**: Armazenar dados em localStorage como fallback
2. **UI de status**: Mostrar banner quando desconectado
3. **Limite de timeout**: Se passar de 5 minutos, parar de tentar
4. **Service Worker**: Para funcionalidade offline

---

## 📚 Referências

- [Supabase Error Handling](https://supabase.com/docs/guides/api/errors)
- [Exponential Backoff Strategy](https://en.wikipedia.org/wiki/Exponential_backoff)
- [React useEffect Best Practices](https://react.dev/reference/react/useEffect)

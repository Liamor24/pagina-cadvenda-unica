# 🚀 Guia de Deploy - Solução para Dados Desaparecidos

## ✅ Checklist de Deploy

### 1. Validação Local
- [ ] Todos os arquivos foram criados/modificados
- [ ] Sem erros TypeScript/ESLint
- [ ] Aplicação compila sem warnings
- [ ] Testes passam

```bash
# Verificar erros
npm run lint
npm run type-check

# Build
npm run build
```

### 2. Testes Manuais

#### Teste A: Carregamento com Sucesso
- [ ] Abrir site e ver dados carregados
- [ ] Verificar logs no console: "Vendas carregadas com sucesso"

#### Teste B: Pausa do Banco
- [ ] Pause o banco Supabase
- [ ] Observe os logs: "Tentativa 1/5", "Tentativa 2/5", etc.
- [ ] Retome o banco
- [ ] Dados reaparecem automaticamente

#### Teste C: Reconexão Realtime
- [ ] Abra o site em duas abas
- [ ] Crie dados na aba 1
- [ ] Veja em tempo real na aba 2
- [ ] Pause o banco
- [ ] Crie mais dados na aba 1
- [ ] Retome o banco
- [ ] Dados sincronizam nas duas abas

#### Teste D: Console Logs
- [ ] Abra F12 → Console
- [ ] Busque por "[Carregamento de"
- [ ] Verifique que mostra as tentativas

### 3. Verificação de Performance

```bash
# Medir tamanho do bundle
npm run build && ls -lh dist/

# Testar com throttling
# No DevTools: Network → Slow 3G
# Verificar se retry funciona corretamente
```

### 4. Documentação

- [ ] Leia [SOLUCAO_DADOS_DESAPARECIDOS.md](./SOLUCAO_DADOS_DESAPARECIDOS.md)
- [ ] Leia [ANALISE_PROBLEMA_DADOS.md](./ANALISE_PROBLEMA_DADOS.md)
- [ ] Documentação técnica está atualizada
- [ ] Comentários de código estão claros

---

## 📋 Mudanças para Revisar

### Arquivos Novos
```
✨ src/utils/supabase-utils.ts (100 linhas)
✨ src/hooks/use-supabase-data-retry.ts (40 linhas)
✨ ANALISE_PROBLEMA_DADOS.md (documentação)
✨ SOLUCAO_DADOS_DESAPARECIDOS.md (guia)
```

### Arquivos Modificados
```
🔄 src/pages/Index.tsx
   - +1 import (executeWithRetry)
   - +1 função auxiliar (transformSalesData)
   - ~30 linhas modificadas em 3 useEffect
   
🔄 src/pages/APagar.tsx
   - +1 import (executeWithRetry)
   - ~30 linhas modificadas em 2 useEffect
```

---

## 🔍 Code Review Checklist

- [ ] Imports estão corretos
- [ ] Tipos TypeScript são válidos
- [ ] Nenhuma variável não utilizada
- [ ] Nenhum console.log de debug (deixar os logs de [Carregamento])
- [ ] Tratamento de erro é robusto
- [ ] Memory leaks não existem (cleanup em useEffect)
- [ ] Performance não foi degradada

---

## 🧪 Teste Automatizado Sugerido

```typescript
// __tests__/supabase-utils.test.ts
describe('executeWithRetry', () => {
  it('deve fazer retry ao falhar', async () => {
    let attempts = 0;
    const fn = jest.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'success';
    });
    
    const result = await executeWithRetry(fn, 'test');
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('deve falhar após 5 tentativas', async () => {
    const fn = jest.fn(async () => {
      throw new Error('Always fails');
    });
    
    await expect(executeWithRetry(fn, 'test')).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(5);
  });
});
```

---

## 🚨 Rollback Rápido

Se algo der errado, há um backup:

```bash
# Restaurar arquivos originais
cp src/pages/Index.tsx.backup src/pages/Index.tsx
```

---

## 📊 Métricas para Monitorar

Após deploy, monitore:

1. **Taxa de Erros de Conexão**
   - Deve reduzir significativamente
   - Antes: Alta taxa de falhas após pausa
   - Depois: Dados recuperam automaticamente

2. **Tempo de Carregamento**
   - Sem piora em caso de sucesso
   - Com retry: +1-2 segundos em caso de falha

3. **Logs de Reconnect**
   - Verifique frequência de reconexões
   - Se muito alta, pode indicar problema na rede

4. **Taxa de Sucesso**
   - Deve ser próxima a 100% após 30 segundos

---

## 🔔 Monitoramento Pós-Deploy

### Semanal
- [ ] Verificar se dados desaparecem
- [ ] Confirmar reconexão automática funciona
- [ ] Validar logs de erro no console

### Mensal
- [ ] Análise de padrões de desconexão
- [ ] Revisar performance
- [ ] Avaliar necessidade de melhorias

---

## 🎯 Critério de Sucesso

✅ **Deploy será bem-sucedido quando:**
1. Site carrega dados normalmente
2. Pausa de banco → dados reaparecem automaticamente
3. Realtime reconecta após desconexão
4. Logs mostram tentativas de retry
5. Nenhum erro no console
6. Performance não foi degradada

---

## ❓ Troubleshooting

### Dados ainda não carregam
- [ ] Verificar logs: F12 → Console
- [ ] Ver quantas tentativas foram feitas
- [ ] Validar credenciais do Supabase
- [ ] Testar conexão manualmente

### Retry não está funcionando
- [ ] Verificar que `executeWithRetry` foi importado
- [ ] Verificar que está sendo usado corretamente
- [ ] Limpar cache: Ctrl+Shift+R

### Realtime não reconecta
- [ ] Verificar se `setupRealtimeChannel` é chamado
- [ ] Verificar se reconnectInterval está sendo criado
- [ ] Testar manualmente pausando banco

---

## 📞 Contato & Suporte

Se tiver dúvidas sobre a implementação:
1. Leia [ANALISE_PROBLEMA_DADOS.md](./ANALISE_PROBLEMA_DADOS.md)
2. Verifique os logs no console
3. Teste com o banco pausado

---

**Deploy Ready** ✅ - 27/01/2026

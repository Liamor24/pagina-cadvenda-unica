# 🤖 Passo a Passo: Configurar Uptime Robot (COM SCREENSHOTS)

## ⏱️ Tempo: 2-3 minutos

---

## 📝 Passo 1: Registrar no Uptime Robot

1. Acesse: **https://uptimerobot.com**

2. Você verá tela como esta:
   ```
   ┌─────────────────────────────────────┐
   │  Uptime Robot                       │
   │  Status Page | Pricing | Sign Up   │
   └─────────────────────────────────────┘
   ```

3. Clique em **"Sign Up"** (canto superior direito)

4. Preencha:
   ```
   Email:    seu-email@gmail.com
   Password: senha-forte-aqui
   ```

5. Confirme seu email (vai receber um link no email)

6. Faça log in com suas credenciais

---

## ➕ Passo 2: Criar Monitor

1. Na dashboard, veja:
   ```
   ┌────────────────────────────────┐
   │  My Monitors                   │
   │  [+ Add New Monitor]           │
   └────────────────────────────────┘
   ```

2. Clique em **"+ Add New Monitor"**

3. Você verá formulário como este:
   ```
   ┌─────────────────────────────────────────┐
   │  Create New Monitor                    │
   │                                        │
   │  Monitor Type:  [HTTP(s)] ✓           │
   │                 [Keyword] 
   │                 [Ping]
   │                                        │
   │  Friendly Name:                        │
   │  [____________________________]        │
   │                                        │
   │  URL (or IP):                          │
   │  [____________________________]        │
   │                                        │
   │  Monitoring Interval:                  │
   │  [5 minutes] ✓                        │
   │                                        │
   │               [Create Monitor]         │
   └─────────────────────────────────────────┘
   ```

---

## ✍️ Passo 3: Preencher Monitor

### Campo 1: Monitor Type
```
Selecione:  HTTP(s)  ✓  (já vem selecionado)
```

### Campo 2: Friendly Name
```
Digite:  Supabase Heartbeat - Cadvenda
         
Ou:      Supabase Keep-Alive
         
Ou:      Database Ping
```

### Campo 3: URL (IMPORTANTE!)
```
Digite exatamente:

https://hdbrkxlmrzvhwdegzlqf.supabase.co/rest/v1/sales?limit=1

NÃO mude o Project ID (hdbrkxlmrzvhwdegzlqf)
```

### Campo 4: Monitoring Interval
```
Selecione:  5 minutes  ✓  (recomendado)

Alternativas:
- 1 minute (mais caro, não necessário)
- 10 minutes (ok também)
- 30 minutes (pode deixar pausar)
```

### Campo 5: HTTP Method
```
Selecione:  GET  ✓  (padrão)
```

---

## 🔐 Passo 4: Headers (OPCIONAL mas RECOMENDADO)

1. Veja se aparece seção "Advanced Settings"
2. Se aparecer, expanda
3. Procure por "Headers"
4. Clique em "Add Header"
5. Adicione:

```
Header Name:   apikey
Header Value:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYnJreGxtcnp2aHdkZWd6bHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzAwOTQsImV4cCI6MjA3NjUwNjA5NH0.4X97L1eLX6frGlVo7ezQt_qjRRKqjnGM5mBZZreVOHY
```

**Ou deixe em branco** (Supabase público funciona sem auth também)

---

## ✅ Passo 5: Criar Monitor

1. Scroll para baixo
2. Clique em **"Create Monitor"**
3. Espere carregar...
4. Você verá:
   ```
   ┌──────────────────────────────────┐
   │  ✓ Monitor Created Successfully  │
   │                                  │
   │  Supabase Heartbeat - Cadvenda   │
   │  Status: Up                      │
   │  Uptime: 100%                    │
   │  Response Time: 145ms            │
   └──────────────────────────────────┘
   ```

---

## 🧪 Passo 6: Testar Monitor

### Opção A: Teste Automático
1. Na tela do monitor, clique em **"Check Now"** ou **"Test"**
2. Espere 10 segundos
3. Deve retornar:
   ```
   ✓ 200 OK
   Response Time: 145ms
   ```

### Opção B: Teste Manual (Terminal)
```bash
curl -i "https://hdbrkxlmrzvhwdegzlqf.supabase.co/rest/v1/sales?limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Deve retornar:
# HTTP/1.1 200 OK
# [{"id":1, ...}, ...]
```

---

## 🔔 Passo 7: Configurar Alertas (OPCIONAL)

Se quiser ser alertado quando site cair:

1. No monitor, clique em **"Alert Contacts"**
2. Clique em **"+ Add Alert Contact"**
3. Escolha tipo:
   - **Email**: Recebe notificação por email
   - **SMS**: Recebe por SMS (pode pagar)
   - **Slack**: Integra com Slack (se tiver)
   - **Discord**: Integra com Discord

4. Configure seu email ou conta
5. Clique em **"Save"**

**Agora quando site cair, você é notificado!**

---

## 📊 Passo 8: Monitorar Status

Agora que está configurado:

1. A cada 5 minutos, Uptime Robot faz:
   ```
   GET https://hdbrkxlmrzvhwdegzlqf.supabase.co/rest/v1/sales?limit=1
   ```

2. Supabase recebe a requisição e detecta atividade

3. Não pausa o projeto

4. Você pode ver histórico em:
   - Dashboard do Uptime Robot
   - Clique no monitor
   - Vá em "Details"
   - Veja log de checks

---

## 📈 Verificar Status

### No Dashboard:
```
┌────────────────────────────────────┐
│  My Monitors                       │
│                                   │
│  Supabase Heartbeat - Cadvenda   │
│  Status: ✓ Up                    │
│  Uptime: 100%                    │
│  Response Time: 145ms ▼          │
│  Last Check: Just now            │
│                                   │
│  [View Details]  [Edit]  [Delete] │
└────────────────────────────────────┘
```

### Detalhes (Clique em "View Details"):
```
┌───────────────────────────────────┐
│  Monitor Details                  │
│  Supabase Heartbeat - Cadvenda   │
│                                  │
│  Status: ✓ Up                   │
│  Uptime (30 days): 99.9%         │
│  Average Response: 145ms         │
│                                  │
│  Last 10 Checks:                │
│  ✓ Jan 27, 10:30 (145ms)       │
│  ✓ Jan 27, 10:25 (234ms)       │
│  ✓ Jan 27, 10:20 (189ms)       │
│  ✓ Jan 27, 10:15 (156ms)       │
│  ... (continua)                 │
└───────────────────────────────────┘
```

---

## ✨ Resumo do Que Você Fez

1. ✅ Registrou no Uptime Robot
2. ✅ Criou monitor para Supabase
3. ✅ Configurou intervalo de 5 minutos
4. ✅ (Opcional) Adicionou headers de segurança
5. ✅ (Opcional) Configurou alertas por email
6. ✅ Testou e verificou status

**Resultado:**
```
🟢 Projeto Supabase monitorado 24/7
🟢 Faz ping a cada 5 minutos automaticamente
🟢 NUNCA pausa novamente
🟢 Você é notificado se algo der errado
```

---

## 🎯 O Que Acontece Agora?

### Timeline:
```
Minuto 0:     Uptime Robot faz GET request
              ↓
              Supabase recebe e ativa
              ↓
              Status: 200 OK ✓

Minuto 5:     Uptime Robot faz GET request
              ↓
              Supabase detecta atividade
              ↓
              Status: 200 OK ✓

Minuto 10:    ... (continua)

Minuto 7 dias: Supabase vê atividade contínua
              ↓
              NÃO PAUSA (problema resolvido!)
```

---

## ❓ Dúvidas Comuns

**P: Preciso colocar senha?**
R: Não. Supabase é público para leitura. Header apikey é opcional.

**P: Por que está tão lento a resposta?**
R: Normal. Supabase responde em 100-500ms. Uptime Robot registra isso.

**P: Posso fazer teste agora?**
R: Sim! Clique em "Check Now" no monitor. Deve retornar ✓ em segundos.

**P: Quanto custa?**
R: Grátis! Uptime Robot oferece 50 monitors grátis por mês.

**P: Precisa rodando sempre?**
R: Sim, deixe rodando eternamente. Não mude nada depois que criar.

---

## 🚀 Pronto!

Você configurou com sucesso:

✅ Keep-Alive Frontend (automático no site)
✅ Uptime Robot (monitoramento 24/7)

**Seu projeto Supabase NUNCA mais pausará!**

---

## 📌 Links Úteis

- **Uptime Robot**: https://uptimerobot.com
- **Supabase Project**: https://hdbrkxlmrzvhwdegzlqf.supabase.co
- **Documentação Supabase**: https://supabase.com/docs

---

**Data:** 27 de Janeiro de 2026
**Status:** ✅ CONFIGURADO
**Resultado:** Problema resolvido permanentemente!

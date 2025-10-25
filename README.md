# 🛍️ Sistema de Controle de Vendas - Ellas Concept

Sistema completo de gestão de vendas desenvolvido com React, TypeScript, Vite e Supabase.

## ✨ Funcionalidades

- **📊 Controle de Vendas**: Cadastro, edição e exclusão de vendas
- **📦 Gestão de Produtos**: Produtos vinculados às vendas com controle de lucro
- **💰 Formas de Pagamento**: PIX à vista e parcelamento
- **📅 Controle de Parcelas**: Gestão de parcelas com datas e valores
- **📈 Relatórios**: Cálculos automáticos de lucro e totais
- **🔍 Filtros**: Filtro por mês e busca de vendas
- **💾 Persistência**: Dados salvos no Supabase (banco de dados em nuvem)

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7.1.12
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para executar

1. **Clone o repositório**
```bash
git clone https://github.com/mariliasantoz/pagina-cadvenda-unica.git
cd pagina-cadvenda-unica
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute a aplicação**
```bash
npm run dev
```

4. **Acesse a aplicação**
```
http://localhost:8080
```

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **sales**: Vendas com informações do cliente, datas e forma de pagamento
- **products**: Produtos vinculados às vendas
- **expenses**: Despesas (página "A Pagar")

### Relacionamentos

- Uma venda pode ter múltiplos produtos
- Produtos são vinculados às vendas via `sale_id`
- Exclusão em cascata: ao excluir uma venda, seus produtos são removidos

## 🔧 Configuração do Supabase

O projeto está configurado para usar o Supabase como backend. As configurações estão em:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

## 📱 Páginas do Sistema

1. **Controle de Vendas** (`/`) - Página principal com cadastro e listagem de vendas
2. **A Pagar** (`/a-pagar`) - Controle de despesas e contas a pagar

## 🎯 Funcionalidades Implementadas

### ✅ Vendas
- Cadastro completo de vendas
- Edição de vendas existentes
- Exclusão de vendas
- Filtro por mês
- Busca por cliente
- Cálculo automático de lucro

### ✅ Produtos
- Múltiplos produtos por venda
- Controle de referência
- Valores de compra e venda
- Cálculo individual de lucro

### ✅ Pagamentos
- PIX à vista
- Parcelamento com controle de datas
- Entrada/adiantamento
- Desconto aplicado

### ✅ Persistência
- Dados salvos no Supabase
- Sincronização automática
- Backup em nuvem
- Não perde dados ao atualizar a página

## 🚀 Deploy

O projeto pode ser deployado em qualquer plataforma que suporte React:

- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Railway**

## 📄 Licença

Este projeto é privado e pertence à Ellas Concept.

## 👥 Desenvolvimento

Sistema desenvolvido com foco em:
- **Performance**: Carregamento rápido e responsivo
- **Usabilidade**: Interface intuitiva e fácil de usar
- **Confiabilidade**: Dados sempre seguros e sincronizados
- **Escalabilidade**: Preparado para crescimento

---

**© 2025 Ellas Concept - Sistema de Controle de Vendas**
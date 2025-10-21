export const APP_CONFIG = {
  // Formatação de moeda
  currencyFormat: {
    locale: 'pt-BR',
    currency: 'BRL',
    options: {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    },
  },

  // Configurações de datas
  dateFormat: {
    locale: 'pt-BR',
    display: 'dd/MM/yyyy',
    input: 'yyyy-MM-dd',
  },

  // Limites e validações
  validation: {
    maxInstallments: 12,
    minInstallmentValue: 50,
    maxDiscountPercentage: 30,
  },

  // Configurações de paginação
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },

  // Categorias de despesas
  expenseCategories: [
    'Aluguel',
    'Energia',
    'Água',
    'Internet',
    'Telefone',
    'Transporte',
    'Alimentação',
    'Manutenção',
    'Material',
    'Marketing',
    'Impostos',
    'Outros',
  ],

  // Métodos de pagamento
  paymentMethods: {
    pix: 'PIX',
    cash: 'Dinheiro',
    creditCard: 'Cartão de Crédito',
    debitCard: 'Cartão de Débito',
    installments: 'Parcelado',
  },

  // Status das vendas
  saleStatus: {
    paid: 'Quitado',
    pending: 'Pendente',
    partial: 'Parcialmente Pago',
  },
};
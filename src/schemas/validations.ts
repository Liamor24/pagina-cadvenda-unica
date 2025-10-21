import { z } from 'zod';
import { APP_CONFIG } from '@/config/constants';

export const productSchema = z.object({
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  product_ref: z.string().min(1, 'Referência é obrigatória'),
  purchase_value: z.number().min(0, 'Valor de compra deve ser maior que zero'),
  sale_value: z.number().min(0, 'Valor de venda deve ser maior que zero'),
});

export const saleSchema = z.object({
  customer_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  purchase_date: z.string().min(1, 'Data da compra é obrigatória'),
  payment_date: z.string().min(1, 'Data do pagamento é obrigatória'),
  payment_method: z.string().min(1, 'Método de pagamento é obrigatório'),
  installments: z.number().nullable(),
  advance_payment: z.number().nullable(),
  installment_dates: z.array(z.string()).nullable(),
  installment_values: z.array(z.number()).nullable(),
  discount: z.number()
    .min(0, 'Desconto não pode ser negativo')
    .max(APP_CONFIG.validation.maxDiscountPercentage, 
      `Desconto máximo permitido é ${APP_CONFIG.validation.maxDiscountPercentage}%`),
  products: z.array(productSchema).min(1, 'Adicione pelo menos um produto'),
});

export const expenseSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  valor_total: z.number().min(0, 'Valor deve ser maior que zero'),
  data: z.string().min(1, 'Data é obrigatória'),
  mes_referencia: z.string().min(1, 'Mês de referência é obrigatório'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  parcelas: z.number().nullable(),
  parcela_atual: z.number().nullable(),
  observacao: z.string().nullable(),
});
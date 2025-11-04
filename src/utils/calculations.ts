import { APP_CONFIG } from '@/config/constants';

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(APP_CONFIG.dateFormat.locale);
};

export const calculateInstallmentValue = (
  total: number,
  installments: number,
  discount: number = 0
): number => {
  const discountedTotal = total - (total * (discount / 100));
  return Math.round((discountedTotal / installments) * 100) / 100;
};

export const calculateTotalWithDiscount = (
  total: number,
  discount: number = 0
): number => {
  return total - (total * (discount / 100));
};

export const calculateProfit = (
  saleValue: number,
  purchaseValue: number,
  discount: number = 0
): number => {
  const finalSaleValue = calculateTotalWithDiscount(saleValue, discount);
  return finalSaleValue - purchaseValue;
};

export const generateInstallmentDates = (
  startDate: Date,
  installments: number
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < installments; i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

export const generateInstallmentValues = (
  total: number,
  installments: number,
  discount: number = 0
): number[] => {
  const installmentValue = calculateInstallmentValue(total, installments, discount);
  const values: number[] = Array(installments).fill(installmentValue);

  // Ajusta centavos na última parcela para evitar problemas de arredondamento
  const discountedTotal = calculateTotalWithDiscount(total, discount);
  const sum = installmentValue * installments;
  const diff = discountedTotal - sum;
  if (diff !== 0) {
    values[values.length - 1] += diff;
  }

  return values;
};

export const validateInstallment = (
  value: number,
  installments: number
): boolean => {
  if (installments <= 0) return false;
  const installmentValue = value / installments;
  return installmentValue >= APP_CONFIG.validation.minInstallmentValue;
};

export const validateDiscount = (discount: number): boolean => {
  return (
    discount >= 0 && 
    discount <= APP_CONFIG.validation.maxDiscountPercentage
  );
};
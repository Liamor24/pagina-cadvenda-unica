import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/components/SalesForm";
import { Input } from "@/components/ui/input";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import { supabase } from '@/integrations/supabase/client';
import logo from "@/assets/ellas-logo.jpeg";
export interface Expense {
  id: string;
  descricao: string;
  categoria: "Estoque" | "Embalagens" | "Fornecedor" | "Despesa Operacional" | "Outros";
  data: string;
  valorTotal: number;
  formaPagamento: "PIX" | "Parcelado";
  parcelas?: number;
  parcelaAtual?: number;
  mesReferencia: string;
  observacao?: string;
  pagoEm?: string | null;
}
// Helpers para fallback quando a coluna pago_em não existe no banco
const extractPagoEmFromObservation = (obs?: string | null): string | null => {
  if (!obs) return null;
  const m = obs.match(/pago_em[:=]\s*(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

const mergePagoEmIntoObservation = (existing: string | null | undefined, pagoEm: string | null | undefined): string | null => {
  const base = existing || "";
  // remove marcador antigo se existir
  const cleaned = base.replace(/\s*pago_em[:=]\s*\d{4}-\d{2}-\d{2}\s*/g, " ").trim();
  if (!pagoEm) return cleaned.length ? cleaned : null;
  const marker = `pago_em=${pagoEm}`;
  return cleaned ? `${cleaned} ${marker}` : marker;
};
const APagar = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("TODOS");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);

  // Fetch sales from Supabase when component mounts
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            products (*)
          `)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('Error fetching sales:', salesError);
          return;
        }

        if (salesData && salesData.length > 0) {
          const transformedSales: Sale[] = salesData.map(sale => ({
            id: sale.id,
            customerName: sale.customer_name,
            purchaseDate: sale.purchase_date,
            paymentDate: sale.payment_date,
            paymentMethod: sale.payment_method as "pix" | "installment",
            installments: sale.installments,
            installmentValues: Array.isArray(sale.installment_values) ? (sale.installment_values as number[]) : [],
            installmentDates: Array.isArray(sale.installment_dates) ? (sale.installment_dates as string[]) : [],
            advancePayment: sale.advance_payment,
            discount: sale.discount,
            products: sale.products ? sale.products.map(product => ({
              id: product.id,
              productRef: product.product_ref,
              productName: product.product_name,
              purchaseValue: product.purchase_value,
              saleValue: product.sale_value
            })) : []
          }));

          setSales(transformedSales);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();
  }, []);

  // Fetch expenses from Supabase when component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });

        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
          return;
        }

        if (expensesData && expensesData.length > 0) {
          const transformedExpenses: Expense[] = expensesData.map(expense => ({
            id: expense.id,
            descricao: expense.descricao,
            categoria: expense.categoria as "Despesa Operacional" | "Embalagens" | "Estoque" | "Fornecedor" | "Outros",
            data: expense.data,
            valorTotal: expense.valor_total,
            formaPagamento: expense.forma_pagamento as "PIX" | "Parcelado",
            parcelas: expense.parcelas,
            parcelaAtual: expense.parcela_atual,
            mesReferencia: expense.mes_referencia,
            observacao: expense.observacao,
            pagoEm: null
          }));

          setExpenses(transformedExpenses);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  // Removed localStorage persistence since we're using Supabase now
  const handleExpenseAdded = async (newExpenses: Expense[]) => {
    try {
      // Insert expenses and/or installments
      for (const exp of newExpenses) {
        const { data: inserted, error } = await supabase.from('expenses').insert({
          descricao: exp.descricao,
          categoria: exp.categoria,
          data: exp.data,
          valor_total: exp.valorTotal,
          forma_pagamento: exp.formaPagamento,
          parcelas: exp.parcelas ?? null,
          parcela_atual: exp.parcelaAtual ?? null,
          mes_referencia: exp.mesReferencia,
          observacao: exp.observacao ?? null,
        }).select('id').single();

        if (error) throw error;

        const persisted = { ...exp, id: inserted.id };
        setExpenses(prev => [...prev, persisted]);
      }
    } catch (err) {
      console.error('Error inserting expenses to Supabase:', err);
      // fallback local
      setExpenses(prev => [...prev, ...newExpenses]);
    }
  };
  const handleExpenseUpdated = async (updatedExpense: Expense) => {
    try {
      const { error } = await supabase.from('expenses').update({
        descricao: updatedExpense.descricao,
        categoria: updatedExpense.categoria,
        data: updatedExpense.data,
        valor_total: updatedExpense.valorTotal,
        forma_pagamento: updatedExpense.formaPagamento,
        parcelas: updatedExpense.parcelas ?? null,
        parcela_atual: updatedExpense.parcelaAtual ?? null,
        mes_referencia: updatedExpense.mesReferencia,
        observacao: updatedExpense.observacao ?? null,
      }).eq('id', updatedExpense.id);

      if (error) throw error;
      setExpenses(expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
      setEditingExpense(null);
    } catch (err) {
      console.error('Error updating expense in Supabase:', err);
      setExpenses(expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
      setEditingExpense(null);
    }
  };

  // Atualização parcial (ex.: marcar parcela como paga/reverter)
  const handleUpdateExpensePartial = async (patch: Partial<Expense> & { id: string }) => {
    try {
      const updatePayload: Record<string, any> = {};
      if (patch.descricao !== undefined) updatePayload.descricao = patch.descricao;
      if (patch.categoria !== undefined) updatePayload.categoria = patch.categoria;
      if (patch.data !== undefined) updatePayload.data = patch.data;
      if (patch.valorTotal !== undefined) updatePayload.valor_total = patch.valorTotal;
      if (patch.formaPagamento !== undefined) updatePayload.forma_pagamento = patch.formaPagamento;
      if (patch.parcelas !== undefined) updatePayload.parcelas = patch.parcelas;
      if (patch.parcelaAtual !== undefined) updatePayload.parcela_atual = patch.parcelaAtual;
      if (patch.mesReferencia !== undefined) updatePayload.mes_referencia = patch.mesReferencia;
      if (patch.observacao !== undefined) updatePayload.observacao = patch.observacao;

      const { error } = await supabase.from('expenses').update(updatePayload).eq('id', patch.id);
      if (error) throw error;

      setExpenses(prev => prev.map(e => e.id === patch.id ? { ...e, ...patch } : e));
    } catch (err: any) {
      console.warn('Falha ao atualizar despesa no Supabase.', err?.message || err);
      setExpenses(prev => prev.map(e => e.id === patch.id ? { ...e, ...patch } : e));
    }
  };
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      
      // Update local state
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense from Supabase:', err);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    }
  };

  // Filtrar despesas por mês
  const filteredExpenses = selectedMonth === "TODOS" ? expenses : expenses.filter(e => e.mesReferencia === selectedMonth);

  // Calcular meses disponíveis
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const parseMesReferenciaStart = (mesRef: string): Date => {
    const [mesPt, anoStr] = mesRef.split(' ');
    const mesIdx = monthNames.indexOf(mesPt);
    const ano = parseInt(anoStr, 10);
    return new Date(ano, mesIdx, 1);
  };
  const availableMonths = Array.from(new Set(expenses.map(e => e.mesReferencia))).sort((a, b) => {
    const [mesA, anoA] = a.split(' ');
    const [mesB, anoB] = b.split(' ');
    const dateA = new Date(`${anoA}-${String(monthNames.indexOf(mesA) + 1).padStart(2, '0')}-01`);
    const dateB = new Date(`${anoB}-${String(monthNames.indexOf(mesB) + 1).padStart(2, '0')}-01`);
    return dateA.getTime() - dateB.getTime();
  });

  // Cálculos de resumo
  // Excluir do total do mês parcelas que foram pagas ANTES do mês de vencimento (mesReferencia)
  const totalMes = filteredExpenses.reduce((sum, e) => {
    const vencimentoInicio = parseMesReferenciaStart(e.mesReferencia);
    const pagoEmDate = e.pagoEm ? new Date(e.pagoEm) : null;
    const pagoAntesDoMes = !!(pagoEmDate && pagoEmDate < vencimentoInicio);
    return pagoAntesDoMes ? sum : sum + e.valorTotal;
  }, 0);
  const totalGeral = expenses.reduce((sum, e) => sum + e.valorTotal, 0);

  // Calcular total de vendas para o mês selecionado
  const totalVendas = sales.reduce((sum, sale) => {
    if (selectedMonth === "TODOS") {
      // Para vendas PIX, usa o valor total
      if (sale.paymentMethod === "pix") {
        return sum + sale.products.reduce((p, product) => p + product.saleValue, 0);
      }
      // Para vendas parceladas, soma todas as parcelas
      if (sale.installmentValues) {
        return sum + sale.installmentValues.reduce((p, value) => p + value, 0);
      }
      return sum;
    }

    // Filtrando por mês específico
    if (sale.paymentMethod === "pix") {
      const saleMonth = new Date(sale.paymentDate).toLocaleString('pt-BR', {
        month: 'long'
      }).replace(/^./, c => c.toUpperCase()) + " " + new Date(sale.paymentDate).getFullYear();
      if (saleMonth === selectedMonth) {
        return sum + sale.products.reduce((p, product) => p + product.saleValue, 0);
      }
    } else if (sale.installmentDates && sale.installmentValues) {
      const monthIndex = sale.installmentDates.findIndex(date => {
        const installmentMonth = new Date(date).toLocaleString('pt-BR', {
          month: 'long'
        }).replace(/^./, c => c.toUpperCase()) + " " + new Date(date).getFullYear();
        return installmentMonth === selectedMonth;
      });
      if (monthIndex >= 0 && sale.installmentValues[monthIndex]) {
        return sum + sale.installmentValues[monthIndex];
      }
    }
    return sum;
  }, 0);

  // Categoria principal
  const categoriasAgrupadas = filteredExpenses.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + e.valorTotal;
    return acc;
  }, {} as Record<string, number>);
  const [categoriaNome, categoriaValor] = Object.entries(categoriasAgrupadas).sort(([, a], [, b]) => b - a)[0] || ["Nenhuma", 0];

  // Última despesa
  const ultimaDespesa = expenses.length > 0 ? [...expenses].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0] : null;
  return <div className="min-h-screen bg-background">
      {/* Header */}
  <header className="bg-card/70 backdrop-blur-md border-b border-border/40 shadow-md sticky top-0 z-50 backdrop-saturate-110">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Ellas Concept" className="h-12 md:h-16 w-auto rounded-lg" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  A Pagar
                </h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Controle de compras e despesas mensais
                </p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/">Vendas</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="max-w-xs">
            <Label htmlFor="month-filter">Filtrar por mês</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-filter">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">TODOS</SelectItem>
                {availableMonths.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-xs relative">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Input id="search" className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800/30 text-center group hover:scale-105 transition-transform">
            <p className="text-blue-600 dark:text-blue-300 mb-1 group-hover:text-blue-700 transition-colors font-bold text-lg">
              Total a receber<br />
              <span className="text-[10px] opacity-75">({selectedMonth === "TODOS" ? "Todos os meses" : selectedMonth})</span>
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              R$ {totalVendas.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-4 rounded-xl shadow-lg border border-rose-100 dark:border-rose-800/30 text-center group hover:scale-105 transition-transform">
            <p className="text-rose-600 dark:text-rose-300 mb-1 group-hover:text-rose-700 transition-colors text-lg font-bold">
              Total a Pagar<br />
              <span className="text-[10px] opacity-75">({selectedMonth === "TODOS" ? "Todos os meses" : selectedMonth})</span>
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              R$ {totalMes.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Resumo Comparativo - só aparece quando um mês está selecionado */}
        {selectedMonth !== "TODOS" && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className={`p-6 rounded-xl shadow-lg border-2 transition-all ${
              totalVendas >= totalMes 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-400 dark:border-green-600' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-400 dark:border-red-600'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-semibold mb-2 ${
                  totalVendas >= totalMes ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {totalVendas >= totalMes ? '✓ Receitas cobrem as despesas' : '⚠ Receitas não cobrem as despesas'}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <p className="text-xs opacity-75">Diferença</p>
                    <p className={`text-3xl font-bold ${
                      totalVendas >= totalMes ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      R$ {Math.abs(totalVendas - totalMes).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-xs opacity-75">
                    <div>{totalVendas >= totalMes ? 'de saldo positivo' : 'de déficit'}</div>
                    <div className="mt-1 font-semibold">
                      {totalVendas > 0 ? `(${((totalVendas - totalMes) / totalVendas * 100).toFixed(1)}%)` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="mb-8 max-w-[70%] mx-auto">
          <ExpenseForm onExpenseAdded={handleExpenseAdded} editingExpense={editingExpense} onExpenseUpdated={handleExpenseUpdated} />
        </div>

        {/* Lista de Despesas */}
        <ExpenseList expenses={filteredExpenses} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} onUpdateExpense={handleUpdateExpensePartial} />
      </main>
    </div>;
};
export default APagar;
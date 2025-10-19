import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
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
}

const APagar = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("TODOS");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (error) {
        console.error("Erro ao carregar despesas:", error);
      }
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleExpenseAdded = (newExpenses: Expense[]) => {
    setExpenses([...expenses, ...newExpenses]);
  };

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    setExpenses(expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(exp => exp.id !== expenseId));
  };

  // Filtrar despesas por mês
  const filteredExpenses = selectedMonth === "TODOS" 
    ? expenses 
    : expenses.filter(e => e.mesReferencia === selectedMonth);

  // Calcular meses disponíveis
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  const availableMonths = Array.from(new Set(
    expenses.map(e => e.mesReferencia)
  )).sort((a, b) => {
    const [mesA, anoA] = a.split(' ');
    const [mesB, anoB] = b.split(' ');
    const dateA = new Date(`${anoA}-${String(monthNames.indexOf(mesA) + 1).padStart(2, '0')}-01`);
    const dateB = new Date(`${anoB}-${String(monthNames.indexOf(mesB) + 1).padStart(2, '0')}-01`);
    return dateA.getTime() - dateB.getTime();
  });

  // Cálculos de resumo
  const totalMes = filteredExpenses.reduce((sum, e) => sum + e.valorTotal, 0);
  const totalGeral = expenses.reduce((sum, e) => sum + e.valorTotal, 0);

  // Categoria principal
  const categoriasAgrupadas = filteredExpenses.reduce((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + e.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  const [categoriaNome, categoriaValor] = Object.entries(categoriasAgrupadas)
    .sort(([, a], [, b]) => b - a)[0] || ["Nenhuma", 0];

  // Última despesa
  const ultimaDespesa = expenses.length > 0 
    ? [...expenses].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-md sticky top-0 z-50">
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
        {/* Filtro de Mês */}
        <div className="mb-6 max-w-xs">
          <Label htmlFor="month-filter">Filtrar por mês</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month-filter">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">TODOS</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Card de Resumo */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="bg-gradient-to-br from-card to-red-50 dark:to-red-950/20 p-6 rounded-xl shadow-md border">
            <CardTitle className="text-sm text-muted-foreground mb-1">
              Total a Pagar (mes)
            </CardTitle>
            <CardContent className="text-3xl font-bold text-foreground p-0">
              R$ {totalMes.toFixed(2)}
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        <div className="mb-8 max-w-[70%] mx-auto">
          <ExpenseForm 
            onExpenseAdded={handleExpenseAdded}
            editingExpense={editingExpense}
            onExpenseUpdated={handleExpenseUpdated}
          />
        </div>

        {/* Lista de Despesas */}
        <ExpenseList 
          expenses={filteredExpenses}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      </main>
    </div>
  );
};

export default APagar;

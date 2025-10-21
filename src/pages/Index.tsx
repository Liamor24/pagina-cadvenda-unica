import { useState, useEffect } from "react";
import { SalesForm, type Sale } from "@/components/SalesForm";
import { SalesList } from "@/components/SalesList";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/ellas-logo.jpeg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Expense } from "@/pages/APagar";
import { Link } from "react-router-dom";

const Index = () => {
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const raw = localStorage.getItem('sales');
      return raw ? JSON.parse(raw) as Sale[] : [];
    } catch (e) {
      console.error('Erro ao ler vendas do localStorage', e);
      return [];
    }
  });
  const [selectedMonth, setSelectedMonth] = useState<string>("total");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const raw = localStorage.getItem('expenses');
      return raw ? JSON.parse(raw) as Expense[] : [];
    } catch (e) {
      console.error('Erro ao ler despesas do localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sales', JSON.stringify(sales));
    } catch (e) {
      console.error('Erro ao salvar vendas no localStorage', e);
    }
  }, [sales]);

  const handleSaleAdded = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
    setEditingSale(null);
  };

  const handleSaleUpdated = (updatedSale: Sale) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setEditingSale(null);
    toast({
      title: "Venda atualizada!",
      description: "A venda foi atualizada com sucesso.",
    });
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSale = (saleId: string) => {
    setSales(prev => prev.filter(s => s.id !== saleId));
    toast({
      title: "Venda removida!",
      description: "A venda foi excluída com sucesso.",
    });
  };

  // Função para filtrar vendas por mês
  const filterSalesByMonth = (sales: Sale[]) => {
    if (selectedMonth === "total") return sales;
    
    return sales.filter(sale => {
      if (sale.paymentMethod === "pix") {
        // Para vendas PIX, usa a data de pagamento
        const paymentDate = new Date(sale.paymentDate);
        const saleMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        return saleMonth === selectedMonth;
      } else if (sale.paymentMethod === "installment" && sale.installmentDates) {
        // Para vendas parceladas, mostra se tiver alguma parcela no mês selecionado
        return sale.installmentDates.some(date => {
          const installmentDate = new Date(date);
          const installmentMonth = `${installmentDate.getFullYear()}-${String(installmentDate.getMonth() + 1).padStart(2, '0')}`;
          return installmentMonth === selectedMonth;
        });
      }
      return false;
    });
  };

  const filteredSales = filterSalesByMonth(sales);

  // Gerar lista de meses disponíveis das vendas (ordem cronológica)
  const availableMonths = Array.from(new Set(
    sales.flatMap(sale => {
      if (sale.paymentMethod === "pix") {
        const date = new Date(sale.paymentDate);
        return [`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`];
      } else if (sale.installmentDates) {
        // Para vendas parceladas, inclui todas as datas de parcelas
        return sale.installmentDates.map(dateStr => {
          const date = new Date(dateStr);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        });
      }
      return [];
    })
  )).sort();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getMonthLabel = (monthValue: string) => {
    const [year, month] = monthValue.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const totalProfit = filteredSales.reduce((sum, sale) => {
    const saleProfit = sale.products.reduce((p, product) => p + (product.saleValue - product.purchaseValue), 0);
    return sum + saleProfit;
  }, 0);
  
  const totalSales = filteredSales.reduce((sum, sale) => {
    const saleTotal = sale.products.reduce((p, product) => p + product.saleValue, 0);
    return sum + saleTotal;
  }, 0);

  // Calcula total de despesas para o mês selecionado
  const totalExpenses = expenses.reduce((sum, expense) => {
    if (selectedMonth === "total") {
      return sum + expense.valorTotal;
    }

    const expenseMonth = new Date(expense.data)
      .toLocaleString('pt-BR', { month: 'long' })
      .replace(/^./, c => c.toUpperCase()) + " " + new Date(expense.data).getFullYear();

    // Convertendo o formato do mês para coincidir com o formato das despesas
    const selectedMonthFormatted = getMonthLabel(selectedMonth);

    if (expenseMonth === selectedMonthFormatted) {
      return sum + expense.valorTotal;
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
  <header className="bg-card/70 backdrop-blur-md border-b border-border/40 shadow-[var(--shadow-card)] sticky top-0 z-50 backdrop-saturate-110">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Ellas Concept" className="h-12 md:h-16 w-auto" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Controle de Vendas
                </h1>
                <p className="text-sm text-muted-foreground hidden md:block">Gestão elegante e eficiente</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/a-pagar">A Pagar</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        {sales.length > 0 && (
          <div className="mb-6 flex gap-4 items-end">
            <div className="max-w-xs">
              <Label htmlFor="month-filter" className="text-foreground mb-2 block">Filtrar por mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-filter" className="bg-card">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total (Todos os meses)</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {getMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs relative">
              <Label htmlFor="search" className="text-foreground mb-2 block">Buscar</Label>
              <div className="relative">
                <Input
                  id="search"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {sales.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 p-6 rounded-2xl shadow-lg border border-violet-100/50 dark:border-violet-800/30 text-center group hover:scale-105 transition-transform">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2 group-hover:text-violet-800 transition-colors">Total de Vendas</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{filteredSales.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-2xl shadow-lg border border-blue-100/50 dark:border-blue-800/30 text-center group hover:scale-105 transition-transform">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 group-hover:text-blue-800 transition-colors">
                Total a receber<br/>
                <span className="text-xs opacity-75">({selectedMonth === "total" ? "Todos os meses" : getMonthLabel(selectedMonth)})</span>
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                R$ {totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-6 rounded-2xl shadow-lg border border-rose-100/50 dark:border-rose-800/30 text-center group hover:scale-105 transition-transform">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-2 group-hover:text-rose-800 transition-colors">
                Total a Pagar<br/>
                <span className="text-xs opacity-75">({selectedMonth === "total" ? "Todos os meses" : getMonthLabel(selectedMonth)})</span>
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 rounded-2xl shadow-lg border border-emerald-100/50 dark:border-emerald-800/30 text-center group hover:scale-105 transition-transform">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 group-hover:text-emerald-800 transition-colors">Lucro Total</p>
              <p className={`text-3xl font-bold ${
                totalProfit >= 0 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                : 'bg-gradient-to-r from-rose-600 to-red-600'
              } bg-clip-text text-transparent`}>
                R$ {totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Sales Form */}
        <div className="mb-8">
          <SalesForm 
            onSaleAdded={handleSaleAdded} 
            editingSale={editingSale}
            onSaleUpdated={handleSaleUpdated}
          />
        </div>

        {/* Sales List */}
        <SalesList 
          sales={filteredSales} 
          onDeleteSale={handleDeleteSale}
          onEditSale={handleEditSale}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Ellas Concept - Sistema de Controle de Vendas</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

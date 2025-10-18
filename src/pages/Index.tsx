import { useState } from "react";
import { SalesForm, type Sale } from "@/components/SalesForm";
import { SalesList } from "@/components/SalesList";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/ellas-logo.jpeg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("total");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const handleSaleAdded = (sale: Sale) => {
    setSales([sale, ...sales]);
    setEditingSale(null);
  };

  const handleSaleUpdated = (updatedSale: Sale) => {
    setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s));
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
    setSales(sales.filter(s => s.id !== saleId));
    toast({
      title: "Venda removida!",
      description: "A venda foi excluída com sucesso.",
    });
  };

  // Função para filtrar vendas por mês
  const filterSalesByMonth = (sales: Sale[]) => {
    if (selectedMonth === "total") return sales;
    
    return sales.filter(sale => {
      const paymentDate = new Date(sale.paymentDate);
      const saleMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      return saleMonth === selectedMonth;
    });
  };

  const filteredSales = filterSalesByMonth(sales);

  // Gerar lista de meses disponíveis das vendas (ordem cronológica)
  const availableMonths = Array.from(new Set(
    sales.map(sale => {
      const date = new Date(sale.paymentDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-[var(--shadow-card)] sticky top-0 z-50">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filter */}
        {sales.length > 0 && (
          <div className="mb-6 max-w-xs">
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
        )}

        {/* Statistics Cards */}
        {sales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-card to-primary/5 p-6 rounded-xl shadow-[var(--shadow-card)] border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
              <p className="text-3xl font-bold text-foreground">{filteredSales.length}</p>
            </div>
            <div className="bg-gradient-to-br from-card to-accent/5 p-6 rounded-xl shadow-[var(--shadow-card)] border border-border">
              <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
              <p className="text-3xl font-bold text-foreground">R$ {totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-card to-green-50 p-6 rounded-xl shadow-[var(--shadow-card)] border border-border">
              <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

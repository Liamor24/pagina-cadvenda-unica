import { useState } from "react";
import { SalesForm, type Sale } from "@/components/SalesForm";
import { SalesList } from "@/components/SalesList";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/ellas-logo.jpeg";

const Index = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  const handleSaleAdded = (sale: Sale) => {
    setSales([sale, ...sales]);
  };

  const handleDeleteSale = (saleId: string) => {
    setSales(sales.filter(s => s.id !== saleId));
    toast({
      title: "Venda removida!",
      description: "A venda foi excluída com sucesso.",
    });
  };

  const totalProfit = sales.reduce((sum, sale) => {
    const saleProfit = sale.products.reduce((p, product) => p + (product.saleValue - product.purchaseValue), 0);
    return sum + saleProfit;
  }, 0);
  
  const totalSales = sales.reduce((sum, sale) => {
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
        {/* Statistics Cards */}
        {sales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-card to-primary/5 p-6 rounded-xl shadow-[var(--shadow-card)] border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
              <p className="text-3xl font-bold text-foreground">{sales.length}</p>
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
          <SalesForm onSaleAdded={handleSaleAdded} />
        </div>

        {/* Sales List */}
        <SalesList sales={sales} onDeleteSale={handleDeleteSale} />
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

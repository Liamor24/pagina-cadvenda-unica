import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sale } from "./SalesForm";
import { Calendar, TrendingUp, DollarSign, Trash2 } from "lucide-react";

interface SalesListProps {
  sales: Sale[];
  onDeleteSale: (saleId: string) => void;
}

export const SalesList = ({ sales, onDeleteSale }: SalesListProps) => {
  if (sales.length === 0) {
    return (
      <Card className="p-12 text-center shadow-[var(--shadow-card)]">
        <p className="text-muted-foreground text-lg">Nenhuma venda cadastrada ainda.</p>
        <p className="text-sm text-muted-foreground mt-2">Adicione sua primeira venda usando o formulário acima.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Vendas Cadastradas</h2>
      {sales.map((sale) => {
        const totalPurchaseValue = sale.products.reduce((sum, p) => sum + p.purchaseValue, 0);
        const totalSaleValue = sale.products.reduce((sum, p) => sum + p.saleValue, 0);
        const profit = totalSaleValue - totalPurchaseValue;
        const currentInstallment = sale.paymentMethod === "installment" && sale.installmentValues 
          ? sale.installmentValues[0] 
          : totalSaleValue;

        return (
          <Card 
            key={sale.id} 
            className="p-6 shadow-[var(--shadow-card)] border-border transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)] hover:scale-[1.01]"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{sale.customerName}</h3>
                <p className="text-sm text-muted-foreground">{sale.products.length} produto(s)</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={sale.paymentMethod === "pix" ? "default" : "secondary"} className="w-fit">
                  {sale.paymentMethod === "pix" ? "PIX" : `${sale.installments}x`}
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteSale(sale.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Produtos:</h4>
              {sale.products.map((product) => {
                const productProfit = product.saleValue - product.purchaseValue;
                return (
                  <div key={product.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">Ref: {product.productRef}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Compra</p>
                          <p className="font-medium text-foreground">R$ {product.purchaseValue.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Venda</p>
                          <p className="font-medium text-foreground">R$ {product.saleValue.toFixed(2)}</p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-xs text-muted-foreground">Lucro</p>
                          <p className={`font-medium ${productProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {productProfit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <DollarSign className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total de Compra</p>
                  <p className="text-lg font-semibold text-foreground">R$ {totalPurchaseValue.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Lucro Total</p>
                  <p className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {profit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Parcela do Mês</p>
                  <p className="text-lg font-bold text-foreground">R$ {currentInstallment.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4">
              <div>
                <span className="font-medium">Data da Compra:</span> {new Date(sale.purchaseDate).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Data de Pagamento:</span> {new Date(sale.paymentDate).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Valor Total de Venda:</span> R$ {totalSaleValue.toFixed(2)}
              </div>
              {sale.advancePayment && sale.advancePayment > 0 && (
                <div>
                  <span className="font-medium">Entrada/Adiantamento:</span> <span className="text-green-600">R$ {sale.advancePayment.toFixed(2)}</span>
                </div>
              )}
            </div>

            {sale.paymentMethod === "installment" && sale.installmentValues && (
              <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-foreground mb-2">Detalhes das Parcelas:</p>
                <div className="flex flex-wrap gap-2">
                  {sale.installmentValues.map((value, index) => {
                    const installmentDate = sale.installmentDates?.[index];
                    const formattedDate = installmentDate 
                      ? new Date(installmentDate).toLocaleDateString('pt-BR')
                      : '';
                    return (
                      <Badge key={index} variant="outline" className="text-xs">
                        {index + 1}ª {formattedDate && `(${formattedDate})`}: R$ {value.toFixed(2)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

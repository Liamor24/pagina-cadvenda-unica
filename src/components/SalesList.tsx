import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sale } from "./SalesForm";
import { Calendar, TrendingUp, DollarSign, Trash2, Pencil, Check, RotateCcw } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SalesListProps {
  sales: Sale[];
  onDeleteSale: (saleId: string) => void;
  onEditSale: (sale: Sale) => void;
  onUpdateSale?: (sale: Partial<Sale> & { id: string }) => void | Promise<void>;
    selectedMonth?: string; // Make selectedMonth optional
}

export const SalesList = ({ sales, onDeleteSale, onEditSale, onUpdateSale, selectedMonth }: SalesListProps) => {
  if (sales.length === 0) {
    return (
      <Card className="w-full shadow-lg rounded-xl border">
        <div className="p-8 text-center">
          <p className="text-muted-foreground text-lg">Nenhuma venda cadastrada ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">Adicione sua primeira venda usando o formulário acima.</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Vendas Cadastradas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sales
          .sort((a, b) => {
            // Verificar se está quitado (todas as parcelas pagas => nenhuma data null e todas as datas < now)
            const isFullyPaid = (sale: Sale) => {
              if (sale.paymentMethod !== "installment") return false;
              if (!sale.installmentDates || sale.installmentDates.length === 0) return false;
              const now = new Date();
              // Considera quitado somente se todas as installmentDates forem não-nulas e anteriores à data atual
              return sale.installmentDates.every(d => d !== null && new Date(d) < now);
            };

            const aQuitado = isFullyPaid(a);
            const bQuitado = isFullyPaid(b);

            // Quitados vão para o final
            if (aQuitado !== bQuitado) return aQuitado ? 1 : -1;

            // Se ambos são parcelados, compara parcelas restantes (mais restantes = mais prioridade)
            if (a.paymentMethod === "installment" && b.paymentMethod === "installment") {
              const now = new Date();
              const aRestantes = (a.installmentDates || []).filter(d => !d || new Date(d) > now).length;
              const bRestantes = (b.installmentDates || []).filter(d => !d || new Date(d) > now).length;
              if (aRestantes !== bRestantes) return bRestantes - aRestantes;
            }

            // Por fim, ordena por data mais recente
            return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
          })
          .map((sale) => {
            // Verificar status de quitado: somente quando todas as parcelas estão pagas (nenhuma é null e todas < now)
            const isQuitado = sale.paymentMethod === "installment" &&
              Array.isArray(sale.installmentDates) &&
              sale.installmentDates.length > 0 &&
              sale.installmentDates.every(d => d !== null && new Date(d) < new Date());

            const totalPurchaseValue = sale.products.reduce((sum, p) => sum + p.purchaseValue, 0);
            const totalSaleValue = sale.products.reduce((sum, p) => sum + p.saleValue, 0);
            const profit = totalSaleValue - totalPurchaseValue;
            const currentInstallment = sale.paymentMethod === "installment" && sale.installmentValues 
              ? sale.installmentValues[0] 
              : totalSaleValue;
            const installmentForSelectedMonth = (() => {
              if (sale.paymentMethod === 'pix') {
                if (selectedMonth === 'total') return totalSaleValue;
                const paymentDate = new Date(sale.paymentDate);
                const saleMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
                return saleMonth === selectedMonth ? totalSaleValue : 0;
              }

              if (sale.paymentMethod === 'installment' && sale.installmentValues && sale.installmentDates) {
                if (selectedMonth === 'total') {
                  const now = new Date();
                  const nextIdx = sale.installmentDates.findIndex(d => !d || new Date(d) > now);
                  const idx = nextIdx === -1 ? sale.installmentValues.length - 1 : nextIdx;
                  return sale.installmentValues[idx] ?? 0;
                }

                const idx = sale.installmentDates.findIndex(d => {
                  if (!d) return false;
                  const date = new Date(d);
                  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  return month === selectedMonth;
                });
                if (idx === -1) return 0;
                return sale.installmentValues[idx] ?? 0;
              }

              return 0;
            })();

            return (
              <Card 
                key={sale.id} 
                className={`w-full shadow-md hover:shadow-lg transition-shadow border ${
                  isQuitado ? "opacity-75 grayscale" : ""
                }`}
              >
                <div className="p-4 relative">
                  {isQuitado && (
                    <div className="absolute -rotate-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold border-2 border-red-500 rounded px-2 py-1 z-10">
                      QUITADO
                    </div>
                  )}

                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{sale.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(sale.paymentDate).toLocaleDateString('pt-BR')}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total (descontos aplicados)</div>
                          <div className="text-lg font-bold">R$ {(totalSaleValue - (sale.discount || 0)).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditSale(sale)}
                        title="Editar venda"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" title="Excluir venda">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta venda?
                              {sale.paymentMethod === "installment" && (
                                <span className="block mt-2 font-semibold text-foreground">
                                  Atenção: Todas as parcelas desta venda serão excluídas.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteSale(sale.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={sale.paymentMethod === "pix" ? "default" : "outline"}>
                      {sale.paymentMethod === "pix" ? "PIX" : `${sale.installments}x`}
                    </Badge>
                        {sale.paymentMethod === "installment" && (
                      <span className="text-sm text-muted-foreground">
                        {/* parcelas abertas restantes */}
                        {(() => {
                          if (!Array.isArray(sale.installmentDates)) return `0/${sale.installments} parcelas`;
                          const now = new Date();
                          const remaining = sale.installmentDates.filter(d => !d || new Date(d) > now).length;
                          return `${remaining}/${sale.installments} parcelas`;
                        })()}
                      </span>
                    )}
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
                        <p className="text-lg font-bold text-foreground">R$ {installmentForSelectedMonth.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {sale.paymentMethod === "installment" && sale.installmentValues && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Ver Parcelas
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="border rounded-lg overflow-hidden">
                          {sale.installmentValues.map((value, index) => {
                            const installmentDate = sale.installmentDates?.[index];
                            const isPaid = installmentDate !== null && installmentDate !== undefined && new Date(installmentDate) < new Date();
                            
                            return (
                              <div
                                key={index}
                                className={`p-3 flex items-center justify-between ${
                                  index !== sale.installmentValues!.length - 1 ? "border-b" : ""
                                } bg-muted/30`}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">Parcela {index + 1}/{sale.installments}</p>
                                  {installmentDate && (
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(installmentDate).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <p className="font-semibold">R$ {value.toFixed(2)}</p>
                                  {isPaid && (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600">
                                      Pago
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-2 ml-3">
                                    {/* Marcar como Pago */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={async () => {
                                        const dates = Array.isArray(sale.installmentDates) ? [...(sale.installmentDates as (string | null)[])] : Array(sale.installmentValues.length).fill(null);
                                        dates[index] = new Date().toISOString().split('T')[0];
                                        if (typeof (onUpdateSale) === 'function') await onUpdateSale({ id: sale.id, installmentDates: dates as string[] });
                                      }}
                                      title="Marcar como Pago"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>

                                    {/* Reverter pagamento */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        const dates = Array.isArray(sale.installmentDates) ? [...(sale.installmentDates as (string | null)[])] : Array(sale.installmentValues.length).fill(null);
                                        dates[index] = null;
                                        if (typeof (onUpdateSale) === 'function') await onUpdateSale({ id: sale.id, installmentDates: dates as string[] });
                                      }}
                                      title="Reverter pagamento"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  <Collapsible className="mt-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Ver Produtos
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-2">
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
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default SalesList;
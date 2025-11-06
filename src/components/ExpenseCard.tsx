import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Expense } from "@/pages/APagar";
import { useState } from "react";

interface ExpenseCardProps {
  expense: Expense;
  installments?: Expense[];
  isPaid?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (grupoId: string) => void;
  getCategoryBadge: (categoria: Expense["categoria"]) => JSX.Element;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const ExpenseCard = ({
  expense,
  installments,
  isPaid = false,
  onEdit,
  onDelete,
  getCategoryBadge,
  formatCurrency,
  formatDate,
}: ExpenseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasInstallments = expense.formaPagamento === "Parcelado" && installments && installments.length > 1;

  // Para despesas parceladas, o valor total é sempre o mesmo em todas as parcelas
  // Para despesas únicas, usamos o valorTotal da própria despesa
  const totalValue = expense.formaPagamento === "Parcelado" && expense.parcelas && expense.parcelas > 1
    ? expense.valorTotal * expense.parcelas
    : expense.valorTotal;

  // Pegar valor da parcela atual baseado no mês de referência da despesa
  const currentValue = expense.valorTotal;

  const isQuitado = isPaid;

  // Data de compra: se parcelado, usar a menor data das parcelas; caso contrário, usar a própria data
  const purchaseDateStr = (() => {
    if (Array.isArray(installments) && installments.length > 0) {
      const earliest = installments
        .map(it => new Date(it.data))
        .reduce((min, d) => (d < min ? d : min), new Date(installments[0].data));
      return earliest.toLocaleDateString('pt-BR');
    }
    return formatDate(expense.data);
  })();

  // Entradas únicas não possuem ações de pagar/reverter; status é derivado pela data

  return (
    <Card 
      className={`w-full shadow-md hover:shadow-lg transition-shadow border ${
        isQuitado ? "opacity-75 grayscale" : ""
      }`}
    >
      <CardHeader className="pb-3 relative">
        {isQuitado && (
          <div className="absolute -rotate-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold border-2 border-red-500 rounded px-2 py-1 z-10">
            QUITADO
          </div>
        )}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">{expense.descricao}</CardTitle>
                <CardDescription className="text-sm">{purchaseDateStr}</CardDescription>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(totalValue)} {expense.formaPagamento === "Parcelado" && <span className="text-sm font-normal text-muted-foreground">(Total)</span>}</div>
                {expense.formaPagamento === "Parcelado" && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(currentValue)} ({expense.mesReferencia})
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">{getCategoryBadge(expense.categoria)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(expense)}
              title="Editar despesa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" title="Excluir despesa">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta despesa?
                    {expense.formaPagamento === "Parcelado" && (
                      <span className="block mt-2 font-semibold text-destructive">
                        ⚠️ ATENÇÃO: Todas as {expense.parcelas} parcelas desta compra serão excluídas permanentemente.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(expense.grupo_id || expense.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={expense.formaPagamento === "PIX" ? "default" : "outline"}>
            {expense.formaPagamento}
          </Badge>
          {expense.formaPagamento === "Parcelado" && (
            <span className="text-sm text-muted-foreground">
              {/* Mostrar parcela atual / total de parcelas */}
              {expense.parcelaAtual || 1}/{expense.parcelas} parcelas
            </span>
          )}
        </div>

        {/* Removido: ações de pagar/reverter para PIX ou 1 parcela */}

        {expense.observacao && (() => {
          const displayObs = expense.observacao.replace(/\s*pago_em[:=]\s*\d{4}-\d{2}-\d{2}\s*/g, ' ').trim();
          return displayObs ? (
            <div>
              <p className="text-sm text-muted-foreground">Observação</p>
              <p className="text-sm">{displayObs}</p>
            </div>
          ) : null;
        })()}

        {hasInstallments && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <div className="w-full">
                <Button variant="outline" className="w-full mt-2" onClick={() => setIsOpen(v => !v)}>
                  <span className="flex-1 text-left">VER MAIS</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
                <div className="border rounded-lg overflow-hidden">
                  {installments
                    .sort((a, b) => (a.parcelaAtual || 0) - (b.parcelaAtual || 0))
                    .map((installment, idx) => (
                      <div
                        key={installment.id}
                        className={`p-3 flex items-center justify-between ${
                          idx !== installments.length - 1 ? "border-b" : ""
                        } bg-muted/30`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">Parcela {installment.parcelaAtual}/{installment.parcelas}</p>
                          <p className="text-xs text-muted-foreground">{installment.mesReferencia}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(installment.valorTotal)}</p>
                        </div>
                      </div>
                    ))}
                </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;

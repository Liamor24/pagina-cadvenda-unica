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
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  getCategoryBadge: (categoria: Expense["categoria"]) => JSX.Element;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

const ExpenseCard = ({
  expense,
  installments,
  onEdit,
  onDelete,
  getCategoryBadge,
  formatCurrency,
  formatDate,
}: ExpenseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasInstallments = installments && installments.length > 1;

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-semibold">{expense.descricao}</CardTitle>
              {getCategoryBadge(expense.categoria)}
            </div>
            <CardDescription className="text-sm">
              Referência: {expense.mesReferencia}
            </CardDescription>
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
                      <span className="block mt-2 font-semibold text-foreground">
                        Atenção: Apenas esta parcela ({expense.parcelaAtual}/{expense.parcelas}) será excluída.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(expense.id)}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(expense.valorTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
            <Badge variant={expense.formaPagamento === "PIX" ? "default" : "outline"} className="mt-1">
              {expense.formaPagamento}
            </Badge>
          </div>
        </div>

        {expense.observacao && (
          <div>
            <p className="text-sm text-muted-foreground">Observação</p>
            <p className="text-sm">{expense.observacao}</p>
          </div>
        )}

        {hasInstallments && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full mt-2">
                <span className="flex-1 text-left">
                  Ver Parcelas ({installments.length})
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>
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
                        <p className="font-medium text-sm">
                          Parcela {installment.parcelaAtual}/{installment.parcelas}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {installment.mesReferencia}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(installment.valorTotal)}</p>
                      </div>
                      <div className="flex gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(installment)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a parcela {installment.parcelaAtual}/{installment.parcelas}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(installment.id)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

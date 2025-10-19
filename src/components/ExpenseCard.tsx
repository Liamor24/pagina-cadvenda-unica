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

  // calcular valor total do grupo (se installments representarem parcelas,
  // somamos os valores; caso seja entrada única, usamos valorTotal)
  const totalValue = installments && installments.length > 0
    ? installments.reduce((s, it) => s + it.valorTotal, 0)
    : expense.valorTotal;

  // valor da parcela no mês vigente: procurar parcela cuja mesReferencia
  // corresponde ao mês atual
  const now = new Date();
  const currentMesRef = `${now.toLocaleString('pt-BR', { month: 'long' }).replace(/^./, c => c.toUpperCase())} ${now.getFullYear()}`;
  const currentInstallment = installments ? installments.find(inst => inst.mesReferencia === currentMesRef) : null;
  const currentValue = currentInstallment ? currentInstallment.valorTotal : (hasInstallments ? installments && installments[0].valorTotal : expense.valorTotal);

  const isQuitado = expense.formaPagamento === "Parcelado" && expense.parcelaAtual === expense.parcelas;

  return (
    <Card 
      className={`w-full shadow-md hover:shadow-lg transition-shadow border ${
        isQuitado ? "opacity-75 grayscale" : ""
      }`}
    >
      <CardHeader className="pb-3">
        {isQuitado && (
          <div className="absolute -rotate-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold border-2 border-red-500 rounded px-2 py-1">
            QUITADO
          </div>
        )}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">{expense.descricao}</CardTitle>
                <CardDescription className="text-sm">{formatDate(expense.data)}</CardDescription>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(totalValue)}</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(currentValue)} (mês vigente)</div>
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
        <div className="flex items-center justify-between">
          <Badge variant={expense.formaPagamento === "PIX" ? "default" : "outline"}>
            {expense.formaPagamento}
          </Badge>
          {expense.formaPagamento === "Parcelado" && (
            <span className="text-sm text-muted-foreground">
              {expense.parcelaAtual}/{expense.parcelas} parcelas
            </span>
          )}
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
                          <p className="text-xs text-muted-foreground">{new Date(installment.data || installment.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(installment)}>
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

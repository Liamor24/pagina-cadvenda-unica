import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
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
import type { Expense } from "@/pages/APagar";

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }: ExpenseListProps) => {
  const getCategoryBadge = (categoria: Expense["categoria"]) => {
    const variants: Record<Expense["categoria"], { variant: "default" | "secondary" | "outline", className: string }> = {
      "Estoque": { variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
      "Embalagens": { variant: "default", className: "bg-green-500 hover:bg-green-600" },
      "Fornecedor": { variant: "default", className: "bg-purple-500 hover:bg-purple-600" },
      "Despesa Operacional": { variant: "default", className: "bg-orange-500 hover:bg-orange-600" },
      "Outros": { variant: "secondary", className: "" }
    };

    const config = variants[categoria];
    return (
      <Badge variant={config.variant} className={config.className}>
        {categoria}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (expenses.length === 0) {
    return (
      <Card className="w-full shadow-lg rounded-xl border">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma despesa registrada neste período.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg rounded-xl border overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
          Despesas Registradas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Mês de Referência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Forma de Pgto</TableHead>
                <TableHead className="text-center">Parcela</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.descricao}</TableCell>
                  <TableCell>{getCategoryBadge(expense.categoria)}</TableCell>
                  <TableCell>{expense.mesReferencia}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(expense.valorTotal)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={expense.formaPagamento === "PIX" ? "default" : "outline"}>
                      {expense.formaPagamento}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {expense.formaPagamento === "Parcelado" && expense.parcelaAtual && expense.parcelas
                      ? `${expense.parcelaAtual}/${expense.parcelas}`
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                    {expense.observacao || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditExpense(expense)}
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
                            <AlertDialogAction onClick={() => onDeleteExpense(expense.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;

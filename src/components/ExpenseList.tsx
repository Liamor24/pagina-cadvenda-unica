import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import ExpenseCard from "./ExpenseCard";

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

  // Agrupar despesas por data de compra e ID base (para parcelas)
  const groupedExpenses = expenses.reduce((acc, expense) => {
    // Criar chave única baseada na descrição e data (para agrupar parcelas)
    const baseKey = expense.formaPagamento === "Parcelado" 
      ? `${expense.descricao}-${expense.mesReferencia}`
      : expense.id;
    
    if (!acc[baseKey]) {
      acc[baseKey] = [];
    }
    acc[baseKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Ordenar grupos por data mais recente
  const sortedGroups = Object.values(groupedExpenses).sort((a, b) => {
    const dateA = new Date(a[0].mesReferencia);
    const dateB = new Date(b[0].mesReferencia);
    return dateB.getTime() - dateA.getTime();
  });

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
    <div className="space-y-4">
      {sortedGroups.map((group) => {
        const mainExpense = group[0];
        const hasInstallments = group.length > 1;
        
        return (
          <ExpenseCard
            key={mainExpense.id}
            expense={mainExpense}
            installments={hasInstallments ? group : undefined}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
            getCategoryBadge={getCategoryBadge}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        );
      })}
    </div>
  );
};

export default ExpenseList;

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
  onDeleteExpense: (grupoId: string) => void;
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

  // Helper para verificar se todas as parcelas estão quitadas
  const isExpenseGroupPaid = (group: Expense[]): boolean => {
    if (group.length === 0) return false;
    if (group[0].formaPagamento === "PIX") return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return group.every(exp => {
      const expDate = new Date(exp.data);
      expDate.setHours(0, 0, 0, 0);
      return expDate < now;
    });
  };

  // Agrupar despesas por grupo_id
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const groupKey = expense.grupo_id || expense.id;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Ordenar grupos: não quitadas primeiro, depois por data mais recente
  const sortedGroups = Object.values(groupedExpenses).sort((a, b) => {
    const isPaidA = isExpenseGroupPaid(a);
    const isPaidB = isExpenseGroupPaid(b);
    
    // Não quitadas primeiro
    if (isPaidA !== isPaidB) {
      return isPaidA ? 1 : -1;
    }
    
    // Depois ordena por data mais recente
    const maxA = Math.max(...a.map(x => new Date(x.data).getTime()));
    const maxB = Math.max(...b.map(x => new Date(x.data).getTime()));
    return maxB - maxA;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedGroups.map((group) => {
        const mainExpense = group[0];
        const hasInstallments = group.length > 1;
        const isPaid = isExpenseGroupPaid(group);
        
        return (
          <ExpenseCard
            key={mainExpense.id}
            expense={mainExpense}
            installments={hasInstallments ? group : undefined}
            isPaid={isPaid}
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

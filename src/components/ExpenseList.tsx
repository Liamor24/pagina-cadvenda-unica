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
  onUpdateExpense?: (expense: Partial<Expense> & { id: string }) => void | Promise<void>;
}

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense, onUpdateExpense }: ExpenseListProps) => {
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

  // Agrupar despesas por compra. Para entradas parceladas (cada parcela é uma entrada
  // separada) agrupamos por descrição + número de parcelas + categoria + observação
  // para reconstruir a compra original em um único card.
  const groupedExpenses = expenses.reduce((acc, expense) => {
    let baseKey: string;
    if (expense.formaPagamento === "Parcelado") {
      baseKey = `${expense.descricao}::${expense.parcelas ?? 0}::${expense.categoria}::${expense.observacao ?? ''}`;
    } else {
      baseKey = expense.id;
    }

    if (!acc[baseKey]) acc[baseKey] = [];
    acc[baseKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Ordenar grupos por:
  // 1. Quitado (não quitados primeiro) — quitado somente quando todas parcelas do grupo têm pagoEm preenchido e já no passado
  // 2. Parcelas restantes (mais parcelas abertas primeiro)
  // 3. Data mais recente
  const sortedGroups = Object.values(groupedExpenses).sort((a, b) => {
    const now = new Date();
    const aQuitado = a[0].formaPagamento === "Parcelado" && a.every(it => it.pagoEm && new Date(it.pagoEm) < now);
    const bQuitado = b[0].formaPagamento === "Parcelado" && b.every(it => it.pagoEm && new Date(it.pagoEm) < now);
    
    // Quitados vão para o final
    if (aQuitado !== bQuitado) return aQuitado ? 1 : -1;

    // Se ambos são parcelados, compara parcelas restantes (não pagas ou com pagoEm futuro)
    if (a[0].formaPagamento === "Parcelado" && b[0].formaPagamento === "Parcelado") {
      const aRestantes = a.filter(it => !it.pagoEm || new Date(it.pagoEm) > now).length;
      const bRestantes = b.filter(it => !it.pagoEm || new Date(it.pagoEm) > now).length;
      if (aRestantes !== bRestantes) return bRestantes - aRestantes;
    }

    // Por fim, ordena por data mais recente
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
        
        return (
          <ExpenseCard
            key={mainExpense.id}
            expense={mainExpense}
            installments={hasInstallments ? group : undefined}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
            onUpdate={onUpdateExpense}
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

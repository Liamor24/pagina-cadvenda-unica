import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import type { Expense } from "@/pages/APagar";

interface ExpenseFormProps {
  onExpenseAdded: (expenses: Expense[]) => void;
  editingExpense?: Expense | null;
  onExpenseUpdated?: (expense: Expense) => void;
}

const ExpenseForm = ({ onExpenseAdded, editingExpense, onExpenseUpdated }: ExpenseFormProps) => {
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<Expense["categoria"]>("Estoque");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [valorTotal, setValorTotal] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "Parcelado">("PIX");
  const [parcelas, setParcelas] = useState("2");
  const [observacao, setObservacao] = useState("");

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingExpense) {
      setDescricao(editingExpense.descricao);
      setCategoria(editingExpense.categoria);
      setData(editingExpense.data);
      setValorTotal(editingExpense.valorTotal.toString());
      setFormaPagamento(editingExpense.formaPagamento);
      if (editingExpense.parcelas) {
        setParcelas(editingExpense.parcelas.toString());
      }
      setObservacao(editingExpense.observacao || "");
    }
  }, [editingExpense]);

  const calculateInstallments = (
    valor: number,
    numParcelas: number,
    dataPrimeiraParcela: string
  ): Expense[] => {
    const valorParcela = valor / numParcelas;
    const baseDate = new Date(dataPrimeiraParcela);
    const expenses: Expense[] = [];

    for (let i = 0; i < numParcelas; i++) {
      const parcelaDate = new Date(baseDate);
      parcelaDate.setMonth(baseDate.getMonth() + i);
      
      const mesReferencia = `${monthNames[parcelaDate.getMonth()]} ${parcelaDate.getFullYear()}`;
      
      expenses.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        descricao: descricao,
        categoria: categoria,
        data: parcelaDate.toISOString().split('T')[0],
        valorTotal: valorParcela,
        formaPagamento: "Parcelado",
        parcelas: numParcelas,
        parcelaAtual: i + 1,
        mesReferencia: mesReferencia,
        observacao: observacao
      });
    }

    return expenses;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!descricao.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a descrição da despesa.",
        variant: "destructive"
      });
      return;
    }

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe um valor válido.",
        variant: "destructive"
      });
      return;
    }

    const valor = parseFloat(valorTotal);

    if (editingExpense) {
      // Modo de edição
      const updatedExpense: Expense = {
        ...editingExpense,
        descricao,
        categoria,
        data,
        valorTotal: valor,
        observacao
      };

      onExpenseUpdated?.(updatedExpense);
      
      toast({
        title: "Despesa atualizada!",
        description: "A despesa foi atualizada com sucesso."
      });

      clearForm();
    } else {
      // Modo de criação
      if (formaPagamento === "PIX") {
        const dateObj = new Date(data);
        const mesReferencia = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

        const newExpense: Expense = {
          id: `${Date.now()}-${Math.random()}`,
          descricao,
          categoria,
          data,
          valorTotal: valor,
          formaPagamento: "PIX",
          mesReferencia,
          observacao
        };

        onExpenseAdded([newExpense]);

        toast({
          title: "Despesa registrada!",
          description: "PIX registrado com sucesso."
        });
      } else {
        // Parcelado
        const numParcelas = parseInt(parcelas);
        
        if (numParcelas < 2 || numParcelas > 12) {
          toast({
            title: "Erro",
            description: "O número de parcelas deve estar entre 2 e 12.",
            variant: "destructive"
          });
          return;
        }

        const installments = calculateInstallments(valor, numParcelas, data);
        onExpenseAdded(installments);

        toast({
          title: "Despesa parcelada registrada!",
          description: `${numParcelas} parcelas de R$ ${(valor / numParcelas).toFixed(2)} criadas.`
        });
      }

      clearForm();
    }
  };

  const clearForm = () => {
    setDescricao("");
    setCategoria("Estoque");
    setData(new Date().toISOString().split('T')[0]);
    setValorTotal("");
    setFormaPagamento("PIX");
    setParcelas("2");
    setObservacao("");
  };

  return (
    <Card className="w-full shadow-lg rounded-xl border">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-t-xl">
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
          {editingExpense ? "Editar Despesa" : "Registrar Nova Despesa"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição da Despesa *</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Compra de embalagens"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={categoria} onValueChange={(value) => setCategoria(value as Expense["categoria"])}>
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                  <SelectItem value="Embalagens">Embalagens</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Despesa Operacional">Despesa Operacional</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="data">Data da Despesa *</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>

            {/* Valor Total */}
            <div>
              <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                min="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Forma de Pagamento */}
            {!editingExpense && (
              <div>
                <Label>Forma de Pagamento *</Label>
                <RadioGroup value={formaPagamento} onValueChange={(value) => setFormaPagamento(value as "PIX" | "Parcelado")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PIX" id="pix" />
                    <Label htmlFor="pix" className="font-normal cursor-pointer">PIX (À vista)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Parcelado" id="parcelado" />
                    <Label htmlFor="parcelado" className="font-normal cursor-pointer">Parcelado</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Parcelas (condicional) */}
            {!editingExpense && formaPagamento === "Parcelado" && (
              <div>
                <Label htmlFor="parcelas">Quantidade de Parcelas *</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="2"
                  max="12"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Entre 2 e 12 parcelas</p>
              </div>
            )}

            {/* Observação */}
            <div className="md:col-span-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingExpense ? "Atualizar Despesa" : "Registrar Despesa"}
            </Button>
            <Button type="button" variant="outline" onClick={clearForm}>
              {editingExpense ? "Cancelar Edição" : "Limpar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;

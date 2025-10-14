import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

export interface Product {
  id: string;
  productRef: string;
  productName: string;
  purchaseValue: number;
  saleValue: number;
}

export interface Sale {
  id: string;
  customerName: string;
  purchaseDate: string;
  paymentDate: string;
  paymentMethod: "pix" | "installment";
  installments?: number;
  installmentValues?: number[];
  advancePayment?: number;
  products: Product[];
}

interface SalesFormProps {
  onSaleAdded: (sale: Sale) => void;
}

export const SalesForm = ({ onSaleAdded }: SalesFormProps) => {
  const today = new Date();
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [customerName, setCustomerName] = useState("");
  const [productRef, setProductRef] = useState("");
  const [productName, setProductName] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(formatDate(today));
  const [paymentDate, setPaymentDate] = useState(formatDate(oneMonthLater));
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "installment">("pix");
  const [installments, setInstallments] = useState(1);
  const [installmentValues, setInstallmentValues] = useState<string[]>([""]);
  const [manuallyEditedInstallments, setManuallyEditedInstallments] = useState<boolean[]>([false]);
  const [advancePayment, setAdvancePayment] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const profit = parseFloat(saleValue || "0") - parseFloat(purchaseValue || "0");
  const totalInstallments = installmentValues.reduce((sum, val) => sum + parseFloat(val || "0"), 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + p.purchaseValue, 0);
  const totalSaleValue = products.reduce((sum, p) => sum + p.saleValue, 0);
  const totalProfit = totalSaleValue - totalPurchaseValue;

  const handleInstallmentsChange = (num: number) => {
    setInstallments(num);
    const currentEdited = [...manuallyEditedInstallments];
    
    // Se diminuiu o número de parcelas, remove os editados extras
    if (num < currentEdited.length) {
      setManuallyEditedInstallments(currentEdited.slice(0, num));
    } else {
      // Se aumentou, adiciona false para as novas parcelas
      setManuallyEditedInstallments([...currentEdited, ...Array(num - currentEdited.length).fill(false)]);
    }
    
    // Calcular valor restante após adiantamento
    const advance = parseFloat(advancePayment || "0");
    const remainingValue = totalSaleValue - advance;
    
    // Calcular valor igual para parcelas não editadas
    if (remainingValue > 0) {
      const valuePerInstallment = (remainingValue / num).toFixed(2);
      const newValues = Array(num).fill("").map((_, i) => {
        // Se foi editado manualmente, mantém o valor
        if (manuallyEditedInstallments[i]) {
          return installmentValues[i] || "";
        }
        // Se não foi editado, preenche automaticamente
        return valuePerInstallment;
      });
      setInstallmentValues(newValues);
    } else {
      setInstallmentValues(Array(num).fill(""));
    }
  };

  const handleInstallmentValueChange = (index: number, value: string) => {
    const newValues = [...installmentValues];
    newValues[index] = value;
    
    // Marca como editado manualmente
    const newEdited = [...manuallyEditedInstallments];
    newEdited[index] = true;
    
    // Calcular valor restante após adiantamento
    const advance = parseFloat(advancePayment || "0");
    const remainingValue = totalSaleValue - advance;
    
    // Calcular total já comprometido (parcelas editadas)
    let totalCommitted = 0;
    newValues.forEach((val, i) => {
      if (i === index || newEdited[i]) {
        totalCommitted += parseFloat(val || "0");
      }
    });
    
    // Calcular valor restante para distribuir
    const remaining = remainingValue - totalCommitted;
    
    // Contar parcelas não editadas após a atual
    const unEditedCount = newValues.slice(index + 1).filter((_, i) => !newEdited[index + 1 + i]).length;
    
    // Distribuir valor restante entre parcelas não editadas
    if (unEditedCount > 0 && remaining > 0) {
      const valuePerInstallment = (remaining / unEditedCount).toFixed(2);
      for (let i = index + 1; i < newValues.length; i++) {
        if (!newEdited[i]) {
          newValues[i] = valuePerInstallment;
        }
      }
    }
    
    setInstallmentValues(newValues);
    setManuallyEditedInstallments(newEdited);
  };

  const handleAddProduct = () => {
    if (!productRef || !productName || !purchaseValue || !saleValue) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do produto.",
        variant: "destructive",
      });
      return;
    }

    if (editingProductId) {
      setProducts(products.map(p => 
        p.id === editingProductId 
          ? { id: p.id, productRef, productName, purchaseValue: parseFloat(purchaseValue), saleValue: parseFloat(saleValue) }
          : p
      ));
      setEditingProductId(null);
      toast({
        title: "Produto atualizado!",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        productRef,
        productName,
        purchaseValue: parseFloat(purchaseValue),
        saleValue: parseFloat(saleValue),
      };
      const newProducts = [...products, newProduct];
      setProducts(newProducts);
      
      // Atualizar parcelas automaticamente se não foram editadas manualmente
      if (paymentMethod === "installment" && installments > 0) {
        const newTotalSaleValue = newProducts.reduce((sum, p) => sum + p.saleValue, 0);
        const advance = parseFloat(advancePayment || "0");
        const remainingValue = newTotalSaleValue - advance;
        const valuePerInstallment = (remainingValue / installments).toFixed(2);
        
        const newValues = installmentValues.map((val, i) => {
          // Se foi editado manualmente, mantém o valor
          if (manuallyEditedInstallments[i]) {
            return val;
          }
          // Se não foi editado, atualiza automaticamente
          return valuePerInstallment;
        });
        setInstallmentValues(newValues);
      }
      
      toast({
        title: "Produto adicionado!",
        description: "O produto foi adicionado à lista.",
      });
    }

    setProductRef("");
    setProductName("");
    setPurchaseValue("");
    setSaleValue("");
  };

  const handleEditProduct = (product: Product) => {
    setProductRef(product.productRef);
    setProductName(product.productName);
    setPurchaseValue(product.purchaseValue.toString());
    setSaleValue(product.saleValue.toString());
    setEditingProductId(product.id);
  };

  const handleDeleteProduct = (productId: string) => {
    const newProducts = products.filter(p => p.id !== productId);
    setProducts(newProducts);
    
    // Atualizar parcelas automaticamente se não foram editadas manualmente
    if (paymentMethod === "installment" && installments > 0 && newProducts.length > 0) {
      const newTotalSaleValue = newProducts.reduce((sum, p) => sum + p.saleValue, 0);
      const advance = parseFloat(advancePayment || "0");
      const remainingValue = newTotalSaleValue - advance;
      const valuePerInstallment = (remainingValue / installments).toFixed(2);
      
      const newValues = installmentValues.map((val, i) => {
        // Se foi editado manualmente, mantém o valor
        if (manuallyEditedInstallments[i]) {
          return val;
        }
        // Se não foi editado, atualiza automaticamente
        return valuePerInstallment;
      });
      setInstallmentValues(newValues);
    }
    
    toast({
      title: "Produto removido!",
      description: "O produto foi removido da lista.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !purchaseDate || !paymentDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do cliente e as datas.",
        variant: "destructive",
      });
      return;
    }

    if (products.length === 0) {
      toast({
        title: "Nenhum produto",
        description: "Por favor, adicione pelo menos um produto à venda.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "installment" && installmentValues.some(val => !val || parseFloat(val) <= 0)) {
      toast({
        title: "Valores de parcelas inválidos",
        description: "Por favor, preencha todos os valores das parcelas.",
        variant: "destructive",
      });
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      customerName,
      purchaseDate,
      paymentDate,
      paymentMethod,
      installments: paymentMethod === "installment" ? installments : undefined,
      installmentValues: paymentMethod === "installment" ? installmentValues.map(v => parseFloat(v)) : undefined,
      advancePayment: advancePayment ? parseFloat(advancePayment) : undefined,
      products: [...products],
    };

    onSaleAdded(newSale);

    // Reset form
    const newToday = new Date();
    const newOneMonthLater = new Date(newToday);
    newOneMonthLater.setMonth(newOneMonthLater.getMonth() + 1);
    
    setCustomerName("");
    setProductRef("");
    setProductName("");
    setPurchaseValue("");
    setSaleValue("");
    setPurchaseDate(formatDate(newToday));
    setPaymentDate(formatDate(newOneMonthLater));
    setPaymentMethod("pix");
    setInstallments(1);
    setInstallmentValues([""]);
    setManuallyEditedInstallments([false]);
    setAdvancePayment("");
    setProducts([]);
    setEditingProductId(null);

    toast({
      title: "Venda registrada!",
      description: "A venda foi adicionada com sucesso.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 shadow-[var(--shadow-card)] border-border transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)]">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Cadastro de Venda</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <Label htmlFor="customerName" className="text-foreground">Nome do Cliente</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1"
              placeholder="Digite o nome do cliente"
            />
          </div>

          <div>
            <Label htmlFor="purchaseDate" className="text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data da Compra
            </Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="paymentDate" className="text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Pagamento / 1ª Parcela
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-[var(--shadow-card)] border-border transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)]">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Produtos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="productRef" className="text-foreground">Referência do Produto</Label>
            <Input
              id="productRef"
              value={productRef}
              onChange={(e) => setProductRef(e.target.value)}
              className="mt-1"
              placeholder="REF-001"
            />
          </div>

          <div>
            <Label htmlFor="productName" className="text-foreground">Nome do Produto</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1"
              placeholder="Digite o nome do produto"
            />
          </div>

          <div>
            <Label htmlFor="purchaseValue" className="text-foreground">Valor de Compra</Label>
            <Input
              id="purchaseValue"
              type="number"
              step="0.01"
              value={purchaseValue}
              onChange={(e) => setPurchaseValue(e.target.value)}
              className="mt-1"
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label htmlFor="saleValue" className="text-foreground">Valor de Venda</Label>
            <Input
              id="saleValue"
              type="number"
              step="0.01"
              value={saleValue}
              onChange={(e) => setSaleValue(e.target.value)}
              className="mt-1"
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        {purchaseValue && saleValue && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-accent/20 to-secondary/20 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lucro deste produto:</span>
              <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {profit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <Button 
          type="button" 
          onClick={handleAddProduct}
          className="w-full"
          variant={editingProductId ? "default" : "secondary"}
        >
          {editingProductId ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>

        {products.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-foreground">Produtos Adicionados:</h4>
            {products.map((product) => {
              const productProfit = product.saleValue - product.purchaseValue;
              return (
                <div key={product.id} className="p-4 rounded-lg bg-muted border border-border">
                  <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center">
                    <div>
                      <p className="font-semibold text-foreground">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">Ref: {product.productRef}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Compra</p>
                      <p className="font-semibold">R$ {product.purchaseValue.toFixed(2)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Venda</p>
                      <p className="font-semibold">R$ {product.saleValue.toFixed(2)}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Lucro</p>
                      <p className={`font-semibold ${productProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {productProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Compra</p>
                  <p className="text-xl font-bold text-foreground">R$ {totalPurchaseValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Venda</p>
                  <p className="text-xl font-bold text-foreground">R$ {totalSaleValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {totalProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 shadow-[var(--shadow-card)] border-border transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-elegant)]">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Forma de Pagamento</h3>
        
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "pix" | "installment")}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="cursor-pointer">PIX / À Vista</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="installment" id="installment" />
            <Label htmlFor="installment" className="cursor-pointer">Parcelado</Label>
          </div>
        </RadioGroup>

        <div className="mt-6">
          <Label htmlFor="advancePayment" className="text-foreground">Entrada / Adiantamento (Opcional)</Label>
          <Input
            id="advancePayment"
            type="number"
            step="0.01"
            value={advancePayment}
            onChange={(e) => {
              setAdvancePayment(e.target.value);
              // Recalcular parcelas quando mudar o adiantamento
              if (paymentMethod === "installment" && installments > 0 && totalSaleValue > 0) {
                const advance = parseFloat(e.target.value || "0");
                const remainingValue = totalSaleValue - advance;
                const valuePerInstallment = (remainingValue / installments).toFixed(2);
                
                const newValues = installmentValues.map((val, i) => {
                  if (manuallyEditedInstallments[i]) {
                    return val;
                  }
                  return valuePerInstallment;
                });
                setInstallmentValues(newValues);
              }
            }}
            className="mt-1 max-w-xs"
            placeholder="R$ 0,00"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Valor recebido antecipadamente, será abatido do total
          </p>
        </div>

        {paymentMethod === "installment" && (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="installmentNumber">Número de Parcelas</Label>
              <Input
                id="installmentNumber"
                type="number"
                min="1"
                value={installments}
                onChange={(e) => handleInstallmentsChange(parseInt(e.target.value) || 1)}
                className="mt-1 max-w-xs"
              />
            </div>

            <div className="space-y-3">
              <Label>Valor de Cada Parcela</Label>
              {Array.from({ length: installments }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium min-w-[80px]">Parcela {index + 1}:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={installmentValues[index] || ""}
                    onChange={(e) => handleInstallmentValueChange(index, e.target.value)}
                    placeholder="R$ 0,00"
                    className="max-w-xs"
                  />
                </div>
              ))}
            </div>

            {installmentValues.some(val => val) && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total das Parcelas:</p>
                <p className="text-lg font-semibold text-foreground">R$ {totalInstallments.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {customerName && products.length > 0 && (
        <Card className="p-6 shadow-[var(--shadow-elegant)] border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/10">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Resumo da Venda</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-semibold text-foreground">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Produtos:</span>
              <span className="font-semibold text-foreground">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total da Compra:</span>
              <span className="font-semibold text-foreground">R$ {totalPurchaseValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lucro Total:</span>
              <span className={`font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {totalProfit.toFixed(2)}
              </span>
            </div>
            {advancePayment && parseFloat(advancePayment) > 0 && (
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-muted-foreground">Entrada/Adiantamento:</span>
                <span className="font-semibold text-green-600">R$ {parseFloat(advancePayment).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground">Parcela do Mês:</span>
              <span className="font-bold text-lg text-foreground">
                {paymentMethod === "pix" 
                  ? `R$ ${totalSaleValue.toFixed(2)}` 
                  : installmentValues[0] 
                    ? `R$ ${parseFloat(installmentValues[0]).toFixed(2)}`
                    : "R$ 0,00"
                }
              </span>
            </div>
          </div>
        </Card>
      )}

      <Button type="submit" className="w-full" size="lg">
        Cadastrar Venda
      </Button>
    </form>
  );
};

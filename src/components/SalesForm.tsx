import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  installmentDates?: string[];
  installmentType?: "mensal" | "quinzenal";
  advancePayment?: number;
  discount?: number;
  products: Product[];
}

interface SalesFormProps {
  onSaleAdded: (sale: Sale) => void;
  editingSale?: Sale | null;
  onSaleUpdated?: (sale: Sale) => void;
}

export const SalesForm = ({ onSaleAdded, editingSale, onSaleUpdated }: SalesFormProps) => {
  const today = new Date();
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const calculateInstallmentDates = (
    firstPaymentDate: string, 
    numberOfInstallments: number,
    type: "mensal" | "quinzenal" = "mensal"
  ): string[] => {
    const dates: string[] = [];
    const baseDate = new Date(firstPaymentDate);
    
    for (let i = 0; i < numberOfInstallments; i++) {
      const installmentDate = new Date(baseDate);
      if (type === "quinzenal") {
        // Adiciona 15 dias por parcela
        installmentDate.setDate(baseDate.getDate() + (i * 15));
      } else {
        // Adiciona 1 mês por parcela (comportamento atual)
        installmentDate.setMonth(baseDate.getMonth() + i);
      }
      dates.push(installmentDate.toISOString().split('T')[0]);
    }
    
    return dates;
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
  const [installmentType, setInstallmentType] = useState<"mensal" | "quinzenal">("mensal");
  const [advancePayment, setAdvancePayment] = useState("");
  const [discount, setDiscount] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (editingSale) {
      setCustomerName(editingSale.customerName);
      setPurchaseDate(editingSale.purchaseDate);
      setPaymentDate(editingSale.paymentDate);
      setPaymentMethod(editingSale.paymentMethod);
      setProducts(editingSale.products);
      setAdvancePayment(editingSale.advancePayment?.toString() || "");
  setDiscount(editingSale.discount?.toString() || "");
      
      if (editingSale.paymentMethod === "installment" && editingSale.installments && editingSale.installmentValues) {
        setInstallments(editingSale.installments);
        setInstallmentValues(editingSale.installmentValues.map(v => v.toString()));
        setManuallyEditedInstallments(Array(editingSale.installments).fill(true));
        setInstallmentType(editingSale.installmentType || "mensal");
      }
    }
  }, [editingSale]);

  const profit = parseFloat(saleValue || "0") - parseFloat(purchaseValue || "0");
  const totalInstallments = installmentValues.reduce((sum, val) => sum + parseFloat(val || "0"), 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + p.purchaseValue, 0);
  const totalSaleValue = products.reduce((sum, p) => sum + p.saleValue, 0);
  const totalProfit = totalSaleValue - totalPurchaseValue - parseFloat(discount || "0");

  const handleInstallmentsChange = (num: number) => {
    setInstallments(num);
    const currentEdited = [...manuallyEditedInstallments];
    
    if (num < currentEdited.length) {
      setManuallyEditedInstallments(currentEdited.slice(0, num));
    } else {
      setManuallyEditedInstallments([...currentEdited, ...Array(num - currentEdited.length).fill(false)]);
    }
    
    const advance = parseFloat(advancePayment || "0");
  const disc = parseFloat(discount || "0");
  const remainingValue = totalSaleValue - advance - disc;
    
    if (remainingValue > 0) {
      const valuePerInstallment = (remainingValue / num).toFixed(2);
      const newValues = Array(num).fill("").map((_, i) => {
        return manuallyEditedInstallments[i] ? installmentValues[i] || "" : valuePerInstallment;
      });
      setInstallmentValues(newValues);
    } else {
      setInstallmentValues(Array(num).fill(""));
    }
  };

  const handleInstallmentValueChange = (index: number, value: string) => {
    const newValues = [...installmentValues];
    newValues[index] = value;
    
    const newEdited = [...manuallyEditedInstallments];
    newEdited[index] = true;
    
    const advance = parseFloat(advancePayment || "0");
  const disc = parseFloat(discount || "0");
  const remainingValue = totalSaleValue - advance - disc;
    
    let totalCommitted = 0;
    newValues.forEach((val, i) => {
      if (i === index || newEdited[i]) {
        totalCommitted += parseFloat(val || "0");
      }
    });
    
    const remaining = remainingValue - totalCommitted;
    const unEditedCount = newValues.slice(index + 1).filter((_, i) => !newEdited[index + 1 + i]).length;
    
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
      
      if (paymentMethod === "installment" && installments > 0) {
      const newTotalSaleValue = newProducts.reduce((sum, p) => sum + p.saleValue, 0);
        const advance = parseFloat(advancePayment || "0");
        const disc = parseFloat(discount || "0");
        const remainingValue = newTotalSaleValue - advance - disc;
        const valuePerInstallment = (remainingValue / installments).toFixed(2);
        
        const newValues = installmentValues.map((val, i) => {
          return manuallyEditedInstallments[i] ? val : valuePerInstallment;
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
    
    if (paymentMethod === "installment" && installments > 0 && newProducts.length > 0) {
      const newTotalSaleValue = newProducts.reduce((sum, p) => sum + p.saleValue, 0);
      const advance = parseFloat(advancePayment || "0");
      const disc = parseFloat(discount || "0");
      const remainingValue = newTotalSaleValue - advance - disc;
      const valuePerInstallment = (remainingValue / installments).toFixed(2);
      
      const newValues = installmentValues.map((val, i) => {
        return manuallyEditedInstallments[i] ? val : valuePerInstallment;
      });
      setInstallmentValues(newValues);
    }
    
    toast({
      title: "Produto removido!",
      description: "O produto foi removido da lista.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const saleData: Sale = {
      id: editingSale?.id || Date.now().toString(),
      customerName,
      purchaseDate,
      paymentDate,
      paymentMethod,
      installments: paymentMethod === "installment" ? installments : undefined,
      installmentValues: paymentMethod === "installment" ? installmentValues.map(v => parseFloat(v)) : undefined,
      installmentDates: paymentMethod === "installment" ? calculateInstallmentDates(paymentDate, installments, installmentType) : undefined,
      installmentType: paymentMethod === "installment" ? installmentType : undefined,
      advancePayment: advancePayment ? parseFloat(advancePayment) : undefined,
      discount: discount ? parseFloat(discount) : undefined,
      products: [...products],
    };

    try {
      if (editingSale && onSaleUpdated) {
        await onSaleUpdated(saleData);
      } else {
        await onSaleAdded(saleData);
      }

      // Reset form após sucesso
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
      setInstallmentType("mensal");
      setAdvancePayment("");
      setDiscount("");
      setProducts([]);
      setEditingProductId(null);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast({
        title: "Erro ao salvar dados",
        description: "Ocorreu um erro ao salvar os dados. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-[70%] mx-auto shadow-lg rounded-xl border">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-t-xl">
        <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
          {editingSale ? "Editar Venda" : "Cadastro de Venda"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="border-t border-border my-6"></div>

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
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div>
                          <p className="font-semibold text-foreground">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">Ref: {product.productRef}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Compra: </span>
                          <span className="font-semibold">R$ {product.purchaseValue.toFixed(2)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Venda: </span>
                          <span className="font-semibold">R$ {product.saleValue.toFixed(2)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Lucro: </span>
                          <span className={`font-semibold ${productProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {productProfit.toFixed(2)}
                          </span>
                        </div>
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

          <div className="border-t border-border my-6"></div>

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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="advancePayment" className="text-foreground">Entrada / Adiantamento (Opcional)</Label>
              <Input
                id="advancePayment"
                type="number"
                step="0.01"
                value={advancePayment}
                onChange={(e) => {
                  setAdvancePayment(e.target.value);
                  if (paymentMethod === "installment" && installments > 0 && totalSaleValue > 0) {
                    const advance = parseFloat(e.target.value || "0");
                    const disc = parseFloat(discount || "0");
                    const remainingValue = totalSaleValue - advance - disc;
                    const valuePerInstallment = (remainingValue / installments).toFixed(2);

                    const newValues = installmentValues.map((val, i) => {
                      return manuallyEditedInstallments[i] ? val : valuePerInstallment;
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

            <div>
              <Label htmlFor="discount" className="text-foreground">Desconto (Opcional)</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  if (paymentMethod === "installment" && installments > 0 && totalSaleValue > 0) {
                    const advance = parseFloat(advancePayment || "0");
                    const disc = parseFloat(e.target.value || "0");
                    const remainingValue = totalSaleValue - advance - disc;
                    const valuePerInstallment = (remainingValue / installments).toFixed(2);

                    const newValues = installmentValues.map((val, i) => {
                      return manuallyEditedInstallments[i] ? val : valuePerInstallment;
                    });
                    setInstallmentValues(newValues);
                  }
                }}
                className="mt-1 max-w-xs"
                placeholder="R$ 0,00"
              />
              <p className="text-xs text-muted-foreground mt-1">Desconto que será abatido do total</p>
            </div>
          </div>

          {paymentMethod === "installment" && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installmentNumber">Número de Parcelas</Label>
                  <Input
                    id="installmentNumber"
                    type="number"
                    min="1"
                    max="12"
                    value={installments}
                    onChange={(e) => handleInstallmentsChange(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Entre 1 e 12 parcelas</p>
                </div>

                <div>
                  <Label>Tipo de Parcelamento</Label>
                  <RadioGroup 
                    value={installmentType} 
                    onValueChange={(value) => setInstallmentType(value as "mensal" | "quinzenal")}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mensal" id="mensal" />
                      <Label htmlFor="mensal" className="cursor-pointer text-sm">
                        Mensal (30 dias)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quinzenal" id="quinzenal" />
                      <Label htmlFor="quinzenal" className="cursor-pointer text-sm">
                        Quinzenal (15 dias)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" size="lg">
              {editingSale ? "Atualizar Venda" : "Cadastrar Venda"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => {
              setCustomerName("");
              setProductRef("");
              setProductName("");
              setPurchaseValue("");
              setSaleValue("");
              setPurchaseDate(formatDate(today));
              setPaymentDate(formatDate(oneMonthLater));
              setPaymentMethod("pix");
              setInstallments(1);
              setInstallmentValues([""]);
              setManuallyEditedInstallments([false]);
              setInstallmentType("mensal");
              setAdvancePayment("");
              setProducts([]);
              setEditingProductId(null);
            }}>
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SalesForm;
-- Update tables with new fields and constraints
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0 CHECK (discount >= 0 AND discount <= 30);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_purchase_date ON sales (purchase_date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_date ON sales (payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_data ON expenses (data);
CREATE INDEX IF NOT EXISTS idx_expenses_mes_referencia ON expenses (mes_referencia);

-- Add foreign key constraints
ALTER TABLE products
ADD CONSTRAINT fk_products_sales
FOREIGN KEY (sale_id)
REFERENCES sales(id)
ON DELETE CASCADE;

-- Add status views for better querying
CREATE OR REPLACE VIEW vw_sales_status AS
SELECT 
    s.*,
    CASE 
        WHEN payment_method = 'PIX' AND payment_date <= CURRENT_DATE THEN 'Quitado'
        WHEN payment_method = 'Parcelado' AND 
             (installment_dates IS NULL OR 
              installment_dates::jsonb ? CURRENT_DATE::text) THEN 'Pendente'
        ELSE 'Parcialmente Pago'
    END as status
FROM sales s;

-- Add monthly summary view
CREATE OR REPLACE VIEW vw_monthly_summary AS
SELECT 
    date_trunc('month', s.purchase_date)::date as month,
    COUNT(DISTINCT s.id) as total_sales,
    SUM(p.sale_value) as total_sale_value,
    SUM(p.purchase_value) as total_purchase_value,
    SUM(p.sale_value - p.purchase_value) as total_profit,
    COUNT(DISTINCT CASE WHEN s.payment_method = 'Parcelado' THEN s.id END) as installment_sales
FROM sales s
JOIN products p ON s.id = p.sale_id
GROUP BY date_trunc('month', s.purchase_date)::date
ORDER BY month DESC;
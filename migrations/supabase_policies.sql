-- Migration: supabase_policies.sql
-- Development policies: permissive inserts/selects for initial setup.
-- In production, replace with stricter RLS policies.

-- Enable Row Level Security
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expense_installments ENABLE ROW LEVEL SECURITY;

-- Allow anon role to select/insert/update/delete for development (NOT FOR PRODUCTION)
REVOKE ALL ON sales FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales TO anon;

REVOKE ALL ON sales_products FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_products TO anon;

REVOKE ALL ON expenses FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO anon;

REVOKE ALL ON expense_installments FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_installments TO anon;

-- Note: For production, create RLS policies like:
-- CREATE POLICY "Allow users to manage their sales" ON sales
-- FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- End of policies

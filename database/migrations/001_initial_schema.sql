-- AI Accounting Assistant Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: companies
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: financial_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
    category TEXT NOT NULL,
    subcategory TEXT,
    account_code TEXT,
    vendor_customer TEXT,
    reference_number TEXT,
    notes TEXT,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),
    fiscal_month INTEGER CHECK (fiscal_month BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_date
    ON financial_transactions(company_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_fiscal_year
    ON financial_transactions(company_id, fiscal_year, fiscal_quarter);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type
    ON financial_transactions(company_id, transaction_type);

-- ============================================
-- TABLE: documents
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rejected')),
    extracted_data JSONB,
    generated_entries_url TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for document queries
CREATE INDEX IF NOT EXISTS idx_documents_company_status
    ON documents(company_id, status, uploaded_at DESC);

-- ============================================
-- TABLE: conversations
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    message_metadata JSONB,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for conversation history (last 10 messages)
CREATE INDEX IF NOT EXISTS idx_conversations_user_session
    ON conversations(user_id, session_id, created_at DESC);

-- Automatically delete messages older than 30 days
CREATE INDEX IF NOT EXISTS idx_conversations_cleanup
    ON conversations(created_at);

-- ============================================
-- TABLE: faq_content
-- ============================================
CREATE TABLE IF NOT EXISTS faq_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[],
    embedding vector(1536), -- For semantic search if using embeddings
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for FAQ search
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_content(category, is_active);

-- ============================================
-- TABLE: escalations
-- ============================================
CREATE TABLE IF NOT EXISTS escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    ai_confidence DECIMAL(3, 2),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    admin_response TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for escalation management
CREATE INDEX IF NOT EXISTS idx_escalations_status
    ON escalations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_assigned
    ON escalations(assigned_to, status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only see their own company
CREATE POLICY companies_isolation ON companies
    FOR ALL
    USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users: Users can only see users in their company
CREATE POLICY users_isolation ON users
    FOR ALL
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Financial Transactions: Users can only see their company's data
CREATE POLICY financial_transactions_isolation ON financial_transactions
    FOR ALL
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Documents: Users can only see their company's documents
CREATE POLICY documents_isolation ON documents
    FOR ALL
    USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Conversations: Users can only see their own conversations
CREATE POLICY conversations_isolation ON conversations
    FOR ALL
    USING (user_id = auth.uid() OR company_id = (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- FAQ: Everyone can read, only admins can modify
CREATE POLICY faq_read_all ON faq_content
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY faq_modify_admin ON faq_content
    FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Escalations: Users see their own, admins see all
CREATE POLICY escalations_user_own ON escalations
    FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY escalations_insert_user ON escalations
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY escalations_update_admin ON escalations
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_content_updated_at BEFORE UPDATE ON faq_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON escalations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically cleanup old conversations (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
BEGIN
    DELETE FROM conversations
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPREHENSIVE MOCK DATA
-- ============================================

-- Insert mock companies
INSERT INTO companies (id, name, phone_number, email, address, industry) VALUES
    ('11111111-1111-1111-1111-111111111111', 'TechStart Solutions', '+14155551001', 'contact@techstart.com', '123 Market St, San Francisco, CA 94103', 'Technology'),
    ('22222222-2222-2222-2222-222222222222', 'Green Leaf Consulting', '+14155551002', 'info@greenleaf.com', '456 Oak Ave, San Francisco, CA 94102', 'Consulting'),
    ('33333333-3333-3333-3333-333333333333', 'Bright Future Retail', '+14155551003', 'hello@brightfuture.com', '789 Pine St, San Francisco, CA 94104', 'Retail'),
    ('44444444-4444-4444-4444-444444444444', 'Admin Test Company', '+14155559999', 'admin@accountingfirm.com', '100 Admin Plaza, San Francisco, CA 94105', 'Accounting')
ON CONFLICT (id) DO NOTHING;

-- Insert mock users (clients and admins)
INSERT INTO users (id, company_id, phone_number, full_name, email, role) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '+14155551001', 'John Smith', 'john@techstart.com', 'client'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '+14155551002', 'Sarah Johnson', 'sarah@greenleaf.com', 'client'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '+14155551003', 'Michael Chen', 'michael@brightfuture.com', 'client'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '+14155559999', 'Admin User', 'admin@accountingfirm.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MOCK FINANCIAL TRANSACTIONS - TechStart Solutions
-- ============================================

-- 2023 Revenue - TechStart Solutions
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('11111111-1111-1111-1111-111111111111', '2023-01-15', 'Software Development Services - Project Alpha', 8500.00, 'revenue', 'Service Revenue', 'Software Development', 'Acme Corp', 2023, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2023-02-20', 'Consulting Services - Tech Advisory', 3200.00, 'revenue', 'Service Revenue', 'Consulting', 'Beta Industries', 2023, 1, 2),
    ('11111111-1111-1111-1111-111111111111', '2023-03-10', 'Monthly Retainer - Cloud Solutions', 4500.00, 'revenue', 'Service Revenue', 'Managed Services', 'Gamma LLC', 2023, 1, 3),
    ('11111111-1111-1111-1111-111111111111', '2023-04-05', 'Custom App Development', 12000.00, 'revenue', 'Service Revenue', 'Software Development', 'Delta Corp', 2023, 2, 4),
    ('11111111-1111-1111-1111-111111111111', '2023-05-18', 'Website Design & Development', 5600.00, 'revenue', 'Service Revenue', 'Web Development', 'Epsilon Co', 2023, 2, 5),
    ('11111111-1111-1111-1111-111111111111', '2023-06-25', 'API Integration Services', 3800.00, 'revenue', 'Service Revenue', 'Software Development', 'Zeta Systems', 2023, 2, 6),
    ('11111111-1111-1111-1111-111111111111', '2023-07-12', 'Mobile App Development', 9500.00, 'revenue', 'Service Revenue', 'Software Development', 'Theta Inc', 2023, 3, 7),
    ('11111111-1111-1111-1111-111111111111', '2023-08-22', 'Database Optimization Consulting', 2800.00, 'revenue', 'Service Revenue', 'Consulting', 'Iota Partners', 2023, 3, 8),
    ('11111111-1111-1111-1111-111111111111', '2023-09-30', 'Quarterly Managed Services', 6200.00, 'revenue', 'Service Revenue', 'Managed Services', 'Kappa Group', 2023, 3, 9),
    ('11111111-1111-1111-1111-111111111111', '2023-10-15', 'E-commerce Platform Development', 15000.00, 'revenue', 'Service Revenue', 'Software Development', 'Lambda Retail', 2023, 4, 10),
    ('11111111-1111-1111-1111-111111111111', '2023-11-08', 'Security Audit & Implementation', 4200.00, 'revenue', 'Service Revenue', 'Consulting', 'Mu Financial', 2023, 4, 11),
    ('11111111-1111-1111-1111-111111111111', '2023-12-20', 'Year-End Support Services', 3700.00, 'revenue', 'Service Revenue', 'Support', 'Nu Technologies', 2023, 4, 12);

-- 2023 Expenses - TechStart Solutions
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('11111111-1111-1111-1111-111111111111', '2023-01-05', 'Office Rent - January', -2500.00, 'expense', 'Rent', 'Office Space', 'Property Management Co', 2023, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2023-01-10', 'Software Licenses (Annual)', -1200.00, 'expense', 'Software & Subscriptions', 'Development Tools', 'GitHub Inc', 2023, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2023-02-01', 'Cloud Hosting Services', -850.00, 'expense', 'Technology', 'Cloud Services', 'AWS', 2023, 1, 2),
    ('11111111-1111-1111-1111-111111111111', '2023-03-15', 'Marketing & Advertising', -1500.00, 'expense', 'Marketing', 'Digital Ads', 'Google Ads', 2023, 1, 3),
    ('11111111-1111-1111-1111-111111111111', '2023-04-20', 'Employee Salaries', -18000.00, 'expense', 'Payroll', 'Salaries', 'Internal', 2023, 2, 4),
    ('11111111-1111-1111-1111-111111111111', '2023-05-05', 'Office Supplies', -320.00, 'expense', 'Office Expenses', 'Supplies', 'Staples', 2023, 2, 5),
    ('11111111-1111-1111-1111-111111111111', '2023-06-12', 'Professional Development', -800.00, 'expense', 'Training', 'Courses', 'Udemy', 2023, 2, 6),
    ('11111111-1111-1111-1111-111111111111', '2023-07-08', 'Internet & Phone', -450.00, 'expense', 'Utilities', 'Communications', 'Comcast', 2023, 3, 7),
    ('11111111-1111-1111-1111-111111111111', '2023-08-25', 'Insurance Premium', -1100.00, 'expense', 'Insurance', 'Business Insurance', 'State Farm', 2023, 3, 8),
    ('11111111-1111-1111-1111-111111111111', '2023-09-18', 'Legal & Accounting Fees', -2200.00, 'expense', 'Professional Services', 'Accounting', 'Smith & Associates', 2023, 3, 9),
    ('11111111-1111-1111-1111-111111111111', '2023-10-10', 'Travel Expenses', -1850.00, 'expense', 'Travel', 'Client Meetings', 'United Airlines', 2023, 4, 10),
    ('11111111-1111-1111-1111-111111111111', '2023-11-15', 'Equipment Purchase', -3500.00, 'expense', 'Equipment', 'Computers', 'Apple Store', 2023, 4, 11),
    ('11111111-1111-1111-1111-111111111111', '2023-12-01', 'Holiday Party', -900.00, 'expense', 'Entertainment', 'Employee Events', 'Catering Co', 2023, 4, 12);

-- 2024 Revenue - TechStart Solutions (22% growth)
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('11111111-1111-1111-1111-111111111111', '2024-01-18', 'Enterprise Software Development', 12500.00, 'revenue', 'Service Revenue', 'Software Development', 'Acme Corp', 2024, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2024-02-22', 'Cloud Migration Consulting', 4800.00, 'revenue', 'Service Revenue', 'Consulting', 'Beta Industries', 2024, 1, 2),
    ('11111111-1111-1111-1111-111111111111', '2024-03-14', 'Managed Services Contract', 5200.00, 'revenue', 'Service Revenue', 'Managed Services', 'Gamma LLC', 2024, 1, 3),
    ('11111111-1111-1111-1111-111111111111', '2024-04-09', 'Mobile App Development - Phase 2', 14000.00, 'revenue', 'Service Revenue', 'Software Development', 'Delta Corp', 2024, 2, 4),
    ('11111111-1111-1111-1111-111111111111', '2024-05-20', 'E-commerce Platform Enhancement', 6800.00, 'revenue', 'Service Revenue', 'Web Development', 'Epsilon Co', 2024, 2, 5),
    ('11111111-1111-1111-1111-111111111111', '2024-06-28', 'API Development & Integration', 4500.00, 'revenue', 'Service Revenue', 'Software Development', 'Zeta Systems', 2024, 2, 6),
    ('11111111-1111-1111-1111-111111111111', '2024-07-15', 'Custom CRM Development', 11000.00, 'revenue', 'Service Revenue', 'Software Development', 'Theta Inc', 2024, 3, 7),
    ('11111111-1111-1111-1111-111111111111', '2024-08-25', 'Performance Optimization Services', 3400.00, 'revenue', 'Service Revenue', 'Consulting', 'Iota Partners', 2024, 3, 8),
    ('11111111-1111-1111-1111-111111111111', '2024-09-30', 'Quarterly Managed Services', 7500.00, 'revenue', 'Service Revenue', 'Managed Services', 'Kappa Group', 2024, 3, 9),
    ('11111111-1111-1111-1111-111111111111', '2024-10-18', 'Enterprise Web Application', 18000.00, 'revenue', 'Service Revenue', 'Software Development', 'Lambda Retail', 2024, 4, 10),
    ('11111111-1111-1111-1111-111111111111', '2024-11-12', 'Security & Compliance Consulting', 5200.00, 'revenue', 'Service Revenue', 'Consulting', 'Mu Financial', 2024, 4, 11),
    ('11111111-1111-1111-1111-111111111111', '2024-12-22', 'Annual Support & Maintenance', 4800.00, 'revenue', 'Service Revenue', 'Support', 'Nu Technologies', 2024, 4, 12);

-- 2024 Expenses - TechStart Solutions
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('11111111-1111-1111-1111-111111111111', '2024-01-05', 'Office Rent - January', -2600.00, 'expense', 'Rent', 'Office Space', 'Property Management Co', 2024, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2024-01-12', 'Software Licenses (Annual)', -1500.00, 'expense', 'Software & Subscriptions', 'Development Tools', 'GitHub Inc', 2024, 1, 1),
    ('11111111-1111-1111-1111-111111111111', '2024-02-03', 'Cloud Hosting Services', -950.00, 'expense', 'Technology', 'Cloud Services', 'AWS', 2024, 1, 2),
    ('11111111-1111-1111-1111-111111111111', '2024-03-18', 'Marketing & Advertising', -1800.00, 'expense', 'Marketing', 'Digital Ads', 'Google Ads', 2024, 1, 3),
    ('11111111-1111-1111-1111-111111111111', '2024-04-22', 'Employee Salaries', -20000.00, 'expense', 'Payroll', 'Salaries', 'Internal', 2024, 2, 4),
    ('11111111-1111-1111-1111-111111111111', '2024-05-08', 'Office Supplies', -380.00, 'expense', 'Office Expenses', 'Supplies', 'Staples', 2024, 2, 5),
    ('11111111-1111-1111-1111-111111111111', '2024-06-15', 'Professional Development', -1200.00, 'expense', 'Training', 'Courses', 'Udemy', 2024, 2, 6),
    ('11111111-1111-1111-1111-111111111111', '2024-07-10', 'Internet & Phone', -480.00, 'expense', 'Utilities', 'Communications', 'Comcast', 2024, 3, 7),
    ('11111111-1111-1111-1111-111111111111', '2024-08-28', 'Insurance Premium', -1200.00, 'expense', 'Insurance', 'Business Insurance', 'State Farm', 2024, 3, 8),
    ('11111111-1111-1111-1111-111111111111', '2024-09-20', 'Legal & Accounting Fees', -2500.00, 'expense', 'Professional Services', 'Accounting', 'Smith & Associates', 2024, 3, 9),
    ('11111111-1111-1111-1111-111111111111', '2024-10-12', 'Travel Expenses', -2100.00, 'expense', 'Travel', 'Client Meetings', 'United Airlines', 2024, 4, 10),
    ('11111111-1111-1111-1111-111111111111', '2024-11-18', 'Equipment Upgrade', -4200.00, 'expense', 'Equipment', 'Computers', 'Apple Store', 2024, 4, 11),
    ('11111111-1111-1111-1111-111111111111', '2024-12-05', 'Year-End Celebration', -1100.00, 'expense', 'Entertainment', 'Employee Events', 'Catering Co', 2024, 4, 12);

-- ============================================
-- MOCK DATA - Green Leaf Consulting
-- ============================================

-- 2023 Revenue - Green Leaf Consulting
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('22222222-2222-2222-2222-222222222222', '2023-01-10', 'Business Strategy Consulting', 6500.00, 'revenue', 'Consulting Revenue', 'Strategy', 'Tech Innovators', 2023, 1, 1),
    ('22222222-2222-2222-2222-222222222222', '2023-02-15', 'Market Research Project', 4200.00, 'revenue', 'Consulting Revenue', 'Research', 'Retail Giants', 2023, 1, 2),
    ('22222222-2222-2222-2222-222222222222', '2023-03-20', 'Change Management Services', 5800.00, 'revenue', 'Consulting Revenue', 'Change Management', 'Finance Corp', 2023, 1, 3),
    ('22222222-2222-2222-2222-222222222222', '2023-04-12', 'Operational Efficiency Audit', 7200.00, 'revenue', 'Consulting Revenue', 'Operations', 'Manufacturing Co', 2023, 2, 4),
    ('22222222-2222-2222-2222-222222222222', '2023-05-18', 'Sustainability Consulting', 3800.00, 'revenue', 'Consulting Revenue', 'Sustainability', 'Green Energy Inc', 2023, 2, 5),
    ('22222222-2222-2222-2222-222222222222', '2023-06-25', 'Digital Transformation Workshop', 5500.00, 'revenue', 'Consulting Revenue', 'Digital', 'Old School Industries', 2023, 2, 6),
    ('22222222-2222-2222-2222-222222222222', '2023-07-08', 'HR Strategy Development', 4900.00, 'revenue', 'Consulting Revenue', 'HR', 'Growing Startup', 2023, 3, 7),
    ('22222222-2222-2222-2222-222222222222', '2023-08-14', 'Financial Planning Services', 6800.00, 'revenue', 'Consulting Revenue', 'Finance', 'Wealth Builders', 2023, 3, 8),
    ('22222222-2222-2222-2222-222222222222', '2023-09-22', 'Supply Chain Optimization', 8200.00, 'revenue', 'Consulting Revenue', 'Operations', 'Logistics Leader', 2023, 3, 9),
    ('22222222-2222-2222-2222-222222222222', '2023-10-16', 'Risk Management Assessment', 5600.00, 'revenue', 'Consulting Revenue', 'Risk', 'Insurance Pros', 2023, 4, 10),
    ('22222222-2222-2222-2222-222222222222', '2023-11-20', 'Leadership Development Program', 4500.00, 'revenue', 'Consulting Revenue', 'Training', 'Corporate Elite', 2023, 4, 11),
    ('22222222-2222-2222-2222-222222222222', '2023-12-15', 'Year-End Strategic Planning', 7100.00, 'revenue', 'Consulting Revenue', 'Strategy', 'Tech Innovators', 2023, 4, 12);

-- 2023 Expenses - Green Leaf Consulting
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('22222222-2222-2222-2222-222222222222', '2023-01-05', 'Office Rent', -1800.00, 'expense', 'Rent', 'Office', 'Building Management', 2023, 1, 1),
    ('22222222-2222-2222-2222-222222222222', '2023-02-10', 'Consultant Salaries', -15000.00, 'expense', 'Payroll', 'Salaries', 'Internal', 2023, 1, 2),
    ('22222222-2222-2222-2222-222222222222', '2023-03-15', 'Professional Memberships', -1200.00, 'expense', 'Professional Services', 'Memberships', 'Various', 2023, 1, 3),
    ('22222222-2222-2222-2222-222222222222', '2023-05-20', 'Marketing & Website', -2500.00, 'expense', 'Marketing', 'Digital', 'Marketing Agency', 2023, 2, 5),
    ('22222222-2222-2222-2222-222222222222', '2023-07-12', 'Conference Attendance', -3200.00, 'expense', 'Travel', 'Professional Development', 'Event Organizers', 2023, 3, 7),
    ('22222222-2222-2222-2222-222222222222', '2023-09-08', 'Software Subscriptions', -850.00, 'expense', 'Software', 'Business Tools', 'Microsoft', 2023, 3, 9),
    ('22222222-2222-2222-2222-222222222222', '2023-11-18', 'Insurance', -1600.00, 'expense', 'Insurance', 'Liability', 'Insurance Co', 2023, 4, 11);

-- 2024 Revenue - Green Leaf Consulting (15% growth)
INSERT INTO financial_transactions (company_id, transaction_date, description, amount, transaction_type, category, subcategory, vendor_customer, fiscal_year, fiscal_quarter, fiscal_month) VALUES
    ('22222222-2222-2222-2222-222222222222', '2024-01-12', 'Business Strategy Consulting', 7500.00, 'revenue', 'Consulting Revenue', 'Strategy', 'Tech Innovators', 2024, 1, 1),
    ('22222222-2222-2222-2222-222222222222', '2024-02-18', 'Market Research & Analysis', 4800.00, 'revenue', 'Consulting Revenue', 'Research', 'Retail Giants', 2024, 1, 2),
    ('22222222-2222-2222-2222-222222222222', '2024-03-22', 'Organizational Change Services', 6700.00, 'revenue', 'Consulting Revenue', 'Change Management', 'Finance Corp', 2024, 1, 3),
    ('22222222-2222-2222-2222-222222222222', '2024-04-15', 'Process Improvement Project', 8300.00, 'revenue', 'Consulting Revenue', 'Operations', 'Manufacturing Co', 2024, 2, 4),
    ('22222222-2222-2222-2222-222222222222', '2024-05-20', 'ESG Consulting Services', 4400.00, 'revenue', 'Consulting Revenue', 'Sustainability', 'Green Energy Inc', 2024, 2, 5),
    ('22222222-2222-2222-2222-222222222222', '2024-06-28', 'Digital Strategy Workshop', 6300.00, 'revenue', 'Consulting Revenue', 'Digital', 'Old School Industries', 2024, 2, 6),
    ('22222222-2222-2222-2222-222222222222', '2024-07-10', 'Talent Management Consulting', 5600.00, 'revenue', 'Consulting Revenue', 'HR', 'Growing Startup', 2024, 3, 7),
    ('22222222-2222-2222-2222-222222222222', '2024-08-16', 'Financial Advisory Services', 7800.00, 'revenue', 'Consulting Revenue', 'Finance', 'Wealth Builders', 2024, 3, 8),
    ('22222222-2222-2222-2222-222222222222', '2024-09-24', 'Supply Chain Redesign', 9400.00, 'revenue', 'Consulting Revenue', 'Operations', 'Logistics Leader', 2024, 3, 9),
    ('22222222-2222-2222-2222-222222222222', '2024-10-18', 'Enterprise Risk Management', 6400.00, 'revenue', 'Consulting Revenue', 'Risk', 'Insurance Pros', 2024, 4, 10),
    ('22222222-2222-2222-2222-222222222222', '2024-11-22', 'Executive Coaching Program', 5200.00, 'revenue', 'Consulting Revenue', 'Training', 'Corporate Elite', 2024, 4, 11),
    ('22222222-2222-2222-2222-222222222222', '2024-12-18', 'Strategic Planning Session', 8200.00, 'revenue', 'Consulting Revenue', 'Strategy', 'Tech Innovators', 2024, 4, 12);

-- ============================================
-- MOCK FAQ CONTENT
-- ============================================

INSERT INTO faq_content (category, question, answer, keywords, priority) VALUES
    ('Services', 'What accounting services do you offer?', 'We provide comprehensive accounting services including bookkeeping, tax preparation, financial statement preparation, payroll processing, business advisory, and CFO consulting services.', ARRAY['services', 'bookkeeping', 'tax', 'payroll', 'advisory'], 10),
    ('Services', 'Do you handle tax preparation for small businesses?', 'Yes, we specialize in tax preparation for small businesses, including Schedule C, corporate returns (1120, 1120S), partnership returns (1065), and state tax filings.', ARRAY['tax', 'preparation', 'small business', 'returns'], 9),
    ('Pricing', 'What are your pricing packages?', 'We offer three main packages: Basic ($299/month) - bookkeeping and monthly financials; Professional ($599/month) - includes tax planning and quarterly reviews; Premium ($999/month) - full-service including CFO advisory and unlimited consultations.', ARRAY['pricing', 'packages', 'cost', 'fees'], 10),
    ('Pricing', 'Do you charge extra for tax season?', 'Tax preparation is included in Professional and Premium packages. Basic package clients receive a discounted rate of $500 for business tax returns.', ARRAY['tax', 'pricing', 'fees', 'extra'], 8),
    ('Process', 'How do I upload documents?', 'You can upload documents directly through this chat by sending PDFs, images, or Excel files. Our AI will extract the information and create journal entries for review.', ARRAY['upload', 'documents', 'process', 'how to'], 9),
    ('Process', 'How long does document processing take?', 'Most documents are processed within 24 hours. Our AI extracts the information immediately, and our accountants review and approve entries within one business day.', ARRAY['processing', 'time', 'how long', 'turnaround'], 8),
    ('Process', 'What happens after I upload a document?', 'After upload: 1) AI extracts data using OCR/vision, 2) System generates journal entries in Excel, 3) Our accountant reviews for accuracy, 4) Entries are posted to your books, 5) You receive a notification when complete.', ARRAY['process', 'workflow', 'upload', 'what happens'], 9),
    ('Deadlines', 'When are business tax deadlines?', 'Common deadlines: March 15 (S-Corps/Partnerships), April 15 (C-Corps and Schedule C), September 15 and October 15 (extended deadlines). Quarterly estimated taxes due April 15, June 15, Sept 15, and Jan 15.', ARRAY['deadlines', 'tax', 'due dates', 'filing'], 10),
    ('Deadlines', 'What is the deadline for annual financial statements?', 'We recommend preparing annual financial statements by February 28th to allow time for tax preparation. However, we can work with your specific needs and bank requirements.', ARRAY['financial statements', 'deadline', 'annual'], 7),
    ('Requirements', 'What documents do I need for bookkeeping?', 'Required documents: bank statements, credit card statements, invoices, receipts, payroll reports, loan statements, and any contracts or agreements affecting finances.', ARRAY['documents', 'requirements', 'bookkeeping', 'needed'], 9),
    ('Requirements', 'What do I need to provide for tax preparation?', 'For tax prep: prior year return, income documents (1099s, K-1s), expense receipts, asset purchase records, payroll summaries, business loan interest statements, and home office details if applicable.', ARRAY['tax', 'requirements', 'documents', 'needed'], 9),
    ('Support', 'How do I contact an accountant directly?', 'You can request to speak with an accountant anytime by typing "speak to accountant" or "escalate" in this chat. We''ll connect you within 2 business hours during office hours (M-F 9am-6pm EST).', ARRAY['contact', 'accountant', 'support', 'help'], 10),
    ('Support', 'What are your business hours?', 'Our office hours are Monday-Friday 9am-6pm EST. This AI assistant is available 24/7 for queries, document uploads, and report requests. Urgent matters will be escalated to our on-call accountant.', ARRAY['hours', 'availability', 'when', 'open'], 8),
    ('Reports', 'Can I get a Profit & Loss statement?', 'Yes! Just ask "Send me my P&L for [year]" and I''ll generate it immediately from your financial data. You can choose Excel or PDF format.', ARRAY['profit loss', 'P&L', 'report', 'statement'], 10),
    ('Reports', 'What reports can you generate?', 'I can generate: Profit & Loss statements, Balance Sheets, Cash Flow statements, Expense reports by category, Revenue analysis, and custom reports. Just specify the period and format you need.', ARRAY['reports', 'generate', 'available', 'types'], 9),
    ('Security', 'Is my financial data secure?', 'Yes, we use bank-level encryption (AES-256), secure cloud storage with Supabase, role-based access controls, and comply with SOC 2 standards. Your data is never shared without authorization.', ARRAY['security', 'safe', 'privacy', 'encryption'], 10),
    ('Features', 'Can you compare financial data across years?', 'Absolutely! I can compare any financial metrics across multiple years. Try asking "Compare my revenue 2023 vs 2024" or "Show expenses year over year".', ARRAY['compare', 'analysis', 'year over year', 'trends'], 8);

-- ============================================
-- MOCK SAMPLE CONVERSATIONS
-- ============================================

INSERT INTO conversations (user_id, company_id, message_role, message_content, session_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'user', 'What was my revenue last year?', 'session_001'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'assistant', 'Your total revenue for 2023 was $79,000. This included software development services, consulting, and managed services contracts.', 'session_001'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'user', 'How does that compare to 2024?', 'session_001'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'assistant', 'Your 2024 revenue was $97,700, representing a 23.7% increase over 2023 ($79,000). Great growth!', 'session_001');

-- ============================================
-- SAMPLE ESCALATION
-- ============================================

INSERT INTO escalations (company_id, user_id, query_text, ai_confidence, reason, status, assigned_to) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'I need help understanding a complex IRS notice I received', 0.45, 'Low confidence - requires tax professional expertise for IRS notice', 'open', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- ============================================
-- UTILITY VIEWS (Optional but helpful)
-- ============================================

-- View for Profit & Loss calculation
CREATE OR REPLACE VIEW view_profit_loss AS
SELECT
    company_id,
    fiscal_year,
    fiscal_quarter,
    SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
    SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) -
    SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END) as net_profit
FROM financial_transactions
GROUP BY company_id, fiscal_year, fiscal_quarter
ORDER BY company_id, fiscal_year, fiscal_quarter;

-- View for document processing dashboard
CREATE OR REPLACE VIEW view_document_status AS
SELECT
    d.company_id,
    d.status,
    COUNT(*) as document_count,
    MAX(d.uploaded_at) as latest_upload
FROM documents d
GROUP BY d.company_id, d.status;

COMMENT ON TABLE companies IS 'Stores company/client information';
COMMENT ON TABLE users IS 'User accounts with role-based access (client or admin)';
COMMENT ON TABLE financial_transactions IS 'All financial data including revenue, expenses, assets, liabilities';
COMMENT ON TABLE documents IS 'Tracks uploaded documents and their processing status';
COMMENT ON TABLE conversations IS 'Chat history for AI assistant interactions';
COMMENT ON TABLE faq_content IS 'Knowledge base for FAQ responses';
COMMENT ON TABLE escalations IS 'Tracks queries escalated to human accountants';

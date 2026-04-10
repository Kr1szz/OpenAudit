CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id INT,
  gstin TEXT,
  fiscal_year_start TEXT DEFAULT '04-01',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  org_id INT REFERENCES organizations(id),
  org_role TEXT DEFAULT 'employee',
  plan TEXT DEFAULT 'personal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  org_id INT REFERENCES organizations(id),
  file_path TEXT NOT NULL,
  file_type TEXT,
  vendor TEXT,
  amount NUMERIC(14,2),
  currency TEXT DEFAULT 'INR',
  receipt_date DATE,
  category TEXT,
  items JSONB DEFAULT '[]',
  raw_gemini_response JSONB,
  confidence_score FLOAT,
  is_flagged BOOLEAN DEFAULT false,
  anomaly_reasons TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'web',
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_access (
  id SERIAL PRIMARY KEY,
  receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
  granted_to_user_id INT REFERENCES users(id),
  granted_by_user_id INT REFERENCES users(id),
  permission TEXT DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_invites (
  id SERIAL PRIMARY KEY,
  org_id INT REFERENCES organizations(id),
  invited_email TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS financial_statements (
  id SERIAL PRIMARY KEY,
  org_id INT REFERENCES organizations(id),
  type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  data JSONB DEFAULT '{}',
  generated_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  org_id INT REFERENCES organizations(id),
  action TEXT NOT NULL,
  receipt_id INT REFERENCES receipts(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_org ON receipts(org_id);
CREATE INDEX IF NOT EXISTS idx_receipts_flagged ON receipts(is_flagged);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_doc_access_user ON document_access(granted_to_user_id);
ALTER TABLE users ADD COLUMN role text;
ALTER TABLE receipts DROP COLUMN raw_gemini_response, ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT now();
CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    financial_year VARCHAR(20) DEFAULT '2025-2026',
    --personal
    annualIncome DECIMAL(15,2),
    basicPay DECIMAL(15,2) ,
    hra_received DECIMAL(15,2) ,
    other_income DECIMAL(15,2) ,
    --deductions
    investments_80C DECIMAL(15,2),
    medical_80D DECIMAL(15,2),
    nps_80CCD DECIMAL(15,2),
    education_80E DECIMAL(15,2),
    rent_paid DECIMAL(15,2),
    professional_tax DECIMAL(15,2),
    other_deductions DECIMAL(15,2) ,
    --calculated fields
    standard_deduction DECIMAL(15,2),
    hra_exemption DECIMAL(15,2),
    --final
    calculated_old_tax DECIMAL(15,2),
    calculated_new_tax DECIMAL(15,2),
    final_tax DECIMAL(15,2),
    savings DECIMAL(15,2),
    recommendation VARCHAR(255),
    --creation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE receipts DROP COLUMN timestamp;
ALTER TABLE receipts add column transaction_time TIME;
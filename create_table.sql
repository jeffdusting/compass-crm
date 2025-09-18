-- Create contacts table for CompassCRM
-- This table stores contact information for both CBS Group and Water Roads tenants

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    address TEXT,
    notes TEXT,
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);

-- Create unique constraint on email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_tenant_email ON contacts(tenant_id, email);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO contacts (tenant_id, first_name, last_name, email, company, job_title, phone, notes, tags) VALUES
('cbs_group', 'John', 'Smith', 'john.smith@cbsgroup.com.au', 'CBS Group', 'General Manager', '+61 2 9876 5432', 'Key decision maker for IT projects', ARRAY['vip', 'decision-maker']),
('cbs_group', 'Sarah', 'Johnson', 'sarah.johnson@cbsgroup.com.au', 'CBS Group', 'IT Director', '+61 2 9876 5433', 'Technical contact for system implementations', ARRAY['technical', 'it']),
('water_roads', 'Michael', 'Brown', 'michael.brown@waterroads.com.au', 'Water Roads', 'Operations Manager', '+61 3 8765 4321', 'Manages day-to-day operations', ARRAY['operations', 'manager']),
('water_roads', 'Lisa', 'Davis', 'lisa.davis@waterroads.com.au', 'Water Roads', 'Finance Director', '+61 3 8765 4322', 'Budget approval authority', ARRAY['finance', 'budget-approval'])
ON CONFLICT (tenant_id, email) DO NOTHING;


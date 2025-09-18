-- Create contacts table for CompassCRM
-- This table stores contact information for both CBS Group and Water Roads tenants

-- Enable RLS (Row Level Security)
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
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
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

-- Create RLS policies for multi-tenant access
-- Users can only access contacts from their own tenant
CREATE POLICY "Users can view contacts from their tenant" ON contacts
    FOR SELECT USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::text
    );

CREATE POLICY "Users can insert contacts to their tenant" ON contacts
    FOR INSERT WITH CHECK (
        tenant_id = (auth.jwt() ->> 'tenant_id')::text
    );

CREATE POLICY "Users can update contacts from their tenant" ON contacts
    FOR UPDATE USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::text
    );

CREATE POLICY "Users can delete contacts from their tenant" ON contacts
    FOR DELETE USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::text
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for contact search
CREATE OR REPLACE FUNCTION search_contacts(
    search_term TEXT DEFAULT '',
    tenant_filter TEXT DEFAULT NULL,
    company_filter TEXT DEFAULT NULL,
    tags_filter TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    tenant_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    address TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.tenant_id, c.first_name, c.last_name, c.email, 
        c.phone, c.company, c.job_title, c.address, c.notes, 
        c.tags, c.created_at, c.updated_at
    FROM contacts c
    WHERE 
        (tenant_filter IS NULL OR c.tenant_id = tenant_filter)
        AND (
            search_term = '' OR
            c.first_name ILIKE '%' || search_term || '%' OR
            c.last_name ILIKE '%' || search_term || '%' OR
            c.email ILIKE '%' || search_term || '%' OR
            c.company ILIKE '%' || search_term || '%'
        )
        AND (company_filter IS NULL OR c.company ILIKE '%' || company_filter || '%')
        AND (tags_filter IS NULL OR c.tags && tags_filter)
    ORDER BY c.updated_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Compass CRM Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(200),
    title VARCHAR(100),
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    value DECIMAL(12,2),
    stage VARCHAR(50) DEFAULT 'Lead',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Planned',
    priority VARCHAR(20) DEFAULT 'Medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email integrations table
CREATE TABLE IF NOT EXISTS email_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task integrations table
CREATE TABLE IF NOT EXISTS task_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    access_token TEXT,
    workspace_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import jobs table
CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can customize these later)
CREATE POLICY "Enable read access for all users" ON contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON contacts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON opportunities FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON opportunities FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON activities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON activities FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON activities FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON email_integrations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON email_integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON email_integrations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON email_integrations FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON task_integrations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON task_integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON task_integrations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON task_integrations FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON import_jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON import_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON import_jobs FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON import_jobs FOR DELETE USING (true);

-- Insert sample data for testing
INSERT INTO contacts (first_name, last_name, email, company, tags) VALUES
('John', 'Smith', 'john@techcorp.com', 'Tech Corp', ARRAY['CBS']),
('Sarah', 'Johnson', 'sarah@watertech.com', 'Water Tech', ARRAY['Water Roads']),
('Mike', 'Wilson', 'mike@construction.com', 'Wilson Construction', ARRAY['CBS', 'Water Roads'])
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, first_name, last_name, role) VALUES
('admin@cbsgroup.com', 'Admin', 'User', 'admin'),
('sales@waterroads.com', 'Sales', 'Rep', 'user')
ON CONFLICT (email) DO NOTHING;


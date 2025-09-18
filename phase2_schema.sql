-- Phase 2: Opportunity and Activity Services Database Schema
-- This extends the existing contacts table with opportunities and activities

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    title TEXT NOT NULL,
    description TEXT,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    stage TEXT NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) DEFAULT 'lead',
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'AUD',
    probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    source TEXT, -- How the opportunity was generated
    assigned_to TEXT, -- User responsible for the opportunity
    tags TEXT[], -- Array of tags
    custom_fields JSONB, -- Flexible custom fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note', 'follow_up')),
    subject TEXT NOT NULL,
    description TEXT,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- For calls and meetings
    outcome TEXT, -- Result of the activity
    assigned_to TEXT, -- User responsible for the activity
    tags TEXT[], -- Array of tags
    custom_fields JSONB, -- Flexible custom fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunities USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_tags ON activities USING GIN(tags);

-- Enable Row Level Security (will be disabled for testing like contacts)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create triggers for automatic updated_at timestamps
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at 
    BEFORE UPDATE ON activities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for testing (like contacts table)
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Insert sample opportunities data
INSERT INTO opportunities (tenant_id, title, description, contact_id, stage, value, probability, expected_close_date, source, assigned_to, tags) VALUES
-- CBS Group opportunities
((SELECT id FROM contacts WHERE email = 'john.smith@cbsgroup.com.au'), 'cbs_group', 'IT Infrastructure Upgrade', 'Complete overhaul of CBS Group IT infrastructure including servers, networking, and security systems', 'qualified', 250000.00, 75, '2025-12-31', 'referral', 'sales_team', ARRAY['infrastructure', 'high-value']),
((SELECT id FROM contacts WHERE email = 'sarah.johnson@cbsgroup.com.au'), 'cbs_group', 'CRM System Implementation', 'Implementation of new CRM system for CBS Group sales and marketing teams', 'proposal', 85000.00, 60, '2025-11-15', 'inbound', 'sales_team', ARRAY['software', 'crm']),
-- Water Roads opportunities  
((SELECT id FROM contacts WHERE email = 'michael.brown@waterroads.com.au'), 'water_roads', 'Operations Management System', 'Custom operations management system for Water Roads logistics and scheduling', 'negotiation', 150000.00, 80, '2025-10-30', 'direct_sales', 'sales_team', ARRAY['operations', 'custom-software'])
ON CONFLICT DO NOTHING;

-- Insert sample activities data
INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) VALUES
-- Activities for CBS Group
('cbs_group', 'call', 'Initial Discovery Call', 'Discuss IT infrastructure requirements and current pain points', (SELECT id FROM contacts WHERE email = 'john.smith@cbsgroup.com.au'), (SELECT id FROM opportunities WHERE title = 'IT Infrastructure Upgrade'), 'completed', 'high', '2025-09-15 10:00:00+00', 'sales_team', ARRAY['discovery', 'initial']),
('cbs_group', 'meeting', 'Technical Requirements Meeting', 'Deep dive into technical specifications and requirements', (SELECT id FROM contacts WHERE email = 'sarah.johnson@cbsgroup.com.au'), (SELECT id FROM opportunities WHERE title = 'CRM System Implementation'), 'planned', 'high', '2025-09-25 14:00:00+00', 'sales_team', ARRAY['technical', 'requirements']),
('cbs_group', 'task', 'Prepare Proposal', 'Create detailed proposal for CRM implementation', (SELECT id FROM contacts WHERE email = 'sarah.johnson@cbsgroup.com.au'), (SELECT id FROM opportunities WHERE title = 'CRM System Implementation'), 'in_progress', 'medium', '2025-09-22 17:00:00+00', 'sales_team', ARRAY['proposal', 'documentation']),
-- Activities for Water Roads
('water_roads', 'call', 'Follow-up Call', 'Follow up on operations system requirements and timeline', (SELECT id FROM contacts WHERE email = 'michael.brown@waterroads.com.au'), (SELECT id FROM opportunities WHERE title = 'Operations Management System'), 'planned', 'medium', '2025-09-20 11:00:00+00', 'sales_team', ARRAY['follow-up', 'timeline']),
('water_roads', 'meeting', 'Contract Negotiation', 'Negotiate contract terms and pricing for operations system', (SELECT id FROM contacts WHERE email = 'michael.brown@waterroads.com.au'), (SELECT id FROM opportunities WHERE title = 'Operations Management System'), 'planned', 'urgent', '2025-09-28 15:30:00+00', 'sales_team', ARRAY['negotiation', 'contract'])
ON CONFLICT DO NOTHING;


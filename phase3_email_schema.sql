-- Phase 3: Microsoft Graph Email Integration Schema
-- Creates tables for email accounts, emails, and calendar events

-- Email Accounts Table
-- Stores OAuth tokens and account information for email providers
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    user_email TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google')),
    provider_user_id TEXT NOT NULL, -- Microsoft: user ID, Google: email
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT, -- Permissions granted
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'error')),
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, provider, provider_user_id)
);

-- Emails Table
-- Stores synchronized emails from email providers
CREATE TABLE IF NOT EXISTS emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    provider_message_id TEXT NOT NULL, -- Unique ID from email provider
    thread_id TEXT, -- Email thread/conversation ID
    subject TEXT,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    recipient_emails TEXT[], -- Array of recipient email addresses
    cc_emails TEXT[], -- Array of CC email addresses
    bcc_emails TEXT[], -- Array of BCC email addresses
    body_preview TEXT, -- First 255 characters of email body
    body_content TEXT, -- Full email body content
    is_read BOOLEAN DEFAULT false,
    importance TEXT CHECK (importance IN ('low', 'normal', 'high')),
    has_attachments BOOLEAN DEFAULT false,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    contact_id UUID REFERENCES contacts(id), -- Linked contact (if identified)
    opportunity_id UUID REFERENCES opportunities(id), -- Linked opportunity (if identified)
    activity_id UUID REFERENCES activities(id), -- Associated activity record
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email_account_id, provider_message_id)
);

-- Calendar Events Table
-- Stores synchronized calendar events from email providers
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id TEXT NOT NULL CHECK (tenant_id IN ('cbs_group', 'water_roads')),
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    provider_event_id TEXT NOT NULL, -- Unique ID from calendar provider
    subject TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    organizer_email TEXT,
    organizer_name TEXT,
    attendee_emails TEXT[], -- Array of attendee email addresses
    attendee_names TEXT[], -- Array of attendee names
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'appointment', 'call', 'other')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
    contact_id UUID REFERENCES contacts(id), -- Primary contact (if identified)
    opportunity_id UUID REFERENCES opportunities(id), -- Linked opportunity (if identified)
    activity_id UUID REFERENCES activities(id), -- Associated activity record
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email_account_id, provider_event_id)
);

-- Email Attachments Table
-- Stores information about email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type TEXT,
    size_bytes INTEGER,
    provider_attachment_id TEXT, -- ID from email provider
    download_url TEXT, -- Temporary download URL (if available)
    is_inline BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_accounts_tenant_provider ON email_accounts(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_email ON email_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_email_accounts_active ON email_accounts(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_emails_tenant_id ON emails(tenant_id);
CREATE INDEX IF NOT EXISTS idx_emails_account_id ON emails(email_account_id);
CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(sender_email);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_emails_opportunity_id ON emails(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_tags ON emails USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_calendar_events_tenant_id ON calendar_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_account_id ON calendar_events(email_account_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_contact_id ON calendar_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_opportunity_id ON calendar_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer ON calendar_events(organizer_email);

CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);

-- Enable Row Level Security for all new tables
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi-tenant isolation
-- Email Accounts policies
CREATE POLICY email_accounts_tenant_isolation ON email_accounts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

-- Emails policies  
CREATE POLICY emails_tenant_isolation ON emails
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

-- Calendar Events policies
CREATE POLICY calendar_events_tenant_isolation ON calendar_events
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));

-- Email Attachments policies (inherit from parent email)
CREATE POLICY email_attachments_tenant_isolation ON email_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM emails 
            WHERE emails.id = email_attachments.email_id 
            AND emails.tenant_id = current_setting('app.current_tenant', true)
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_email_accounts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_emails()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_calendar_events()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER trigger_update_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_email_accounts();

CREATE TRIGGER trigger_update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_emails();

CREATE TRIGGER trigger_update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_calendar_events();

-- Insert sample data for testing (will be replaced with real OAuth data)
INSERT INTO email_accounts (tenant_id, user_email, provider, provider_user_id, access_token, refresh_token, scope, is_active, sync_status)
VALUES 
('cbs_group', 'john.smith@cbsgroup.com.au', 'microsoft', 'john.smith@cbsgroup.com.au', 'sample_access_token_1', 'sample_refresh_token_1', 'Mail.Read Calendar.Read', true, 'pending'),
('water_roads', 'michael.brown@waterroads.com.au', 'microsoft', 'michael.brown@waterroads.com.au', 'sample_access_token_2', 'sample_refresh_token_2', 'Mail.Read Calendar.Read', true, 'pending')
ON CONFLICT (tenant_id, provider, provider_user_id) DO NOTHING;

-- Insert sample emails for testing
INSERT INTO emails (tenant_id, email_account_id, provider_message_id, subject, sender_email, sender_name, recipient_emails, body_preview, received_at, contact_id)
SELECT 
    'cbs_group',
    ea.id,
    'msg_001_' || ea.id,
    'CRM System Implementation Discussion',
    'sarah.johnson@cbsgroup.com.au',
    'Sarah Johnson',
    ARRAY['john.smith@cbsgroup.com.au'],
    'Hi John, I wanted to follow up on our discussion about the CRM system implementation. The technical requirements look good...',
    NOW() - INTERVAL '2 hours',
    c.id
FROM email_accounts ea
JOIN contacts c ON c.email = 'sarah.johnson@cbsgroup.com.au'
WHERE ea.tenant_id = 'cbs_group' AND ea.provider = 'microsoft'
ON CONFLICT (email_account_id, provider_message_id) DO NOTHING;

INSERT INTO emails (tenant_id, email_account_id, provider_message_id, subject, sender_email, sender_name, recipient_emails, body_preview, received_at, contact_id)
SELECT 
    'water_roads',
    ea.id,
    'msg_002_' || ea.id,
    'Operations Management System Update',
    'lisa.davis@waterroads.com.au',
    'Lisa Davis',
    ARRAY['michael.brown@waterroads.com.au'],
    'Michael, here is the latest update on the operations management system project. The budget has been approved...',
    NOW() - INTERVAL '1 day',
    c.id
FROM email_accounts ea
JOIN contacts c ON c.email = 'lisa.davis@waterroads.com.au'
WHERE ea.tenant_id = 'water_roads' AND ea.provider = 'microsoft'
ON CONFLICT (email_account_id, provider_message_id) DO NOTHING;

-- Insert sample calendar events for testing
INSERT INTO calendar_events (tenant_id, email_account_id, provider_event_id, subject, description, start_time, end_time, organizer_email, organizer_name, attendee_emails, contact_id)
SELECT 
    'cbs_group',
    ea.id,
    'event_001_' || ea.id,
    'CRM Implementation Planning Meeting',
    'Discuss technical requirements and timeline for CRM implementation',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    'john.smith@cbsgroup.com.au',
    'John Smith',
    ARRAY['sarah.johnson@cbsgroup.com.au', 'john.smith@cbsgroup.com.au'],
    c.id
FROM email_accounts ea
JOIN contacts c ON c.email = 'sarah.johnson@cbsgroup.com.au'
WHERE ea.tenant_id = 'cbs_group' AND ea.provider = 'microsoft'
ON CONFLICT (email_account_id, provider_event_id) DO NOTHING;

INSERT INTO calendar_events (tenant_id, email_account_id, provider_event_id, subject, description, start_time, end_time, organizer_email, organizer_name, attendee_emails, contact_id)
SELECT 
    'water_roads',
    ea.id,
    'event_002_' || ea.id,
    'Operations System Review',
    'Monthly review of operations management system progress',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '30 minutes',
    'michael.brown@waterroads.com.au',
    'Michael Brown',
    ARRAY['lisa.davis@waterroads.com.au', 'michael.brown@waterroads.com.au'],
    c.id
FROM email_accounts ea
JOIN contacts c ON c.email = 'lisa.davis@waterroads.com.au'
WHERE ea.tenant_id = 'water_roads' AND ea.provider = 'microsoft'
ON CONFLICT (email_account_id, provider_event_id) DO NOTHING;


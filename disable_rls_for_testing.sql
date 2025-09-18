-- Temporarily disable RLS for testing
-- This allows us to test the application without authentication

-- Disable RLS on contacts table
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Verify sample data exists
SELECT COUNT(*) as total_contacts FROM contacts;

-- Show all contacts
SELECT id, tenant_id, first_name, last_name, email, company FROM contacts;


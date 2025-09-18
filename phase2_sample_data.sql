-- Phase 2: Sample Data for Opportunities and Activities
-- Run this AFTER creating the tables with phase2_schema_fixed.sql

-- Insert sample opportunities data
INSERT INTO opportunities (tenant_id, title, description, contact_id, stage, value, probability, expected_close_date, source, assigned_to, tags) 
SELECT 
    'cbs_group',
    'IT Infrastructure Upgrade',
    'Complete overhaul of CBS Group IT infrastructure including servers, networking, and security systems',
    c.id,
    'qualified',
    250000.00,
    75,
    '2025-12-31',
    'referral',
    'sales_team',
    ARRAY['infrastructure', 'high-value']
FROM contacts c 
WHERE c.email = 'john.smith@cbsgroup.com.au'
LIMIT 1;

INSERT INTO opportunities (tenant_id, title, description, contact_id, stage, value, probability, expected_close_date, source, assigned_to, tags) 
SELECT 
    'cbs_group',
    'CRM System Implementation',
    'Implementation of new CRM system for CBS Group sales and marketing teams',
    c.id,
    'proposal',
    85000.00,
    60,
    '2025-11-15',
    'inbound',
    'sales_team',
    ARRAY['software', 'crm']
FROM contacts c 
WHERE c.email = 'sarah.johnson@cbsgroup.com.au'
LIMIT 1;

INSERT INTO opportunities (tenant_id, title, description, contact_id, stage, value, probability, expected_close_date, source, assigned_to, tags) 
SELECT 
    'water_roads',
    'Operations Management System',
    'Custom operations management system for Water Roads logistics and scheduling',
    c.id,
    'negotiation',
    150000.00,
    80,
    '2025-10-30',
    'direct_sales',
    'sales_team',
    ARRAY['operations', 'custom-software']
FROM contacts c 
WHERE c.email = 'michael.brown@waterroads.com.au'
LIMIT 1;

-- Insert sample activities data
INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) 
SELECT 
    'cbs_group',
    'call',
    'Initial Discovery Call',
    'Discuss IT infrastructure requirements and current pain points',
    c.id,
    o.id,
    'completed',
    'high',
    '2025-09-15 10:00:00+00',
    'sales_team',
    ARRAY['discovery', 'initial']
FROM contacts c, opportunities o 
WHERE c.email = 'john.smith@cbsgroup.com.au' 
AND o.title = 'IT Infrastructure Upgrade'
LIMIT 1;

INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) 
SELECT 
    'cbs_group',
    'meeting',
    'Technical Requirements Meeting',
    'Deep dive into technical specifications and requirements',
    c.id,
    o.id,
    'planned',
    'high',
    '2025-09-25 14:00:00+00',
    'sales_team',
    ARRAY['technical', 'requirements']
FROM contacts c, opportunities o 
WHERE c.email = 'sarah.johnson@cbsgroup.com.au' 
AND o.title = 'CRM System Implementation'
LIMIT 1;

INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) 
SELECT 
    'cbs_group',
    'task',
    'Prepare Proposal',
    'Create detailed proposal for CRM implementation',
    c.id,
    o.id,
    'in_progress',
    'medium',
    '2025-09-22 17:00:00+00',
    'sales_team',
    ARRAY['proposal', 'documentation']
FROM contacts c, opportunities o 
WHERE c.email = 'sarah.johnson@cbsgroup.com.au' 
AND o.title = 'CRM System Implementation'
LIMIT 1;

INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) 
SELECT 
    'water_roads',
    'call',
    'Follow-up Call',
    'Follow up on operations system requirements and timeline',
    c.id,
    o.id,
    'planned',
    'medium',
    '2025-09-20 11:00:00+00',
    'sales_team',
    ARRAY['follow-up', 'timeline']
FROM contacts c, opportunities o 
WHERE c.email = 'michael.brown@waterroads.com.au' 
AND o.title = 'Operations Management System'
LIMIT 1;

INSERT INTO activities (tenant_id, type, subject, description, contact_id, opportunity_id, status, priority, due_date, assigned_to, tags) 
SELECT 
    'water_roads',
    'meeting',
    'Contract Negotiation',
    'Negotiate contract terms and pricing for operations system',
    c.id,
    o.id,
    'planned',
    'urgent',
    '2025-09-28 15:30:00+00',
    'sales_team',
    ARRAY['negotiation', 'contract']
FROM contacts c, opportunities o 
WHERE c.email = 'michael.brown@waterroads.com.au' 
AND o.title = 'Operations Management System'
LIMIT 1;


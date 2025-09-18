// Create contacts table using Supabase client
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://dceyomzxuttrrifajeni.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZXlvbXp4dXR0cnJpZmFqZW5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwOTU5NCwiZXhwIjoyMDczNzg1NTk0fQ.okm64oSkzFPXOKdVk8i6ujx5eUiouvav_TqHJMMI-JQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createContactsTable() {
  console.log('Creating contacts table...')
  
  try {
    // Create the table using SQL
    const createTableSQL = `
      -- Create contacts table for CompassCRM
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
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID,
          updated_by UUID
      );
    `
    
    // Execute using RPC call to sql function
    const { data: createResult, error: createError } = await supabase.rpc('sql', { 
      query: createTableSQL 
    })
    
    if (createError) {
      console.log('Direct SQL failed, trying alternative approach...')
      
      // Try creating sample data to test if table exists
      const { data: testData, error: testError } = await supabase
        .from('contacts')
        .insert({
          tenant_id: 'cbs_group',
          first_name: 'Test',
          last_name: 'Contact',
          email: 'test@cbsgroup.com.au',
          company: 'CBS Group',
          job_title: 'Test Manager'
        })
        .select()
      
      if (testError) {
        console.error('Table does not exist and cannot be created via client:', testError.message)
        console.log('\nPlease create the table manually in Supabase dashboard:')
        console.log('1. Go to https://supabase.com/dashboard/project/dceyomzxuttrrifajeni')
        console.log('2. Navigate to Table Editor')
        console.log('3. Click "Create a new table"')
        console.log('4. Use table name: contacts')
        console.log('5. Add the following columns:')
        console.log('   - id (uuid, primary key, default: gen_random_uuid())')
        console.log('   - tenant_id (text, not null)')
        console.log('   - first_name (text, not null)')
        console.log('   - last_name (text, not null)')
        console.log('   - email (text, not null)')
        console.log('   - phone (text)')
        console.log('   - company (text)')
        console.log('   - job_title (text)')
        console.log('   - address (text)')
        console.log('   - notes (text)')
        console.log('   - tags (text[])')
        console.log('   - created_at (timestamptz, default: now())')
        console.log('   - updated_at (timestamptz, default: now())')
        console.log('   - created_by (uuid)')
        console.log('   - updated_by (uuid)')
        return
      } else {
        console.log('Table already exists! Test contact created:', testData)
      }
    } else {
      console.log('Table created successfully!')
      
      // Add sample data
      const sampleContacts = [
        {
          tenant_id: 'cbs_group',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@cbsgroup.com.au',
          company: 'CBS Group',
          job_title: 'General Manager',
          phone: '+61 2 9876 5432',
          notes: 'Key decision maker for IT projects',
          tags: ['vip', 'decision-maker']
        },
        {
          tenant_id: 'cbs_group',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@cbsgroup.com.au',
          company: 'CBS Group',
          job_title: 'IT Director',
          phone: '+61 2 9876 5433',
          notes: 'Technical contact for system implementations',
          tags: ['technical', 'it']
        },
        {
          tenant_id: 'water_roads',
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'michael.brown@waterroads.com.au',
          company: 'Water Roads',
          job_title: 'Operations Manager',
          phone: '+61 3 8765 4321',
          notes: 'Manages day-to-day operations',
          tags: ['operations', 'manager']
        }
      ]
      
      const { data: insertData, error: insertError } = await supabase
        .from('contacts')
        .insert(sampleContacts)
        .select()
      
      if (insertError) {
        console.error('Error inserting sample data:', insertError)
      } else {
        console.log('Sample contacts created:', insertData.length)
      }
    }
    
  } catch (err) {
    console.error('Setup failed:', err)
  }
}

createContactsTable()


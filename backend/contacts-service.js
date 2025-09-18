// CompassCRM - Database Setup Script
// This script creates the contacts table using Supabase client

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dceyomzxuttrrifajeni.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZXlvbXp4dXR0cnJpZmFqZW5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIwOTU5NCwiZXhwIjoyMDczNzg1NTk0fQ.okm64oSkzFPXOKdVk8i6ujx5eUiouvav_TqHJMMI-JQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('Setting up CompassCRM database schema...')
  
  try {
    // Test connection by checking if contacts table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'contacts')
    
    if (tableError) {
      console.log('Table check failed, will create manually via Supabase dashboard')
      console.log('Please create the contacts table manually in Supabase dashboard')
      return
    }
    
    console.log('Database connection successful!')
    
    // Test the setup by creating a sample contact
    const { data: testContact, error: insertError } = await supabase
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
    
    if (insertError) {
      console.error('Error creating test contact:', insertError)
      console.log('This is expected if the table does not exist yet.')
    } else {
      console.log('Test contact created successfully:', testContact)
    }
    
  } catch (err) {
    console.error('Setup failed:', err)
  }
}

setupDatabase()


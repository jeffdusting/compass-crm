import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user's tenant
export const getCurrentTenant = () => {
  // For now, we'll use a simple approach - in production this would come from user auth
  // This is a placeholder that will be replaced with proper tenant detection
  return 'cbs_group' // Default to CBS Group for development
}

// Contact service functions
export const contactService = {
  // Get all contacts for current tenant
  async getContacts(searchTerm = '', filters = {}) {
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('tenant_id', getCurrentTenant())
      .order('updated_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
    }

    if (filters.company) {
      query = query.ilike('company', `%${filters.company}%`)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get single contact by ID
  async getContact(id) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', getCurrentTenant())
      .single()

    if (error) throw error
    return data
  },

  // Create new contact
  async createContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contactData,
        tenant_id: getCurrentTenant()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update contact
  async updateContact(id, contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', id)
      .eq('tenant_id', getCurrentTenant())
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete contact
  async deleteContact(id) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', getCurrentTenant())

    if (error) throw error
    return true
  },

  // Import contacts from CSV data
  async importContacts(contactsArray) {
    const contactsWithTenant = contactsArray.map(contact => ({
      ...contact,
      tenant_id: getCurrentTenant()
    }))

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactsWithTenant)
      .select()

    if (error) throw error
    return data
  }
}


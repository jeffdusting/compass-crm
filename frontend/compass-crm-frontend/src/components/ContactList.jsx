import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Mail, Phone, Building } from 'lucide-react'
import { contactService } from '@/lib/supabase'

export function ContactList({ onContactSelect, onContactCreate, onContactEdit }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadContacts()
  }, [searchTerm])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await contactService.getContacts(searchTerm)
      setContacts(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to load contacts: ' + err.message)
      console.error('Error loading contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contactId, contactName) => {
    if (!window.confirm(`Are you sure you want to delete ${contactName}?`)) {
      return
    }

    try {
      await contactService.deleteContact(contactId)
      await loadContacts() // Reload the list
    } catch (err) {
      setError('Failed to delete contact: ' + err.message)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading contacts...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onContactCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Contact
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Contact list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                {searchTerm ? 'No contacts found matching your search.' : 'No contacts yet. Create your first contact!'}
              </div>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div onClick={() => onContactSelect(contact)} className="flex-1">
                    <CardTitle className="text-lg">
                      {contact.first_name} {contact.last_name}
                    </CardTitle>
                    {contact.job_title && (
                      <p className="text-sm text-gray-600 mt-1">{contact.job_title}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onContactEdit(contact)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(contact.id, `${contact.first_name} ${contact.last_name}`)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


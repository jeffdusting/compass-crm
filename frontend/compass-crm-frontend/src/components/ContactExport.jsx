import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, X } from 'lucide-react'
import { contactService } from '@/lib/supabase'

export default function ContactExport({ onClose, contacts = [] }) {
  const [exporting, setExporting] = useState(false)
  const [selectedFields, setSelectedFields] = useState({
    first_name: true,
    last_name: true,
    email: true,
    phone: true,
    company: true,
    job_title: true,
    address: false,
    notes: false,
    tags: true,
    created_at: false
  })

  const fieldLabels = {
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    job_title: 'Job Title',
    address: 'Address',
    notes: 'Notes',
    tags: 'Tags',
    created_at: 'Created Date'
  }

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const exportToCSV = async () => {
    setExporting(true)
    
    try {
      // Get all contacts if none provided
      const contactsToExport = contacts.length > 0 ? contacts : await contactService.getContacts()
      
      // Filter selected fields
      const selectedFieldKeys = Object.keys(selectedFields).filter(key => selectedFields[key])
      
      // Create CSV headers
      const headers = selectedFieldKeys.map(key => fieldLabels[key])
      
      // Create CSV rows
      const rows = contactsToExport.map(contact => {
        return selectedFieldKeys.map(field => {
          let value = contact[field] || ''
          
          // Handle special formatting
          if (field === 'tags' && Array.isArray(contact.tags)) {
            value = contact.tags.join('; ')
          } else if (field === 'created_at' && contact.created_at) {
            value = new Date(contact.created_at).toLocaleDateString()
          }
          
          // Escape commas and quotes for CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`
          }
          
          return value
        })
      })
      
      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Close modal after successful export
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export Contacts</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Select the fields you want to include in the CSV export:
            </p>
            
            <div className="space-y-3">
              {Object.entries(fieldLabels).map(([field, label]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields[field]}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <label
                    htmlFor={field}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={exportToCSV} disabled={exporting}>
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

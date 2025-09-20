import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, DollarSign, Calendar, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OpportunityForm({ 
  opportunity = null, 
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    probability: 50,
    stage: 'lead',
    expected_close_date: '',
    contact_id: '',
    tags: [],
    notes: ''
  })
  
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState({})

  const stages = [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' }
  ]

  useEffect(() => {
    loadContacts()
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        value: opportunity.value || '',
        probability: opportunity.probability || 50,
        stage: opportunity.stage || 'lead',
        expected_close_date: opportunity.expected_close_date ? 
          new Date(opportunity.expected_close_date).toISOString().split('T')[0] : '',
        contact_id: opportunity.contact_id || '',
        tags: opportunity.tags || [],
        notes: opportunity.notes || ''
      })
    }
  }, [opportunity])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, company, email')
        .order('first_name')

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.contact_id) {
      newErrors.contact_id = 'Contact is required'
    }
    
    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Value must be a valid number'
    }
    
    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    
    try {
      const opportunityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        value: formData.value ? parseFloat(formData.value) : null,
        probability: parseInt(formData.probability),
        stage: formData.stage,
        expected_close_date: formData.expected_close_date || null,
        contact_id: formData.contact_id,
        tags: formData.tags,
        notes: formData.notes.trim(),
        tenant_id: 'cbs_group' // Default tenant
      }

      let result
      if (opportunity) {
        // Update existing opportunity
        result = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', opportunity.id)
          .select()
      } else {
        // Create new opportunity
        result = await supabase
          .from('opportunities')
          .insert([opportunityData])
          .select()
      }

      if (result.error) throw result.error

      onSave(result.data[0])
    } catch (error) {
      console.error('Error saving opportunity:', error)
      alert('Failed to save opportunity: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter opportunity title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact *
              </label>
              <select
                value={formData.contact_id}
                onChange={(e) => handleInputChange('contact_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.contact_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                    {contact.company && ` (${contact.company})`}
                  </option>
                ))}
              </select>
              {errors.contact_id && (
                <p className="text-red-500 text-sm mt-1">{errors.contact_id}</p>
              )}
            </div>

            {/* Value and Probability */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value (AUD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="0.00"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                  <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probability (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => handleInputChange('probability', e.target.value)}
                  className={errors.probability ? 'border-red-500' : ''}
                />
                {errors.probability && (
                  <p className="text-red-500 text-sm mt-1">{errors.probability}</p>
                )}
              </div>
            </div>

            {/* Stage and Expected Close Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stages.map(stage => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Close Date
                </label>
                <Input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the opportunity..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {opportunity ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  opportunity ? 'Update Opportunity' : 'Create Opportunity'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

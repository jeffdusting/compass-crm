import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Calendar, Clock, Users, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ActivityForm({ 
  activity = null, 
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'task',
    status: 'planned',
    priority: 'medium',
    due_date: '',
    contact_id: '',
    opportunity_id: '',
    tags: [],
    notes: ''
  })
  
  const [contacts, setContacts] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState({})

  const activityTypes = [
    { value: 'call', label: 'Call' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'task', label: 'Task' },
    { value: 'note', label: 'Note' },
    { value: 'follow_up', label: 'Follow Up' }
  ]

  const statuses = [
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ]

  useEffect(() => {
    loadData()
    if (activity) {
      setFormData({
        subject: activity.subject || '',
        description: activity.description || '',
        type: activity.type || 'task',
        status: activity.status || 'planned',
        priority: activity.priority || 'medium',
        due_date: activity.due_date ? 
          new Date(activity.due_date).toISOString().slice(0, 16) : '',
        contact_id: activity.contact_id || '',
        opportunity_id: activity.opportunity_id || '',
        tags: activity.tags || [],
        notes: activity.notes || ''
      })
    }
  }, [activity])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, company, email')
        .order('first_name')

      if (contactsError) throw contactsError
      setContacts(contactsData || [])

      // Load opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('id, title, stage')
        .order('title')

      if (opportunitiesError) throw opportunitiesError
      setOpportunities(opportunitiesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.type) {
      newErrors.type = 'Activity type is required'
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
      const activityData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        contact_id: formData.contact_id || null,
        opportunity_id: formData.opportunity_id || null,
        tags: formData.tags,
        notes: formData.notes.trim(),
        tenant_id: 'cbs_group' // Default tenant
      }

      let result
      if (activity) {
        // Update existing activity
        result = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', activity.id)
          .select(`
            *,
            contacts (
              first_name,
              last_name,
              company
            ),
            opportunities (
              title
            )
          `)
      } else {
        // Create new activity
        result = await supabase
          .from('activities')
          .insert([activityData])
          .select(`
            *,
            contacts (
              first_name,
              last_name,
              company
            ),
            opportunities (
              title
            )
          `)
      }

      if (result.error) throw result.error

      onSave(result.data[0])
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Failed to save activity: ' + error.message)
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
              <Calendar className="h-5 w-5" />
              {activity ? 'Edit Activity' : 'Create New Activity'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter activity subject"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                />
              </div>
            </div>

            {/* Contact and Opportunity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Contact
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => handleInputChange('contact_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a contact (optional)</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.company && ` (${contact.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Opportunity
                </label>
                <select
                  value={formData.opportunity_id}
                  onChange={(e) => handleInputChange('opportunity_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select an opportunity (optional)</option>
                  {opportunities.map(opportunity => (
                    <option key={opportunity.id} value={opportunity.id}>
                      {opportunity.title}
                    </option>
                  ))}
                </select>
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
                placeholder="Describe the activity..."
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
                    {activity ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  activity ? 'Update Activity' : 'Create Activity'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

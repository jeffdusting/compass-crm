import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Trash2, 
  Tag, 
  X, 
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { contactService } from '@/lib/supabase'

export default function ContactBulkOperations({ 
  selectedContacts = [], 
  onClose, 
  onOperationComplete 
}) {
  const [operation, setOperation] = useState('') // 'delete', 'addTags', 'removeTags'
  const [processing, setProcessing] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [results, setResults] = useState(null)

  // Get all unique tags from selected contacts
  const allTags = [...new Set(
    selectedContacts
      .flatMap(contact => contact.tags || [])
      .filter(tag => tag && tag.trim())
  )].sort()

  const handleDeleteContacts = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedContacts.length} contacts? This action cannot be undone.`)) {
      return
    }

    setProcessing(true)
    let successCount = 0
    let errorCount = 0
    const errors = []

    try {
      for (const contact of selectedContacts) {
        try {
          await contactService.deleteContact(contact.id)
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`${contact.first_name} ${contact.last_name}: ${error.message}`)
        }
      }

      setResults({
        operation: 'delete',
        total: selectedContacts.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors
      })
    } catch (error) {
      console.error('Bulk delete failed:', error)
      alert('Bulk delete failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleAddTags = async () => {
    if (selectedTags.length === 0 && !newTag.trim()) {
      alert('Please select existing tags or enter a new tag')
      return
    }

    setProcessing(true)
    let successCount = 0
    let errorCount = 0
    const errors = []

    const tagsToAdd = [...selectedTags]
    if (newTag.trim()) {
      tagsToAdd.push(newTag.trim())
    }

    try {
      for (const contact of selectedContacts) {
        try {
          const existingTags = contact.tags || []
          const updatedTags = [...new Set([...existingTags, ...tagsToAdd])]
          
          await contactService.updateContact(contact.id, {
            tags: updatedTags
          })
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`${contact.first_name} ${contact.last_name}: ${error.message}`)
        }
      }

      setResults({
        operation: 'addTags',
        total: selectedContacts.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors,
        tagsAdded: tagsToAdd
      })
    } catch (error) {
      console.error('Bulk tag addition failed:', error)
      alert('Bulk tag addition failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleRemoveTags = async () => {
    if (selectedTags.length === 0) {
      alert('Please select tags to remove')
      return
    }

    setProcessing(true)
    let successCount = 0
    let errorCount = 0
    const errors = []

    try {
      for (const contact of selectedContacts) {
        try {
          const existingTags = contact.tags || []
          const updatedTags = existingTags.filter(tag => !selectedTags.includes(tag))
          
          await contactService.updateContact(contact.id, {
            tags: updatedTags
          })
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`${contact.first_name} ${contact.last_name}: ${error.message}`)
        }
      }

      setResults({
        operation: 'removeTags',
        total: selectedContacts.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors,
        tagsRemoved: selectedTags
      })
    } catch (error) {
      console.error('Bulk tag removal failed:', error)
      alert('Bulk tag removal failed: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleComplete = () => {
    onOperationComplete()
    onClose()
  }

  if (results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Operation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.total}</div>
                  <div className="text-sm text-green-800">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.success}</div>
                  <div className="text-sm text-green-800">Success</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{results.errors}</div>
                  <div className="text-sm text-red-800">Errors</div>
                </div>
              </div>
            </div>

            {results.operation === 'addTags' && results.tagsAdded && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">Tags added:</p>
                <div className="flex flex-wrap gap-1">
                  {results.tagsAdded.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {results.operation === 'removeTags' && results.tagsRemoved && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 mb-2">Tags removed:</p>
                <div className="flex flex-wrap gap-1">
                  {results.tagsRemoved.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {results.errorDetails && results.errorDetails.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 mb-2">Errors:</p>
                <div className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {results.errorDetails.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleComplete}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bulk Operations</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {selectedContacts.length} contacts selected
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!operation && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Choose an operation:</p>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setOperation('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                Delete Selected Contacts
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setOperation('addTags')}
              >
                <Tag className="h-4 w-4 mr-2 text-blue-500" />
                Add Tags to Contacts
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setOperation('removeTags')}
                disabled={allTags.length === 0}
              >
                <Tag className="h-4 w-4 mr-2 text-orange-500" />
                Remove Tags from Contacts
              </Button>
            </div>
          )}

          {operation === 'delete' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete {selectedContacts.length} contacts. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOperation('')}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteContacts}
                  disabled={processing}
                >
                  {processing ? 'Deleting...' : 'Delete Contacts'}
                </Button>
              </div>
            </div>
          )}

          {operation === 'addTags' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Add New Tag</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                </div>
              </div>

              {allTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Or select existing tags to add:
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label htmlFor={`add-${tag}`} className="text-sm">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOperation('')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTags}
                  disabled={processing || (selectedTags.length === 0 && !newTag.trim())}
                >
                  {processing ? 'Adding Tags...' : 'Add Tags'}
                </Button>
              </div>
            </div>
          )}

          {operation === 'removeTags' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select tags to remove:
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`remove-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label htmlFor={`remove-${tag}`} className="text-sm">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOperation('')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRemoveTags}
                  disabled={processing || selectedTags.length === 0}
                >
                  {processing ? 'Removing Tags...' : 'Remove Tags'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

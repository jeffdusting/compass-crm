import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  FileText,
  Tag,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OpportunityDetail({ 
  opportunity, 
  onBack, 
  onEdit, 
  onDelete 
}) {
  const [deleting, setDeleting] = useState(false)

  const stages = {
    lead: { label: 'Lead', color: 'bg-gray-100 text-gray-800' },
    qualified: { label: 'Qualified', color: 'bg-blue-100 text-blue-800' },
    proposal: { label: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
    negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    closed_won: { label: 'Closed Won', color: 'bg-green-100 text-green-800' },
    closed_lost: { label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${opportunity.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunity.id)

      if (error) throw error

      onDelete(opportunity.id)
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      alert('Failed to delete opportunity: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600'
    if (probability >= 60) return 'text-yellow-600'
    if (probability >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStageInfo = (stage) => {
    return stages[stage] || { label: stage, color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(opportunity)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Opportunity Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={getStageInfo(opportunity.stage).color}>
                      {getStageInfo(opportunity.stage).label}
                    </Badge>
                    <span className={`font-semibold ${getProbabilityColor(opportunity.probability)}`}>
                      {opportunity.probability}% probability
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(opportunity.value)}
                  </div>
                  <div className="text-sm text-gray-500">Opportunity Value</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {opportunity.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
                </div>
              )}

              {opportunity.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{opportunity.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          {opportunity.contacts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">
                    {opportunity.contacts.first_name} {opportunity.contacts.last_name}
                  </div>
                  {opportunity.contacts.company && (
                    <div className="text-sm text-gray-600">
                      {opportunity.contacts.company}
                    </div>
                  )}
                  {opportunity.contacts.email && (
                    <div className="text-sm text-gray-600">
                      {opportunity.contacts.email}
                    </div>
                  )}
                  {opportunity.contacts.phone && (
                    <div className="text-sm text-gray-600">
                      {opportunity.contacts.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Expected Close Date</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(opportunity.expected_close_date)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Created</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(opportunity.created_at)}
                  </div>
                </div>
                {opportunity.updated_at && opportunity.updated_at !== opportunity.created_at && (
                  <div>
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(opportunity.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weighted Value</span>
                  <span className="text-sm font-medium">
                    {formatCurrency((opportunity.value || 0) * (opportunity.probability / 100))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stage</span>
                  <span className="text-sm font-medium">
                    {getStageInfo(opportunity.stage).label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Probability</span>
                  <span className={`text-sm font-medium ${getProbabilityColor(opportunity.probability)}`}>
                    {opportunity.probability}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {opportunity.expected_close_date && new Date(opportunity.expected_close_date) < new Date() && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-800">Overdue</div>
                    <div className="text-sm text-orange-700">
                      Expected close date has passed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  Target,
  FileText,
  Tag,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ActivityDetail({ 
  activity, 
  onBack, 
  onEdit, 
  onDelete 
}) {
  const [deleting, setDeleting] = useState(false)

  const activityTypes = {
    call: { label: 'Call', icon: Phone, color: 'bg-blue-100 text-blue-800' },
    email: { label: 'Email', icon: Mail, color: 'bg-green-100 text-green-800' },
    meeting: { label: 'Meeting', icon: Users, color: 'bg-purple-100 text-purple-800' },
    task: { label: 'Task', icon: CheckCircle, color: 'bg-orange-100 text-orange-800' },
    note: { label: 'Note', icon: FileText, color: 'bg-gray-100 text-gray-800' },
    follow_up: { label: 'Follow Up', icon: Target, color: 'bg-yellow-100 text-yellow-800' }
  }

  const statuses = {
    planned: { label: 'Planned', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  }

  const priorities = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${activity.subject}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activity.id)

      if (error) throw error

      onDelete(activity.id)
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Failed to delete activity: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const getTypeInfo = (type) => {
    return activityTypes[type] || { 
      label: type, 
      icon: MessageSquare, 
      color: 'bg-gray-100 text-gray-800' 
    }
  }

  const getStatusInfo = (status) => {
    return statuses[status] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-800' 
    }
  }

  const getPriorityInfo = (priority) => {
    return priorities[priority] || { 
      label: priority, 
      color: 'bg-gray-100 text-gray-800' 
    }
  }

  const isOverdue = () => {
    if (!activity.due_date || activity.status === 'completed' || activity.status === 'cancelled') {
      return false
    }
    return new Date(activity.due_date) < new Date()
  }

  const typeInfo = getTypeInfo(activity.type)
  const statusInfo = getStatusInfo(activity.status)
  const priorityInfo = getPriorityInfo(activity.priority)
  const IconComponent = typeInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(activity)}>
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
          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-gray-600" />
                  <div>
                    <CardTitle className="text-2xl">{activity.subject}</CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <Badge className={priorityInfo.color}>
                        {priorityInfo.label} Priority
                      </Badge>
                      {isOverdue() && (
                        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activity.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                </div>
              )}

              {activity.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{activity.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
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
          {/* Related Contact */}
          {activity.contacts && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Related Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">
                    {activity.contacts.first_name} {activity.contacts.last_name}
                  </div>
                  {activity.contacts.company && (
                    <div className="text-sm text-gray-600">
                      {activity.contacts.company}
                    </div>
                  )}
                  {activity.contacts.email && (
                    <div className="text-sm text-gray-600">
                      {activity.contacts.email}
                    </div>
                  )}
                  {activity.contacts.phone && (
                    <div className="text-sm text-gray-600">
                      {activity.contacts.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Opportunity */}
          {activity.opportunities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Related Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-medium">
                  {activity.opportunities.title}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Type</div>
                  <div className="text-sm text-gray-600">{typeInfo.label}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Status</div>
                  <div className="text-sm text-gray-600">{statusInfo.label}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Priority</div>
                  <div className="text-sm text-gray-600">{priorityInfo.label}</div>
                </div>
                {activity.due_date && (
                  <div>
                    <div className="text-sm font-medium text-gray-900">Due Date</div>
                    <div className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatDateTime(activity.due_date)}
                      {isOverdue() && ' (Overdue)'}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Created</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(activity.created_at)}
                  </div>
                </div>
                {activity.updated_at && activity.updated_at !== activity.created_at && (
                  <div>
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(activity.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {isOverdue() && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">Activity Overdue</div>
                    <div className="text-sm text-red-700">
                      This activity was due on {formatDate(activity.due_date)}
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

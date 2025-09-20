import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '../lib/supabase'
import { Search, Plus, Calendar, Clock, CheckCircle, AlertCircle, Phone, Mail, Users, FileText, Target, MessageSquare, Edit, Trash2 } from 'lucide-react'
import ActivityForm from './ActivityForm'
import ActivityDetail from './ActivityDetail'

const ActivityList = ({ onSelectActivity, onCreateActivity }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [view, setView] = useState('list') // 'list', 'detail'

  const activityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'call', label: 'Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'meeting', label: 'Meeting', icon: Users },
    { value: 'task', label: 'Task', icon: CheckCircle },
    { value: 'note', label: 'Note', icon: FileText },
    { value: 'follow_up', label: 'Follow Up', icon: Target }
  ]

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const statusColors = {
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('activities')
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
        .order('due_date', { ascending: true, nullsLast: true })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching activities:', error)
        return
      }

      setActivities(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.contacts?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${activity.contacts?.first_name} ${activity.contacts?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.opportunities?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

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

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    const IconComponent = activityType?.icon || MessageSquare
    return <IconComponent className="h-4 w-4" />
  }

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') return false
    return new Date(dueDate) < new Date()
  }

  const handleCreateActivity = () => {
    setEditingActivity(null)
    setShowForm(true)
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity)
    setView('detail')
  }

  const handleSaveActivity = (savedActivity) => {
    if (editingActivity) {
      // Update existing activity
      setActivities(prev => 
        prev.map(act => act.id === savedActivity.id ? savedActivity : act)
      )
    } else {
      // Add new activity
      setActivities(prev => [savedActivity, ...prev])
    }
    setShowForm(false)
    setEditingActivity(null)
  }

  const handleDeleteActivity = async (activityId) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

      if (error) throw error

      setActivities(prev => prev.filter(act => act.id !== activityId))
      
      // If we're viewing the deleted activity, go back to list
      if (selectedActivity && selectedActivity.id === activityId) {
        setView('list')
        setSelectedActivity(null)
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Failed to delete activity: ' + error.message)
    }
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedActivity(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading activities...</div>
      </div>
    )
  }

  // Show activity detail view
  if (view === 'detail' && selectedActivity) {
    return (
      <>
        <ActivityDetail
          activity={selectedActivity}
          onBack={handleBackToList}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
        {showForm && (
          <ActivityForm
            activity={editingActivity}
            onSave={handleSaveActivity}
            onCancel={() => {
              setShowForm(false)
              setEditingActivity(null)
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          <p className="text-gray-600">Track calls, meetings, tasks, and follow-ups</p>
        </div>
        <Button onClick={handleCreateActivity} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {activityTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.' 
              : 'Get started by creating your first activity.'}
          </p>
          {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
            <div className="mt-6">
              <Button onClick={handleCreateActivity} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add New Activity
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card
              key={activity.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                isOverdue(activity.due_date, activity.status) ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div onClick={() => handleViewActivity(activity)} className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <CardTitle className="text-lg">
                          {activity.subject}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[activity.status]}>
                      {statuses.find(s => s.value === activity.status)?.label}
                    </Badge>
                    <Badge className={priorityColors[activity.priority]}>
                      {activity.priority}
                    </Badge>
                    {isOverdue(activity.due_date, activity.status) && (
                      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditActivity(activity)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteActivity(activity.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0" onClick={() => handleViewActivity(activity)}>
                <div className="space-y-3">
                  {/* Contact and Opportunity Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {activity.contacts && (
                      <span>
                        Contact: {activity.contacts.first_name} {activity.contacts.last_name}
                        {activity.contacts.company && ` (${activity.contacts.company})`}
                      </span>
                    )}
                    {activity.opportunities && (
                      <span>
                        Opportunity: {activity.opportunities.title}
                      </span>
                    )}
                  </div>

                  {/* Due Date */}
                  {activity.due_date && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Due: {formatDateTime(activity.due_date)}</span>
                    </div>
                  )}

                  {/* Description */}
                  {activity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  {/* Tags */}
                  {activity.tags && activity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activity.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {activity.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{activity.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Form Modal */}
      {showForm && (
        <ActivityForm
          activity={editingActivity}
          onSave={handleSaveActivity}
          onCancel={() => {
            setShowForm(false)
            setEditingActivity(null)
          }}
        />
      )}
    </div>
  )
}

export default ActivityList


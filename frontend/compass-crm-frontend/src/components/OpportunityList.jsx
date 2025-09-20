import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '../lib/supabase'
import { Search, Plus, DollarSign, Calendar, TrendingUp, Users, Edit, Trash2 } from 'lucide-react'
import OpportunityForm from './OpportunityForm'
import OpportunityDetail from './OpportunityDetail'

const OpportunityList = ({ onSelectOpportunity, onCreateOpportunity }) => {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [view, setView] = useState('list') // 'list', 'detail'

  const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' }
  ]

  const stageColors = {
    lead: 'bg-gray-100 text-gray-800',
    qualified: 'bg-blue-100 text-blue-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800'
  }

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          contacts (
            first_name,
            last_name,
            company
          )
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching opportunities:', error)
        return
      }

      setOpportunities(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.contacts?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${opportunity.contacts?.first_name} ${opportunity.contacts?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = stageFilter === 'all' || opportunity.stage === stageFilter
    
    return matchesSearch && matchesStage
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-AU')
  }

  const handleCreateOpportunity = () => {
    setEditingOpportunity(null)
    setShowForm(true)
  }

  const handleEditOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity)
    setShowForm(true)
  }

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity)
    setView('detail')
  }

  const handleSaveOpportunity = (savedOpportunity) => {
    if (editingOpportunity) {
      // Update existing opportunity
      setOpportunities(prev => 
        prev.map(opp => opp.id === savedOpportunity.id ? savedOpportunity : opp)
      )
    } else {
      // Add new opportunity
      setOpportunities(prev => [savedOpportunity, ...prev])
    }
    setShowForm(false)
    setEditingOpportunity(null)
  }

  const handleDeleteOpportunity = async (opportunityId) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId)

      if (error) throw error

      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId))
      
      // If we're viewing the deleted opportunity, go back to list
      if (selectedOpportunity && selectedOpportunity.id === opportunityId) {
        setView('list')
        setSelectedOpportunity(null)
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      alert('Failed to delete opportunity: ' + error.message)
    }
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedOpportunity(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading opportunities...</div>
      </div>
    )
  }

  // Show opportunity detail view
  if (view === 'detail' && selectedOpportunity) {
    return (
      <>
        <OpportunityDetail
          opportunity={selectedOpportunity}
          onBack={handleBackToList}
          onEdit={handleEditOpportunity}
          onDelete={handleDeleteOpportunity}
        />
        {showForm && (
          <OpportunityForm
            opportunity={editingOpportunity}
            onSave={handleSaveOpportunity}
            onCancel={() => {
              setShowForm(false)
              setEditingOpportunity(null)
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
          <h2 className="text-2xl font-bold text-gray-900">Opportunities</h2>
          <p className="text-gray-600">Manage your sales pipeline and track deals</p>
        </div>
        <Button onClick={handleCreateOpportunity} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Opportunity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {stages.map(stage => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || stageFilter !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by creating your first opportunity.'}
          </p>
          {!searchTerm && stageFilter === 'all' && (
            <div className="mt-6">
              <Button onClick={handleCreateOpportunity} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add New Opportunity
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div onClick={() => handleViewOpportunity(opportunity)} className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {opportunity.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={stageColors[opportunity.stage]}>
                      {stages.find(s => s.value === opportunity.stage)?.label}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditOpportunity(opportunity)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOpportunity(opportunity.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0" onClick={() => handleViewOpportunity(opportunity)}>
                <div className="space-y-3">
                  {/* Contact Info */}
                  {opportunity.contacts && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {opportunity.contacts.first_name} {opportunity.contacts.last_name}
                        {opportunity.contacts.company && ` • ${opportunity.contacts.company}`}
                      </span>
                    </div>
                  )}

                  {/* Value and Probability */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(opportunity.value)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {opportunity.probability}% probability
                    </div>
                  </div>

                  {/* Expected Close Date */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Expected: {formatDate(opportunity.expected_close_date)}</span>
                  </div>

                  {/* Description */}
                  {opportunity.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}

                  {/* Tags */}
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {opportunity.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {opportunity.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.tags.length - 3} more
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

      {/* Opportunity Form Modal */}
      {showForm && (
        <OpportunityForm
          opportunity={editingOpportunity}
          onSave={handleSaveOpportunity}
          onCancel={() => {
            setShowForm(false)
            setEditingOpportunity(null)
          }}
        />
      )}
    </div>
  )
}

export default OpportunityList


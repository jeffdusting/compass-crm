import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Plus, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react'

const OpportunityList = ({ onSelectOpportunity, onCreateOpportunity }) => {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading opportunities...</div>
      </div>
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
        <button
          onClick={onCreateOpportunity}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <button
                onClick={onCreateOpportunity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Opportunity
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              onClick={() => onSelectOpportunity(opportunity)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {opportunity.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColors[opportunity.stage]}`}>
                  {stages.find(s => s.value === opportunity.stage)?.label}
                </span>
              </div>

              {/* Contact Info */}
              {opportunity.contacts && (
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {opportunity.contacts.first_name} {opportunity.contacts.last_name}
                    {opportunity.contacts.company && ` • ${opportunity.contacts.company}`}
                  </span>
                </div>
              )}

              {/* Value and Probability */}
              <div className="flex items-center gap-4 mb-3">
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
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                <Calendar className="h-4 w-4" />
                <span>Expected: {formatDate(opportunity.expected_close_date)}</span>
              </div>

              {/* Description */}
              {opportunity.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {opportunity.description}
                </p>
              )}

              {/* Tags */}
              {opportunity.tags && opportunity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {opportunity.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {opportunity.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{opportunity.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OpportunityList


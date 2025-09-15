import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Activity, 
  BarChart3, 
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  X,
  Save,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Building
} from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Contact Form Component
const ContactForm = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    title: contact?.title || '',
    tags: contact?.tags || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Tags
        </label>
        <div className="flex gap-2">
          {['CBS', 'Water Roads'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                formData.tags.includes(tag)
                  ? tag === 'CBS' 
                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                    : 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              } border`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Contact
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Dashboard Component with Clickable Panels
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalOpportunities: 0,
    totalActivities: 0,
    pipelineValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contacts, opportunities, activities] = await Promise.all([
          apiCall('/api/contacts'),
          apiCall('/api/opportunities'),
          apiCall('/api/activities')
        ]);

        const pipelineValue = opportunities.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0);

        setStats({
          totalContacts: contacts.length,
          totalOpportunities: opportunities.length,
          totalActivities: activities.length,
          pipelineValue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome to Compass CRM
        </div>
      </div>

      {/* Clickable Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => navigate('/contacts')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/opportunities')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
        >
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/activities')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
        >
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.pipelineValue.toLocaleString()}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/contacts" 
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-blue-900 font-medium">Add New Contact</span>
          </Link>
          
          <Link 
            to="/opportunities" 
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-green-900 font-medium">Create Opportunity</span>
          </Link>
          
          <Link 
            to="/activities" 
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Activity className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-purple-900 font-medium">Log Activity</span>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              System Status: Connected to Supabase Database
            </p>
            <p className="text-sm text-green-600">
              Backend services are operational and ready for use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Contacts Component
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = async () => {
    try {
      let endpoint = '/api/contacts';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterCompany) params.append('company', filterCompany);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const data = await apiCall(endpoint);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, filterCompany]);

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        await apiCall(`/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(contactData)
        });
      } else {
        await apiCall('/api/contacts', {
          method: 'POST',
          body: JSON.stringify(contactData)
        });
      }
      
      setShowAddModal(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await apiCall(`/api/contacts/${contactId}`, {
          method: 'DELETE'
        });
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </div>
                    {contact.title && (
                      <div className="text-sm text-gray-500">{contact.title}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tag === 'CBS' 
                              ? 'bg-blue-100 text-blue-800' 
                              : tag === 'Water Roads'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingContact(contact)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {contacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCompany ? 'Try adjusting your search criteria.' : 'Get started by adding a new contact.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={showAddModal || editingContact}
        onClose={() => {
          setShowAddModal(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => {
            setShowAddModal(false);
            setEditingContact(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Opportunity Form Component
const OpportunityForm = ({ opportunity, contacts, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: opportunity?.title || '',
    description: opportunity?.description || '',
    contact_id: opportunity?.contact_id || '',
    value: opportunity?.value || '',
    stage: opportunity?.stage || 'prospecting',
    close_date: opportunity?.close_date || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact *
        </label>
        <select
          required
          value={formData.contact_id}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.first_name} {contact.last_name} - {contact.company}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage
          </label>
          <select
            value={formData.stage}
            onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="prospecting">Prospecting</option>
            <option value="qualification">Qualification</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected Close Date
        </label>
        <input
          type="date"
          value={formData.close_date}
          onChange={(e) => setFormData(prev => ({ ...prev, close_date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Opportunity
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Opportunities Component
const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  const fetchData = async () => {
    try {
      const [oppsData, contactsData] = await Promise.all([
        apiCall('/api/opportunities'),
        apiCall('/api/contacts')
      ]);
      setOpportunities(oppsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveOpportunity = async (oppData) => {
    try {
      if (editingOpportunity) {
        await apiCall(`/api/opportunities/${editingOpportunity.id}`, {
          method: 'PUT',
          body: JSON.stringify(oppData)
        });
      } else {
        await apiCall('/api/opportunities', {
          method: 'POST',
          body: JSON.stringify(oppData)
        });
      }
      
      setShowAddModal(false);
      setEditingOpportunity(null);
      fetchData();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await apiCall(`/api/opportunities/${oppId}`, {
          method: 'DELETE'
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </button>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Close Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {opportunities.map((opp) => {
                const contact = contacts.find(c => c.id === opp.contact_id);
                return (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{opp.title}</div>
                      <div className="text-sm text-gray-500">{opp.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(opp.value || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        opp.stage === 'closed_won' ? 'bg-green-100 text-green-800' :
                        opp.stage === 'closed_lost' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {opp.stage?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opp.close_date ? new Date(opp.close_date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOpportunity(opp)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpportunity(opp.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first opportunity.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Opportunity Modal */}
      <Modal
        isOpen={showAddModal || editingOpportunity}
        onClose={() => {
          setShowAddModal(false);
          setEditingOpportunity(null);
        }}
        title={editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
      >
        <OpportunityForm
          opportunity={editingOpportunity}
          contacts={contacts}
          onSave={handleSaveOpportunity}
          onCancel={() => {
            setShowAddModal(false);
            setEditingOpportunity(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Activity Form Component
const ActivityForm = ({ activity, contacts, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: activity?.type || 'call',
    subject: activity?.subject || '',
    description: activity?.description || '',
    contact_id: activity?.contact_id || '',
    activity_date: activity?.activity_date || new Date().toISOString().split('T')[0],
    status: activity?.status || 'pending'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject *
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact *
        </label>
        <select
          required
          value={formData.contact_id}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.first_name} {contact.last_name} - {contact.company}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activity Date
        </label>
        <input
          type="date"
          value={formData.activity_date}
          onChange={(e) => setFormData(prev => ({ ...prev, activity_date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Activity
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Activities Component
const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const fetchData = async () => {
    try {
      const [activitiesData, contactsData] = await Promise.all([
        apiCall('/api/activities'),
        apiCall('/api/contacts')
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveActivity = async (activityData) => {
    try {
      if (editingActivity) {
        await apiCall(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          body: JSON.stringify(activityData)
        });
      } else {
        await apiCall('/api/activities', {
          method: 'POST',
          body: JSON.stringify(activityData)
        });
      }
      
      setShowAddModal(false);
      setEditingActivity(null);
      fetchData();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await apiCall(`/api/activities/${activityId}`, {
          method: 'DELETE'
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </button>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => {
                const contact = contacts.find(c => c.id === activity.contact_id);
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-500 mr-2" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4 text-green-500 mr-2" />}
                        {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-500 mr-2" />}
                        {activity.type === 'task' && <Activity className="h-4 w-4 text-orange-500 mr-2" />}
                        <span className="text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.subject}</div>
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingActivity(activity)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by logging your first activity.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={showAddModal || editingActivity}
        onClose={() => {
          setShowAddModal(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? 'Edit Activity' : 'Log New Activity'}
      >
        <ActivityForm
          activity={editingActivity}
          contacts={contacts}
          onSave={handleSaveActivity}
          onCancel={() => {
            setShowAddModal(false);
            setEditingActivity(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Reports Component
const Reports = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Reports</h3>
      <p className="text-gray-500">Advanced reporting features coming soon.</p>
    </div>
  </div>
);

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: BarChart3 },
    { path: '/contacts', name: 'Contacts', icon: Users },
    { path: '/opportunities', name: 'Opportunities', icon: Target },
    { path: '/activities', name: 'Activities', icon: Activity },
    { path: '/reports', name: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Compass CRM</h1>
            <p className="text-sm text-gray-500">CBS Group & Water Roads</p>
          </div>
        </div>
      </div>
      
      <div className="px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Main App Component with useNavigate hook
const AppContent = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;


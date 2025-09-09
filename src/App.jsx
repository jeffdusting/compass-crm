import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Activity, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
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
};

// Dashboard Component
const Dashboard = () => {
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
          apiCall('/api/opportunities').catch(() => []),
          apiCall('/api/activities').catch(() => [])
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
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome to Compass CRM
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.pipelineValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
};

// Contacts Component
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
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

    fetchContacts();
  }, [searchTerm, filterCompany]);

  const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
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
    </div>
  );
};

// Simple placeholder components for other routes
const Opportunities = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Opportunities Management</h3>
      <p className="text-gray-500">Track your sales pipeline and manage opportunities.</p>
    </div>
  </div>
);

const Activities = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Management</h3>
      <p className="text-gray-500">Log and track all customer interactions and activities.</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
    <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Reports</h3>
      <p className="text-gray-500">View detailed analytics and generate reports.</p>
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

// Main App Component
const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;


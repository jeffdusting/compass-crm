import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Mail, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Unlink,
  ExternalLink
} from 'lucide-react';

const EmailIntegration = () => {
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    loadEmailAccounts();
    loadEmails();
    loadCalendarEvents();
  }, []);

  const loadEmailAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('provider', 'microsoft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmailAccounts(data || []);
    } catch (error) {
      console.error('Error loading email accounts:', error);
      setError('Failed to load email accounts');
    }
  };

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_accounts (user_email, provider),
          contacts (first_name, last_name, company)
        `)
        .order('received_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error loading emails:', error);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          email_accounts (user_email, provider),
          contacts (first_name, last_name, company)
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      setCalendarEvents(data || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError('Failed to load calendar events');
    }
  };

  const handleConnectMicrosoft = () => {
    // Redirect to Microsoft OAuth via our API server
    const authUrl = `http://localhost:3001/api/auth/microsoft?tenant_id=cbs_group`;
    window.location.href = authUrl;
  };

  const handleSyncEmails = async (accountId) => {
    setSyncing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/email/sync/${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sync failed');
      }

      const result = await response.json();
      console.log('Sync result:', result);

      await loadEmailAccounts();
      await loadEmails();
      await loadCalendarEvents();
      
      setError(null);
    } catch (error) {
      console.error('Error syncing emails:', error);
      setError(`Failed to sync emails: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this email account?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;
      
      await loadEmailAccounts();
      setError(null);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setError('Failed to disconnect account');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      syncing: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      error: { color: 'bg-red-100 text-red-800', icon: XCircle },
      disconnected: { color: 'bg-gray-100 text-gray-800', icon: Unlink }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading email integration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Integration</h2>
          <p className="text-gray-600">Manage Microsoft Graph email and calendar integration</p>
        </div>
        <Button onClick={handleConnectMicrosoft} className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Connect Microsoft Account
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'accounts', label: 'Email Accounts', icon: Settings },
          { id: 'emails', label: 'Recent Emails', icon: Mail },
          { id: 'calendar', label: 'Upcoming Events', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Email Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Connected Email Accounts</h3>
            <Badge variant="outline">{emailAccounts.length} account(s)</Badge>
          </div>

          {emailAccounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Email Accounts Connected</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Connect your Microsoft 365 account to sync emails and calendar events with your CRM contacts and opportunities.
                </p>
                <Button onClick={handleConnectMicrosoft} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Connect Microsoft Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {emailAccounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.user_email}</CardTitle>
                          <CardDescription>
                            Microsoft 365 • {account.tenant_id.replace('_', ' ').toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(account.sync_status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Last Sync</p>
                        <p className="font-medium">
                          {account.last_sync_at ? formatDate(account.last_sync_at) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Permissions</p>
                        <p className="font-medium">Mail & Calendar</p>
                      </div>
                    </div>

                    {account.sync_error && (
                      <Alert className="border-red-200 bg-red-50 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {account.sync_error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSyncEmails(account.id)}
                        disabled={syncing || account.sync_status === 'syncing'}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnectAccount(account.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Unlink className="w-4 h-4" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Emails Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Emails</h3>
            <Badge variant="outline">{emails.length} email(s)</Badge>
          </div>

          {emails.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Emails Synced</h3>
                <p className="text-gray-600 text-center">
                  Connect an email account and sync to see emails here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <Card key={email.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{email.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>From: {email.sender_name || email.sender_email}</span>
                          {email.contacts && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                {email.contacts.first_name} {email.contacts.last_name}
                                {email.contacts.company && ` (${email.contacts.company})`}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{email.body_preview}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500 ml-4">
                        <p>{formatDate(email.received_at)}</p>
                        {email.importance === 'high' && (
                          <Badge className="bg-red-100 text-red-800 mt-1">High Priority</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {email.email_accounts?.user_email}
                        </Badge>
                        {email.has_attachments && (
                          <Badge variant="outline" className="text-xs">
                            📎 Attachments
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!email.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar Events Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Calendar Events</h3>
            <Badge variant="outline">{calendarEvents.length} event(s)</Badge>
          </div>

          {calendarEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Calendar Events</h3>
                <p className="text-gray-600 text-center">
                  Connect an email account and sync to see calendar events here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{event.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.start_time).toLocaleDateString()} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <Badge className={`${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        event.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Organizer: {event.organizer_name || event.organizer_email}
                        </Badge>
                        {event.attendee_emails?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {event.attendee_emails.length} attendee(s)
                          </Badge>
                        )}
                      </div>
                      {event.contacts && (
                        <span className="text-sm text-blue-600">
                          {event.contacts.first_name} {event.contacts.last_name}
                          {event.contacts.company && ` (${event.contacts.company})`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailIntegration;


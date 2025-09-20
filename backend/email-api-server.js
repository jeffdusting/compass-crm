// Express.js API Server for Microsoft Graph Email Integration
// Provides REST endpoints for the CompassCRM frontend

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import MicrosoftGraphService from './microsoft-graph-service.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.EMAIL_API_PORT || 3001;

// Initialize Microsoft Graph service
const graphService = new MicrosoftGraphService();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'CompassCRM Email API',
    timestamp: new Date().toISOString()
  });
});

// Microsoft OAuth endpoints
app.get('/api/auth/microsoft', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    
    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' });
    }

    // Generate state parameter for security
    const state = JSON.stringify({ 
      tenant_id, 
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    });

    const authUrl = graphService.getAuthorizationUrl(state);
    
    // Redirect to Microsoft OAuth
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Microsoft OAuth:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

app.get('/api/auth/microsoft/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_failed&message=${encodeURIComponent(oauthError)}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_parameters`);
    }

    // Parse state parameter
    let stateData;
    try {
      stateData = JSON.parse(state);
    } catch (error) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    // Exchange authorization code for tokens
    const tokenData = await graphService.exchangeCodeForToken(code);
    
    // Get user profile
    const userProfile = await graphService.getUserProfile(tokenData.accessToken);
    
    // Store email account in database
    await graphService.storeEmailAccount(stateData.tenant_id, userProfile, tokenData);

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}?success=account_connected&email=${encodeURIComponent(userProfile.mail || userProfile.userPrincipalName)}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=connection_failed&message=${encodeURIComponent(error.message)}`);
  }
});

// Email account management endpoints
app.get('/api/email/accounts/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const accounts = await graphService.getEmailAccounts(tenantId);
    res.json(accounts);
  } catch (error) {
    console.error('Error getting email accounts:', error);
    res.status(500).json({ error: 'Failed to get email accounts' });
  }
});

app.post('/api/email/sync/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const result = await graphService.syncEmails(accountId);
    res.json(result);
  } catch (error) {
    console.error('Error syncing emails:', error);
    res.status(500).json({ error: 'Failed to sync emails', message: error.message });
  }
});

app.delete('/api/email/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const result = await graphService.disconnectEmailAccount(accountId);
    res.json(result);
  } catch (error) {
    console.error('Error disconnecting email account:', error);
    res.status(500).json({ error: 'Failed to disconnect email account' });
  }
});

// Email data endpoints
app.get('/api/emails/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { limit = 20, offset = 0, contact_id } = req.query;

    // This would typically use the Supabase client directly
    // For now, return a placeholder response
    res.json({
      emails: [],
      total: 0,
      message: 'Email data endpoint - implementation depends on frontend requirements'
    });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({ error: 'Failed to get emails' });
  }
});

app.get('/api/calendar/events/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { limit = 20, offset = 0, start_date, end_date } = req.query;

    // This would typically use the Supabase client directly
    // For now, return a placeholder response
    res.json({
      events: [],
      total: 0,
      message: 'Calendar events endpoint - implementation depends on frontend requirements'
    });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
});

// Manual sync trigger for all accounts
app.post('/api/email/sync-all/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const accounts = await graphService.getEmailAccounts(tenantId);
    
    const syncResults = [];
    for (const account of accounts) {
      try {
        const result = await graphService.syncEmails(account.id);
        syncResults.push({
          accountId: account.id,
          email: account.user_email,
          success: true,
          ...result
        });
      } catch (error) {
        syncResults.push({
          accountId: account.id,
          email: account.user_email,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: syncResults,
      totalAccounts: accounts.length,
      successfulSyncs: syncResults.filter(r => r.success).length
    });
  } catch (error) {
    console.error('Error syncing all accounts:', error);
    res.status(500).json({ error: 'Failed to sync all accounts' });
  }
});

// Token refresh endpoint (for frontend to call when needed)
app.post('/api/auth/refresh/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // Get account details from database
    const accounts = await graphService.getEmailAccounts('cbs_group'); // This should be dynamic
    const account = accounts.find(a => a.id === accountId);
    
    if (!account || !account.refresh_token) {
      return res.status(404).json({ error: 'Account not found or no refresh token' });
    }

    const tokenData = await graphService.refreshAccessToken(account.refresh_token);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`CompassCRM Email API Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

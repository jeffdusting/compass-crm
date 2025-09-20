# CompassCRM Email Integration Setup Guide

## Overview

The CompassCRM Email Integration provides seamless Microsoft Graph integration for synchronizing emails and calendar events with your CRM contacts and opportunities. This guide covers the complete setup process.

## Architecture

```
Frontend (React) → Email API Server (Express.js) → Microsoft Graph API → Supabase Database
```

### Components

1. **Frontend EmailIntegration Component** (`/frontend/compass-crm-frontend/src/components/EmailIntegration.jsx`)
   - User interface for managing email accounts
   - OAuth flow initiation
   - Email and calendar data display

2. **Email API Server** (`/backend/email-api-server.js`)
   - Express.js REST API server
   - Handles OAuth callbacks
   - Manages email synchronization

3. **Microsoft Graph Service** (`/backend/microsoft-graph-service.js`)
   - Core Microsoft Graph API integration
   - Token management and refresh
   - Email and calendar data processing

## Prerequisites

### 1. Microsoft Azure App Registration

You need to register an application in Microsoft Azure to get the required credentials:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: CompassCRM Email Integration
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: `http://localhost:3001/api/auth/microsoft/callback`
5. After creation, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**
6. Go to **Certificates & secrets** → **New client secret**
   - Note down the **Client secret value**
7. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**
   - Add: `Mail.Read`, `Calendar.Read`, `User.Read`, `offline_access`
8. Click **Grant admin consent**

### 2. Environment Configuration

Update the environment files with your Microsoft credentials:

#### Backend Configuration (`/backend/.env.email-api`)

```env
# Server Configuration
NODE_ENV=development
EMAIL_API_PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (use your actual values)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Microsoft Graph Configuration (from Azure app registration)
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_TENANT_ID=your-directory-tenant-id
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/microsoft/callback

# Security
SESSION_SECRET=your-random-session-secret-key
```

#### Frontend Configuration

The frontend is configured to connect to the API server at `http://localhost:3001`. If you change the API server port, update the URLs in `EmailIntegration.jsx`.

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd /home/ubuntu/compass-crm/backend

# Copy the package.json for email API
cp email-api-package.json package.json

# Install dependencies
npm install
```

### 2. Database Schema

The email integration requires the following database tables (already created in Phase 3):

- `email_accounts` - Stores connected Microsoft accounts
- `emails` - Stores synchronized email messages
- `calendar_events` - Stores synchronized calendar events

### 3. Start the Email API Server

```bash
# Using the startup script
./start-email-api.sh

# Or manually
node email-api-server.js
```

The server will start on port 3001 by default.

### 4. Start the Frontend

```bash
cd /home/ubuntu/compass-crm/frontend/compass-crm-frontend
npm run dev
```

## Usage

### 1. Connect Microsoft Account

1. Navigate to the **Email Integration** tab in CompassCRM
2. Click **Connect Microsoft Account**
3. You'll be redirected to Microsoft's OAuth login
4. Sign in with your Microsoft 365 account
5. Grant the requested permissions
6. You'll be redirected back to CompassCRM with the account connected

### 2. Sync Emails and Calendar

1. Once connected, click **Sync Now** on your email account
2. The system will:
   - Fetch recent emails (last 100)
   - Fetch upcoming calendar events (next 30 days)
   - Match emails/events with existing CRM contacts
   - Store the data in Supabase

### 3. View Synchronized Data

- **Recent Emails**: View emails with contact matching
- **Upcoming Events**: View calendar events with contact information
- **Account Management**: Monitor sync status and manage connections

## API Endpoints

### Authentication
- `GET /api/auth/microsoft` - Initiate OAuth flow
- `GET /api/auth/microsoft/callback` - OAuth callback handler
- `POST /api/auth/refresh/:accountId` - Refresh access token

### Email Management
- `GET /api/email/accounts/:tenantId` - Get email accounts
- `POST /api/email/sync/:accountId` - Sync emails for account
- `DELETE /api/email/accounts/:accountId` - Disconnect account
- `POST /api/email/sync-all/:tenantId` - Sync all accounts

### Data Access
- `GET /api/emails/:tenantId` - Get synchronized emails
- `GET /api/calendar/events/:tenantId` - Get calendar events

## Security Considerations

### 1. Token Management
- Access tokens are automatically refreshed using refresh tokens
- Tokens are stored securely in Supabase with encryption at rest
- Expired tokens trigger automatic refresh attempts

### 2. Permissions
- Minimum required permissions: `Mail.Read`, `Calendar.Read`, `User.Read`
- No write permissions requested for security
- Users can disconnect accounts at any time

### 3. Data Privacy
- Only metadata and previews are stored, not full email content
- All data is tenant-isolated using Row Level Security
- Users control what data is synchronized

## Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Ensure redirect URI in Azure matches exactly: `http://localhost:3001/api/auth/microsoft/callback`
   - Check that the API server is running on the correct port

2. **Token Refresh Failures**
   - Verify client secret is correct and not expired
   - Check that `offline_access` permission is granted

3. **Sync Errors**
   - Check Supabase connection and credentials
   - Verify database schema is up to date
   - Check API server logs for detailed error messages

### Logs and Debugging

- API server logs all requests and errors to console
- Check browser developer tools for frontend errors
- Supabase dashboard shows database query logs

## Production Deployment

### 1. Environment Updates
- Change `NODE_ENV` to `production`
- Update `FRONTEND_URL` to production domain
- Update `MICROSOFT_REDIRECT_URI` to production callback URL
- Use strong, unique `SESSION_SECRET`

### 2. Azure App Registration Updates
- Add production redirect URI to Azure app registration
- Consider using separate Azure apps for dev/staging/production

### 3. Security Enhancements
- Enable HTTPS for all endpoints
- Implement rate limiting
- Add request logging and monitoring
- Use environment-specific Supabase projects

## Testing

### Manual Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Email account appears in connected accounts
- [ ] Sync operation completes without errors
- [ ] Emails appear in Recent Emails tab
- [ ] Calendar events appear in Upcoming Events tab
- [ ] Contact matching works correctly
- [ ] Account disconnection works
- [ ] Token refresh works automatically

### UAT Scenarios

The email integration supports the following UAT scenarios:
- EI-031: Microsoft Account Connection
- EI-032: Email Synchronization
- EI-033: Calendar Integration
- EI-034: Contact Matching
- EI-035: Sync Status Monitoring
- EI-036: Account Management

## Support

For issues with the email integration:

1. Check the troubleshooting section above
2. Review API server and browser console logs
3. Verify Azure app registration configuration
4. Test with a simple OAuth flow outside the application

## Future Enhancements

Planned improvements for future phases:
- Gmail integration support
- Email sending capabilities
- Calendar event creation
- Advanced contact matching algorithms
- Bulk email operations
- Email templates and automation

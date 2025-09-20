// Microsoft Graph Email Integration Service
// Handles OAuth authentication and email synchronization for CBS Group

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Microsoft Graph configuration
const MICROSOFT_CONFIG = {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenantId: process.env.MICROSOFT_TENANT_ID,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback',
    scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Calendar.Read https://graph.microsoft.com/User.Read offline_access'
};

// Microsoft Graph API endpoints
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const GRAPH_AUTH_BASE = 'https://login.microsoftonline.com';

class MicrosoftGraphService {
    constructor() {
        this.validateConfig();
    }

    validateConfig() {
        const required = ['clientId', 'clientSecret', 'tenantId'];
        for (const key of required) {
            if (!MICROSOFT_CONFIG[key]) {
                throw new Error(`Missing Microsoft Graph configuration: ${key}`);
            }
        }
    }

    // Generate OAuth authorization URL
    getAuthorizationUrl(state = null) {
        const params = new URLSearchParams({
            client_id: MICROSOFT_CONFIG.clientId,
            response_type: 'code',
            redirect_uri: MICROSOFT_CONFIG.redirectUri,
            scope: MICROSOFT_CONFIG.scope,
            response_mode: 'query',
            ...(state && { state })
        });

        return `${GRAPH_AUTH_BASE}/${MICROSOFT_CONFIG.tenantId}/oauth2/v2.0/authorize?${params}`;
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(authorizationCode) {
        try {
            const tokenEndpoint = `${GRAPH_AUTH_BASE}/${MICROSOFT_CONFIG.tenantId}/oauth2/v2.0/token`;
            
            const params = new URLSearchParams({
                client_id: MICROSOFT_CONFIG.clientId,
                client_secret: MICROSOFT_CONFIG.clientSecret,
                code: authorizationCode,
                redirect_uri: MICROSOFT_CONFIG.redirectUri,
                grant_type: 'authorization_code'
            });

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token exchange failed: ${error}`);
            }

            const tokenData = await response.json();
            return {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                scope: tokenData.scope
            };
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    }

    // Refresh access token using refresh token
    async refreshAccessToken(refreshToken) {
        try {
            const tokenEndpoint = `${GRAPH_AUTH_BASE}/${MICROSOFT_CONFIG.tenantId}/oauth2/v2.0/token`;
            
            const params = new URLSearchParams({
                client_id: MICROSOFT_CONFIG.clientId,
                client_secret: MICROSOFT_CONFIG.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            });

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }

            const tokenData = await response.json();
            return {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || refreshToken, // Some responses don't include new refresh token
                expiresIn: tokenData.expires_in,
                scope: tokenData.scope
            };
        } catch (error) {
            console.error('Error refreshing access token:', error);
            throw error;
        }
    }

    // Get user profile information
    async getUserProfile(accessToken) {
        try {
            const response = await fetch(`${GRAPH_API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to get user profile: ${error}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Store email account in database
    async storeEmailAccount(tenantId, userProfile, tokenData) {
        try {
            const expiresAt = new Date(Date.now() + (tokenData.expiresIn * 1000));
            
            const { data, error } = await supabase
                .from('email_accounts')
                .upsert({
                    tenant_id: tenantId,
                    user_email: userProfile.mail || userProfile.userPrincipalName,
                    provider: 'microsoft',
                    provider_user_id: userProfile.id,
                    access_token: tokenData.accessToken,
                    refresh_token: tokenData.refreshToken,
                    token_expires_at: expiresAt.toISOString(),
                    scope: tokenData.scope,
                    is_active: true,
                    sync_status: 'pending'
                }, {
                    onConflict: 'tenant_id,provider,provider_user_id'
                });

            if (error) {
                throw new Error(`Failed to store email account: ${error.message}`);
            }

            return data;
        } catch (error) {
            console.error('Error storing email account:', error);
            throw error;
        }
    }

    // Get emails from Microsoft Graph
    async getEmails(accessToken, options = {}) {
        try {
            const {
                top = 50,
                skip = 0,
                filter = null,
                orderby = 'receivedDateTime desc'
            } = options;

            let url = `${GRAPH_API_BASE}/me/messages?$top=${top}&$skip=${skip}&$orderby=${orderby}`;
            
            if (filter) {
                url += `&$filter=${encodeURIComponent(filter)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to get emails: ${error}`);
            }

            const data = await response.json();
            return data.value || [];
        } catch (error) {
            console.error('Error getting emails:', error);
            throw error;
        }
    }

    // Get calendar events from Microsoft Graph
    async getCalendarEvents(accessToken, options = {}) {
        try {
            const {
                top = 50,
                skip = 0,
                startTime = new Date().toISOString(),
                endTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            } = options;

            const filter = `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`;
            let url = `${GRAPH_API_BASE}/me/events?$top=${top}&$skip=${skip}&$filter=${encodeURIComponent(filter)}&$orderby=start/dateTime`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to get calendar events: ${error}`);
            }

            const data = await response.json();
            return data.value || [];
        } catch (error) {
            console.error('Error getting calendar events:', error);
            throw error;
        }
    }

    // Sync emails for a specific email account
    async syncEmails(emailAccountId) {
        try {
            // Get email account details
            const { data: emailAccount, error: accountError } = await supabase
                .from('email_accounts')
                .select('*')
                .eq('id', emailAccountId)
                .eq('provider', 'microsoft')
                .single();

            if (accountError || !emailAccount) {
                throw new Error(`Email account not found: ${accountError?.message}`);
            }

            // Check if token needs refresh
            const now = new Date();
            const expiresAt = new Date(emailAccount.token_expires_at);
            
            let accessToken = emailAccount.access_token;
            
            if (now >= expiresAt && emailAccount.refresh_token) {
                console.log('Refreshing access token...');
                const tokenData = await this.refreshAccessToken(emailAccount.refresh_token);
                accessToken = tokenData.accessToken;
                
                // Update token in database
                await supabase
                    .from('email_accounts')
                    .update({
                        access_token: tokenData.accessToken,
                        refresh_token: tokenData.refreshToken,
                        token_expires_at: new Date(Date.now() + (tokenData.expiresIn * 1000)).toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', emailAccountId);
            }

            // Update sync status
            await supabase
                .from('email_accounts')
                .update({ sync_status: 'syncing' })
                .eq('id', emailAccountId);

            // Get emails from Microsoft Graph
            const emails = await this.getEmails(accessToken, { top: 100 });
            
            // Process and store emails
            let syncedCount = 0;
            for (const email of emails) {
                try {
                    await this.storeEmail(emailAccount, email);
                    syncedCount++;
                } catch (error) {
                    console.error(`Error storing email ${email.id}:`, error);
                }
            }

            // Get calendar events
            const events = await this.getCalendarEvents(accessToken, { top: 100 });
            
            // Process and store calendar events
            let eventsCount = 0;
            for (const event of events) {
                try {
                    await this.storeCalendarEvent(emailAccount, event);
                    eventsCount++;
                } catch (error) {
                    console.error(`Error storing calendar event ${event.id}:`, error);
                }
            }

            // Update sync status
            await supabase
                .from('email_accounts')
                .update({
                    sync_status: 'completed',
                    last_sync_at: new Date().toISOString(),
                    sync_error: null
                })
                .eq('id', emailAccountId);

            return {
                success: true,
                emailsSynced: syncedCount,
                eventsSynced: eventsCount
            };

        } catch (error) {
            console.error('Error syncing emails:', error);
            
            // Update sync status with error
            await supabase
                .from('email_accounts')
                .update({
                    sync_status: 'error',
                    sync_error: error.message
                })
                .eq('id', emailAccountId);

            throw error;
        }
    }

    // Store individual email in database
    async storeEmail(emailAccount, emailData) {
        try {
            // Try to find matching contact by sender email
            const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('tenant_id', emailAccount.tenant_id)
                .eq('email', emailData.sender.emailAddress.address)
                .single();

            const emailRecord = {
                tenant_id: emailAccount.tenant_id,
                email_account_id: emailAccount.id,
                provider_message_id: emailData.id,
                thread_id: emailData.conversationId,
                subject: emailData.subject,
                sender_email: emailData.sender.emailAddress.address,
                sender_name: emailData.sender.emailAddress.name,
                recipient_emails: emailData.toRecipients?.map(r => r.emailAddress.address) || [],
                cc_emails: emailData.ccRecipients?.map(r => r.emailAddress.address) || [],
                bcc_emails: emailData.bccRecipients?.map(r => r.emailAddress.address) || [],
                body_preview: emailData.bodyPreview,
                body_content: emailData.body?.content,
                is_read: emailData.isRead,
                importance: emailData.importance?.toLowerCase(),
                has_attachments: emailData.hasAttachments,
                received_at: emailData.receivedDateTime,
                sent_at: emailData.sentDateTime,
                contact_id: contact?.id || null
            };

            const { error } = await supabase
                .from('emails')
                .upsert(emailRecord, {
                    onConflict: 'email_account_id,provider_message_id'
                });

            if (error) {
                throw new Error(`Failed to store email: ${error.message}`);
            }

            return emailRecord;
        } catch (error) {
            console.error('Error storing email:', error);
            throw error;
        }
    }

    // Store individual calendar event in database
    async storeCalendarEvent(emailAccount, eventData) {
        try {
            // Try to find matching contact by organizer email
            const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('tenant_id', emailAccount.tenant_id)
                .eq('email', eventData.organizer.emailAddress.address)
                .single();

            const eventRecord = {
                tenant_id: emailAccount.tenant_id,
                email_account_id: emailAccount.id,
                provider_event_id: eventData.id,
                subject: eventData.subject,
                description: eventData.body?.content,
                location: eventData.location?.displayName,
                start_time: eventData.start.dateTime,
                end_time: eventData.end.dateTime,
                is_all_day: eventData.isAllDay,
                organizer_email: eventData.organizer.emailAddress.address,
                organizer_name: eventData.organizer.emailAddress.name,
                attendee_emails: eventData.attendees?.map(a => a.emailAddress.address) || [],
                attendee_names: eventData.attendees?.map(a => a.emailAddress.name) || [],
                event_type: 'meeting',
                status: eventData.responseStatus?.response || 'confirmed',
                contact_id: contact?.id || null
            };

            const { error } = await supabase
                .from('calendar_events')
                .upsert(eventRecord, {
                    onConflict: 'email_account_id,provider_event_id'
                });

            if (error) {
                throw new Error(`Failed to store calendar event: ${error.message}`);
            }

            return eventRecord;
        } catch (error) {
            console.error('Error storing calendar event:', error);
            throw error;
        }
    }

    // Get all email accounts for a tenant
    async getEmailAccounts(tenantId) {
        try {
            const { data, error } = await supabase
                .from('email_accounts')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('provider', 'microsoft')
                .eq('is_active', true);

            if (error) {
                throw new Error(`Failed to get email accounts: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting email accounts:', error);
            throw error;
        }
    }

    // Disconnect email account
    async disconnectEmailAccount(emailAccountId) {
        try {
            const { error } = await supabase
                .from('email_accounts')
                .update({
                    is_active: false,
                    access_token: null,
                    refresh_token: null,
                    sync_status: 'disconnected'
                })
                .eq('id', emailAccountId);

            if (error) {
                throw new Error(`Failed to disconnect email account: ${error.message}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error disconnecting email account:', error);
            throw error;
        }
    }
}

export default MicrosoftGraphService;


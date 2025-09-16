# CRM Final Architecture Specification

## System Overview
Custom CRM for CBS Group & Water Roads with hybrid email integration, bulk contact management, and sales pipeline functionality.

## Architecture Decisions (Confirmed)

### Email Integration - Hybrid Approach
- **API Integration**: cbs.com.au (Exchange/Graph API) and waterroads.com.au (Gmail API)
- **Forwarding Integration**: Other approved domains via BCC/forwarding to CRM email addresses
- **Security**: Full disconnect capability, audit logging, granular permissions

### Infrastructure
- **Deployment**: Single cloud instance (Australian hosting preferred)
- **Database**: Common database with company tagging (logical separation)
- **Estimated Cost**: ~$100/month ongoing

### Contact Management
- **Import Method**: Bulk upload capability (CSV/Excel) for 400+ contacts
- **Tagging**: CBS and/or Water Roads (contacts can have both)
- **Additional Domains**: Support for approved domains via email forwarding

### Security & Authentication
- **Phase 1**: Username/password authentication
- **Future**: Option to upgrade to SSO/MFA as separate project
- **Data**: Australian hosting preferred, Europe acceptable

### Development Approach
**Phased Implementation:**

**Phase 1 - MVP (2-3 weeks):**
- Contact management with bulk upload
- Basic sales pipeline (Lead → Qualified → Proposal → Negotiation → Closed)
- Company tagging (CBS/Water Roads)
- Email forwarding integration setup
- Basic call list generation
- Mobile-responsive interface
- Deal value tracking (required CBS, optional Water Roads)

**Phase 2 - Email Integration (2-3 weeks):**
- Microsoft Graph API integration (cbs.com.au)
- Gmail API integration (waterroads.com.au)
- Email parsing and automatic contact linking
- Sent email tracking
- Activity timeline

**Phase 3 - Advanced Features (1-2 weeks):**
- Advanced reporting and analytics
- Email templates
- Enhanced call list filters
- Advanced activity tracking

## Technical Stack
- **Backend**: Flask (Python) with SQLAlchemy ORM
- **Frontend**: React with responsive design
- **Database**: PostgreSQL
- **Email APIs**: Microsoft Graph API, Gmail API
- **Hosting**: Australian cloud provider (AWS Sydney/Melbourne)

## Database Schema (High Level)

### Core Tables
- **contacts**: Contact information, company tags, email domains
- **organizations**: CBS Group, Water Roads, other approved domains
- **deals**: Sales opportunities with values and stages
- **activities**: All interactions (calls, emails, meetings, notes)
- **users**: System users with permissions
- **email_integrations**: API tokens and configuration

### Key Features
- Company tagging on contacts (CBS, Water Roads, both)
- Deal value tracking (required for CBS, optional for Water Roads)
- Activity parsing from emails
- Call list generation based on user-defined dates and last contact
- Mobile-optimized interface

## Security Implementation
- Role-based access control
- API token management with revocation capability
- Audit logging for all data access
- Data encryption at rest and in transit
- Regular backup with Australian data residency

## Integration Points
- **Mac Contacts**: Bulk CSV/Excel import with field mapping
- **Exchange**: Microsoft Graph API for cbs.com.au
- **Gmail**: Gmail API for waterroads.com.au
- **Other Domains**: Email forwarding to crm@cbs.com.au and crm@waterroads.com.au

Ready to proceed with Phase 1 development. The system will be built to handle 400+ contacts efficiently with room for growth.


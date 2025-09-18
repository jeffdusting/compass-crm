# Compass CRM - Technical Specifications

**Document Version**: 1.0
**Date**: September 18, 2025
**Prepared by**: Manus AI Agent

---

## 1. Introduction

This document provides the detailed technical specifications for the Compass CRM system. It covers the system architecture, data models, API specifications, and both functional and non-functional requirements. This document is intended to guide the development and testing of the Compass CRM system.




## 2. Functional Requirements

### 2.1 Contact Management
- **CR-001:** Users must be able to create new contacts with the following fields:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated format)
  - Phone (optional, validated format)
  - Company (optional)
  - Job Title (optional)
  - Address (optional)
  - Notes (optional)
  - Tags (optional, multi-select)
  - Created Date (auto-generated)
  - Last Modified Date (auto-updated)

- **CR-002:** Users must be able to search contacts by:
  - Name (partial matching)
  - Email (exact and partial matching)
  - Company (partial matching)
  - Tags

- **CR-003:** Users must be able to filter contacts by:
  - Company
  - Tags
  - Date created
  - Date modified

- **CR-004:** Users must be able to edit all contact fields except system-generated fields.

- **CR-005:** Users must be able to delete contacts with confirmation dialog.

- **CR-006:** Users must be able to import contacts via CSV with:
  - Duplicate detection (based on email and name similarity)
  - Duplicate resolution options (merge, skip, add as new)
  - Import progress tracking
  - Error reporting for invalid data

### 2.2 Opportunity Management
- **OR-001:** Users must be able to create opportunities with:
  - Title (required)
  - Associated Contact (required)
  - Stage (Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost)
  - Value (optional, currency formatted)
  - Currency (AUD, USD, EUR, GBP)
  - Expected Close Date (required)
  - Priority (Low, Medium, High, Critical)
  - Description (optional)
  - Probability (0-100%)

- **OR-002:** Users must be able to progress opportunities through stages with:
  - Stage history tracking
  - Required fields validation per stage
  - Automatic probability updates based on stage

- **OR-003:** Users must be able to view opportunity pipeline with:
  - Visual pipeline representation
  - Filtering by stage, value, date range
  - Sorting by various criteria

### 2.3 Activity Management
- **AR-001:** Users must be able to create activities of types:
  - **Call:** Direction (inbound/outbound), phone number, duration, outcome
  - **Email:** Direction, subject, content, attachments
  - **Meeting:** Date/time, duration, location, attendees, agenda, meeting URL
  - **Task:** Due date, priority, status, description

- **AR-002:** All activities must be associated with a contact and optionally with an opportunity.

- **AR-003:** Users must be able to view activity timeline for contacts and opportunities.

### 2.4 Email Integration
- **EI-001:** System must integrate with Microsoft Graph API for CBS Group:
  - OAuth 2.0 authentication
  - Read emails from inbox
  - Send emails
  - Access calendar events
  - Sync contacts

- **EI-002:** System must integrate with Gmail API for Water Roads:
  - OAuth 2.0 authentication
  - Read emails from inbox
  - Send emails
  - Access calendar events
  - Sync contacts

- **EI-003:** System must automatically create activities from incoming emails:
  - Parse sender information
  - Create or update contact records
  - Link emails to existing opportunities when possible

### 2.5 User Management
- **UR-001:** System must support multi-tenant architecture:
  - CBS Group users can only access CBS data
  - Water Roads users can only access Water Roads data
  - Admin users can access both tenants

- **UR-002:** System must support role-based access control:
  - Admin: Full access to all features
  - Manager: Access to all CRM features, limited admin functions
  - User: Standard CRM access, no admin functions
  - Viewer: Read-only access




## 3. Non-Functional Requirements

### 3.1 Performance
- **NF-001:** Page load times must not exceed 3 seconds on standard broadband
- **NF-002:** API response times must not exceed 2 seconds for standard operations
- **NF-003:** CSV import must handle files up to 10MB (approximately 50,000 contacts)
- **NF-004:** System must support up to 100 concurrent users

### 3.2 Security
- **NF-005:** All API communications must use HTTPS
- **NF-006:** User passwords must meet complexity requirements
- **NF-007:** API keys and secrets must be stored securely
- **NF-008:** Data must be encrypted at rest and in transit

### 3.3 Compatibility
- **NF-009:** Frontend must be responsive and work on:
  - Desktop browsers: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
  - Mobile browsers: iOS Safari 15+, Android Chrome 100+
  - Screen resolutions: 320px to 2560px width

### 3.4 Availability
- **NF-010:** System uptime must be 99.5% or higher
- **NF-011:** Planned maintenance windows must not exceed 4 hours
- **NF-012:** System must gracefully handle API rate limits from external services



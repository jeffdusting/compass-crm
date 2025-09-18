# Compass CRM - Consolidated Development Plan

**Document Version**: 1.0
**Date**: September 18, 2025
**Prepared by**: Manus AI Agent

---

## 1. Introduction

This document provides a consolidated development plan for the Compass CRM project. It outlines the strategy for rebuilding the system from a clean slate, following a rigorous, documented, and professional software development lifecycle. The project will leverage a modern, services-based architecture using Supabase and a phased approach to deliver UAT-verified functions with increasing sophistication.




## 2. Project Overview and Goals

**Project:** Compass CRM for CBS Group and Water Roads
**Objective:** To build, test, and deploy a fully functional, multi-tenant CRM system from a clean slate, following a rigorous, documented, and professional software development lifecycle. The system will be built with a services architecture, with phases delivering UAT verified functions with increasing sophistication.




## 3. Architecture and Technology Stack

**Objective:** To establish a modern, scalable, and maintainable architecture for the Compass CRM system.

### 3.1 Core Architecture: Microservices with Supabase

The system will be built using a microservices architecture. Each core domain of the CRM will be an independent service with its own data store and a well-defined API. This will ensure separation of concerns, independent scalability, and easier maintenance. The backend will be powered by Supabase, utilizing its integrated services for database, authentication, and serverless functions.

**Required Microservices:**

1.  **Contact Service:** Manages all contact-related data and operations.
2.  **Opportunity Service:** Manages sales opportunities.
3.  **Activity Service:** Manages activities such as calls, emails, and meetings.
4.  **Email Integration Service:** Handles all communication with the Microsoft Graph and Gmail APIs.
5.  **User Service:** Manages user authentication and authorization (to be handled by Supabase Auth).

### 3.2 Technology Stack

*   **Frontend:**
    *   **Framework:** React with Vite
    *   **UI:** shadcn/ui and Tailwind CSS
    *   **Deployment:** Vercel (for seamless CI/CD and hosting)

*   **Backend (Microservices):**
    *   **Platform:** Supabase
        *   **Database:** Supabase Postgres for each microservice.
        *   **Authentication:** Supabase Auth for user management.
        *   **Serverless Functions:** Supabase Edge Functions (written in TypeScript/Deno) for the backend logic of each microservice.

*   **API Specification:**
    *   **Standard:** OpenAPI 3.0
    *   **Action:** For each microservice, the API will be defined in an `openapi.yml` file. This API specification will be the contract for the service and will be used to generate documentation.




## 4. Progressive Development, Documentation, and Testing

**Objective:** To build the Compass CRM system in a staged, test-driven manner, with comprehensive documentation created at each step.

**General Instructions:**
- For each microservice, you will follow this lifecycle: **Define -> Develop -> Document -> Test -> Deploy**.
- All code must be stored in a monorepo on GitHub.
- All documentation must be written in Markdown and stored in a `/docs` directory within the monorepo.

### Stage 1: Initial Setup and Secure Credential Handling

**Your first action is to securely request all necessary credentials from the user.** Do not proceed with any other steps until you have obtained this information. Use the `message_ask_user` tool to request the following secrets. State that these are required for the project and will be handled securely.

**Required Secrets:**

1.  **GitHub Personal Access Token (PAT):**
    *   **Purpose:** To create and manage GitHub repositories for the frontend and backend, and to set up CI/CD pipelines.
    *   **Required Permissions:** `repo`, `workflow`.

2.  **Microsoft Graph API Credentials (for CBS Group):**
    *   **Purpose:** To integrate with Microsoft 365 for email and contact synchronization.
    *   **Credentials Needed:**
        *   `Client ID`
        *   `Client Secret`
        *   `Tenant ID`

3.  **Google Workspace API Credentials (for Water Roads):**
    *   **Purpose:** To integrate with Gmail for email and contact synchronization.
    *   **Credentials Needed:**
        *   `Client ID`
        *   `Client Secret`
        *   `API Key` (if applicable)
        *   Instructions to the user to configure the OAuth consent screen and add the necessary redirect URIs (you will provide these URIs once the services are deployed).

4.  **Vercel API Token:**
    *   **Purpose:** For automated, continuous deployment of the frontend application.

5.  **Supabase Project Credentials:**
    *   **Purpose:** For database hosting, authentication, and serverless functions.
    *   **Credentials Needed:**
        *   `Project URL`
        *   `anon key`
        *   `service_role key`

### Stage 2: Contact Service

1.  **Define:** Create an `openapi.yml` file for the Contact Service. It should define endpoints for:
    *   `POST /contacts` (Create a new contact)
    *   `GET /contacts` (List all contacts with filtering and pagination)
    *   `GET /contacts/{id}` (Get a single contact)
    *   `PUT /contacts/{id}` (Update a contact)
    *   `DELETE /contacts/{id}` (Delete a contact)
    *   `POST /contacts/import` (Bulk import contacts from CSV)

2.  **Develop:**
    *   Set up a new Supabase project (or use the one provided by the user).
    *   Create the `contacts` table in the Supabase database.
    *   Write the Supabase Edge Functions in TypeScript to implement the API defined in `openapi.yml`.

3.  **Document:**
    *   Create a `ContactService.md` file in the `/docs` directory.
    *   This document should explain the purpose of the service, its data models, and provide detailed usage examples for each API endpoint.

4.  **Test:**
    *   Develop a frontend component in the React application to interact with the Contact Service.
    *   Write and execute UAT scenarios to test all functionalities of the Contact Service. These tests should be documented in a `UAT_ContactService.md` file.

5.  **Deploy:**
    *   Configure the Vercel project to automatically deploy the frontend on every push to the `main` branch.
    *   The Supabase functions will be deployed via the Supabase CLI.

### Stage 3: Opportunity and Activity Services

*Follow the same **Define -> Develop -> Document -> Test -> Deploy** lifecycle for the Opportunity and Activity services.* The frontend should be progressively updated to include interfaces for these new services.

### Stage 4: Email Integration Service

*Follow the same lifecycle.* This is the most complex service and should be handled with care.

1.  **Define:** Create an `openapi.yml` for the Email Integration Service. It should include endpoints for:
    *   `POST /email/connect/microsoft` (Initiate OAuth flow for Microsoft)
    *   `GET /email/callback/microsoft` (Handle OAuth callback)
    *   `POST /email/connect/google` (Initiate OAuth flow for Google)
    *   `GET /email/callback/google` (Handle OAuth callback)
    *   `POST /email/sync` (Trigger a manual sync of emails)

2.  **Develop:**
    *   Write the Supabase Edge Functions to handle the OAuth flows and API interactions with both Microsoft Graph and Gmail.
    *   Implement the logic to parse incoming emails and create/update contacts and activities in the respective services.

3.  **Document & Test:** Create comprehensive documentation and UAT plans for the email integration, covering all edge cases.

### Stage 5: Final UAT and Production Readiness

**Objective**: Conduct a full UAT of the complete, microservices-based system and prepare for production deployment.

**Steps**:
1.  **Execute the full, original UAT plan**: Test all features and functionalities of the complete system.
2.  **Conduct performance and load testing**: Ensure the system can handle the expected user load.
3.  **Finalize documentation**: Update all documentation to reflect the final microservices architecture.
4.  **Prepare for production deployment**: Create a detailed deployment plan for the production environment.



# Compass CRM

A modern, multi-tenant CRM system built for CBS Group and Water Roads using Supabase and React.

## Architecture

- **Frontend**: React with Vite, shadcn/ui, and Tailwind CSS
- **Backend**: Supabase with Edge Functions (TypeScript/Deno)
- **Database**: Supabase Postgres
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Features

- Multi-tenant architecture (CBS Group & Water Roads)
- Contact Management with CSV import
- Opportunity Management with pipeline visualization
- Activity Management (calls, emails, meetings, tasks)
- Email Integration (Microsoft Graph & Gmail)
- Role-based access control

## Development Phases

1. **Phase 1**: Contact Service Foundation
2. **Phase 2**: Opportunity and Activity Services
3. **Phase 3**: Microsoft Graph Email Integration
4. **Phase 4**: Gmail Integration
5. **Phase 5**: Full System Integration and UAT

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI
- Vercel CLI (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/compass-crm.git
cd compass-crm

# Install frontend dependencies
cd frontend
npm install

# Install Supabase CLI
npm install -g @supabase/cli
```

### Environment Setup

Copy the environment template and configure your credentials:

```bash
cp .env.example .env.local
```

## Project Structure

```
compass-crm/
├── frontend/          # React application
├── backend/           # Supabase Edge Functions
├── docs/             # Documentation
├── tests/            # Test files
└── README.md
```

## Documentation

- [Development Plan](docs/development-plan.md)
- [Technical Specifications](docs/technical-specifications.md)
- [UAT Plan](docs/uat-plan.md)
- [API Documentation](docs/api/)

## License

Private - CBS Group and Water Roads


# Compass CRM Frontend

Modern Customer Relationship Management System for CBS Group and Water Roads.

## Features

- **Contact Management** - Comprehensive contact database with company tagging
- **Opportunity Tracking** - Sales pipeline management and forecasting
- **Activity Logging** - Complete activity management system
- **Interactive Dashboard** - Real-time analytics and insights
- **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

This project is configured for deployment on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

## API Integration

The frontend connects to the Compass CRM backend services:

- **Contact Service** (Port 5001) - Contact management
- **Opportunity Service** (Port 5002) - Sales pipeline
- **Activity Service** (Port 5003) - Activity tracking

## Company Tagging

The system supports company-specific tagging:

- **CBS** - CBS Group contacts (blue tags)
- **Water Roads** - Water Roads contacts (green tags)

## License

Private - CBS Group & Water Roads


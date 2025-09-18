# Compass CRM - Phase 3.2

A comprehensive Customer Relationship Management system designed for CBS Group and Water Roads, featuring advanced contact management, opportunity tracking, and sales pipeline functionality.

## 🚀 Current Status: Phase 3.2 Complete

This repository contains a fully functional CRM system with the following capabilities:

### ✅ Core Features
- **Contact Management**: Complete CRUD operations with advanced search and filtering
- **CSV Import/Export**: Bulk operations with intelligent duplicate detection and resolution
- **Opportunity Management**: Sales pipeline tracking with stage progression
- **Responsive Design**: Mobile-first interface optimized for all devices
- **Company Tagging**: Multi-tenant support for CBS Group and Water Roads

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeffdusting/compass-crm.git
   cd compass-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Key Features

### Contact Management
- Create, edit, and delete contacts
- Advanced search across all fields
- Filter by company, tags, and dates
- Bulk operations and tagging
- Data validation and normalization

### CSV Operations
- Import contacts from CSV files
- Intelligent duplicate detection using multiple criteria
- Flexible duplicate resolution (merge, skip, add new)
- Export filtered contact lists
- Import progress tracking and error reporting

### Opportunity Management
- Create opportunities linked to contacts
- Track sales pipeline stages
- Manage deal values and currencies
- Progress tracking and history
- Stage-based workflow management

### User Interface
- Responsive design for desktop and mobile
- Intuitive navigation with React Router
- Clean, modern interface design
- Touch-friendly mobile interactions
- Consistent design language

## 📊 Data Management

### Contact Fields
- First Name, Last Name (required)
- Email (required, validated)
- Phone, Company, Job Title
- Address, Notes, Tags
- Created/Modified timestamps

### Opportunity Fields
- Title, Description
- Associated Contact
- Stage (Lead → Qualified → Proposal → Negotiation → Closed)
- Value and Currency
- Expected Close Date
- Priority and Probability

## 🏢 Multi-Tenant Support

The system supports both CBS Group and Water Roads with:
- Company tagging on contacts
- Separate data views and filtering
- Shared contact capabilities
- Organization-specific workflows

## 🎯 Phase 3.2 Achievements

- ✅ Complete contact lifecycle management
- ✅ Advanced CSV import with duplicate handling
- ✅ Opportunity pipeline management
- ✅ Responsive design for all devices
- ✅ Search and filtering capabilities
- ✅ Data export functionality
- ✅ Company tagging and organization
- ✅ Input validation and error handling

## 🚀 Future Enhancements (Phase 4+)

- Email integration capabilities
- Advanced reporting and analytics
- Enhanced activity tracking
- API development for external integrations
- Advanced user management and permissions

## 📝 License

This project is proprietary software developed for CBS Group and Water Roads.

---

**Version**: Phase 3.2  
**Last Updated**: September 2025  
**Status**: Production Ready


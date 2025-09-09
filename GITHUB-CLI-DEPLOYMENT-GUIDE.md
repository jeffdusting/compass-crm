# GitHub CLI Deployment Guide - Compass CRM

## 🚀 Complete Deployment Instructions

This guide will help you deploy your Compass CRM system to GitHub and Vercel using GitHub CLI.

## Prerequisites

### 1. Install GitHub CLI
**On Windows:**
```bash
winget install --id GitHub.cli
```

**On macOS:**
```bash
brew install gh
```

**On Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 2. Install Node.js (if not already installed)
Download from: https://nodejs.org/ (Version 18 or higher)

### 3. Create Vercel Account
Go to: https://vercel.com/signup

## Step-by-Step Deployment

### Step 1: Download the Complete Project

1. **Download all files** from this sandbox to your local machine:
   - Copy the entire `/home/ubuntu/cbs-waterroads-crm/frontend-package/` directory
   - Copy the backend services from `/home/ubuntu/cbs-waterroads-crm/services/`
   - Copy all configuration files

2. **Create a new directory** on your local machine:
```bash
mkdir compass-crm
cd compass-crm
```

3. **Copy the frontend package** contents to this directory

### Step 2: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Compass CRM system with Supabase backend"
```

### Step 3: Authenticate with GitHub

```bash
# Login to GitHub CLI
gh auth login

# Follow the prompts:
# - Choose "GitHub.com"
# - Choose "HTTPS" 
# - Choose "Login with a web browser"
# - Follow the browser authentication
```

### Step 4: Create GitHub Repository

```bash
# Create repository (choose public or private)
gh repo create compass-crm --public --description "Compass CRM - Modern CRM for CBS Group & Water Roads"

# Or for private repository:
# gh repo create compass-crm --private --description "Compass CRM - Modern CRM for CBS Group & Water Roads"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/compass-crm.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 6: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy the project
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? compass-crm
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Step 7: Configure Environment Variables

After deployment, you need to set environment variables in Vercel:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: compass-crm
3. **Go to Settings** → Environment Variables
4. **Add these variables**:

```
VITE_API_BASE_URL = http://localhost:5001
VITE_SUPABASE_URL = https://eisewfroxfhovsxaignq.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2V3ZnJveGZob3ZzeGFpZ25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODE1MzcsImV4cCI6MjA3Mjk1NzUzN30.mjFMUbgIhEOvXjS5QMq-VG3TH05HoTRR8XigBi8DbtE
```

### Step 8: Redeploy with Environment Variables

```bash
# Redeploy to apply environment variables
vercel --prod
```

## 📁 Project Structure

Your repository should have this structure:

```
compass-crm/
├── package.json
├── vite.config.js
├── vercel.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
├── .gitignore
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── services/
│   ├── contact-service/
│   ├── opportunity-service/
│   ├── activity-service/
│   └── api-gateway/
└── docs/
    ├── supabase-schema.sql
    ├── deployment-guide.md
    └── test-results.json
```

## 🔧 Backend Services Deployment

For the backend services, you have several options:

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Connect your GitHub repository
3. Deploy each service separately
4. Update VITE_API_BASE_URL to your Railway URLs

### Option 2: Heroku
1. Create Heroku apps for each service
2. Deploy using git push
3. Update environment variables

### Option 3: DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and run commands
3. Set environment variables

## 🌐 Custom Domain (Optional)

To add a custom domain:

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update DNS**:
   - Add CNAME record pointing to vercel.app
   - Wait for propagation (up to 24 hours)

## 🧪 Testing Your Deployment

After deployment:

1. **Visit your Vercel URL** (provided after deployment)
2. **Test the dashboard** - should show contact statistics
3. **Test contact listing** - should show sample data
4. **Verify API connectivity** - check browser console for errors

## 🔍 Troubleshooting

### Common Issues:

**Build Fails:**
- Check Node.js version (must be 18+)
- Run `npm install` locally first
- Check for syntax errors in code

**API Not Working:**
- Verify VITE_API_BASE_URL is correct
- Check that backend services are running
- Verify CORS settings

**Environment Variables Not Working:**
- Make sure variables start with `VITE_`
- Redeploy after adding variables
- Check Vercel dashboard settings

## 📞 Support

If you encounter issues:

1. **Check the logs**:
   ```bash
   vercel logs
   ```

2. **Verify environment variables**:
   ```bash
   vercel env ls
   ```

3. **Test locally**:
   ```bash
   npm run dev
   ```

## 🎉 Success!

Once deployed, you'll have:

- ✅ **Live CRM System** at your Vercel URL
- ✅ **GitHub Repository** with all source code
- ✅ **Automatic Deployments** on every git push
- ✅ **Professional Domain** (if configured)

Your Compass CRM system is now live and accessible to CBS Group and Water Roads teams!

## 📋 Quick Commands Reference

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/compass-crm.git
cd compass-crm
npm install

# Development
npm run dev

# Build
npm run build

# Deploy
vercel --prod

# View logs
vercel logs

# Open in browser
vercel --open
```

---

**Need Help?** 
- GitHub CLI Docs: https://cli.github.com/manual/
- Vercel Docs: https://vercel.com/docs
- React Docs: https://react.dev/


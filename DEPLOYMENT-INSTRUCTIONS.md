# Compass CRM - Vercel Deployment Instructions

## 📋 Repository Information

**Repository Name:** `compass-crm`  
**GitHub URL:** `https://github.com/YOUR_USERNAME/compass-crm`  
**Description:** Compass CRM - Modern Customer Relationship Management System for CBS Group & Water Roads

## 🚀 Vercel Deployment Steps

### Step 1: Upload Files to GitHub Repository
1. Go to your existing GitHub repository: `https://github.com/YOUR_USERNAME/compass-crm`
2. Upload the ZIP file contents to the repository
3. Commit message: "Add Compass CRM frontend for Vercel deployment"
4. Ensure all files are committed

### Step 2: Install Vercel CLI (Required for Environment Variables)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
# Follow the browser authentication process
```

### Step 3: Deploy to Vercel via CLI
```bash
# Navigate to your local project directory (after extracting ZIP)
cd compass-crm

# Initialize Vercel project
vercel

# Follow the prompts:
# ? Set up and deploy "~/compass-crm"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? compass-crm
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
```

### Step 4: Configure Environment Variables via CLI
```bash
# Add environment variables
vercel env add VITE_API_BASE_URL
# When prompted, enter: https://your-backend-url.com
# Select: Production, Preview, Development (all environments)

vercel env add VITE_SUPABASE_URL  
# When prompted, enter: https://eisewfroxfhovsxaignq.supabase.co
# Select: Production, Preview, Development (all environments)

vercel env add VITE_SUPABASE_ANON_KEY
# When prompted, enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2V3ZnJveGZob3ZzeGFpZ25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODE1MzcsImV4cCI6MjA3Mjk1NzUzN30.mjFMUbgIhEOvXjS5QMq-VG3TH05HoTRR8XigBi8DbtE
# Select: Production, Preview, Development (all environments)
```

### Step 5: Deploy to Production
```bash
# Deploy to production with environment variables
vercel --prod

# Your deployment URL will be displayed
# Example: https://compass-crm-abc123.vercel.app
```

### Step 6: Verify Deployment
```bash
# Open the deployed site in browser
vercel --open

# Check deployment status
vercel ls

# View deployment logs if needed
vercel logs
```

## 🌐 Expected URLs

After deployment you'll get:
- **Frontend URL:** `https://compass-crm-[random].vercel.app`
- **Custom Domain:** (optional) `https://your-domain.com`

## 🔧 Backend Services

The backend services (in the services/ folder) need to be deployed separately:

**Recommended: Railway.app**
1. Go to https://railway.app
2. Connect your GitHub repository
3. Deploy each service in services/ folder
4. Update VITE_API_BASE_URL with Railway URLs

## ✅ Verification

After deployment:
1. Visit your Vercel URL
2. Dashboard should load with contact statistics
3. Contacts page should show sample data
4. No console errors in browser

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure repository structure is correct
4. Contact support if needed

---

**Repository Name to Use:** `compass-crm`  
**Vercel Project Name:** `compass-crm`


## 🔧 Backend API Configuration

For now, the frontend will connect to your local backend services. To make it fully functional:

### Option 1: Local Backend (Development)
```bash
# In your CRM backend directory, start services:
cd /path/to/cbs-waterroads-crm
./start-supabase-services.sh

# Update VITE_API_BASE_URL to: http://localhost:5001
```

### Option 2: Deploy Backend to Railway (Production)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy each service
railway deploy
```

## 🌐 Expected URLs

After deployment you'll get:
- **Frontend URL:** `https://compass-crm-[random].vercel.app`
- **Custom Domain:** (optional) Configure in Vercel dashboard

## ✅ Verification Checklist

After deployment:
- [ ] Visit your Vercel URL
- [ ] Dashboard loads with contact statistics
- [ ] Contacts page shows sample data (John Smith, Sarah Johnson, Mike Wilson)
- [ ] No console errors in browser developer tools
- [ ] Company tags (CBS, Water Roads) display correctly

## 🔄 Continuous Deployment

Once set up, any changes pushed to your GitHub repository will automatically trigger a new deployment on Vercel.

## 🆘 Troubleshooting

**Build Fails:**
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

**Environment Variables Not Working:**
```bash
# List current environment variables
vercel env ls

# Remove and re-add if needed
vercel env rm VITE_API_BASE_URL
vercel env add VITE_API_BASE_URL
```

**API Connection Issues:**
- Verify backend services are running
- Check CORS settings in backend
- Confirm API URLs are correct

## 📞 Support Commands

```bash
# View project info
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Remove project (if needed)
vercel remove compass-crm
```

---

**Repository Name:** `compass-crm`  
**Vercel Project Name:** `compass-crm`  
**Framework:** `Vite` (React)


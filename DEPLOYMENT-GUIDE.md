# Compass CRM - Fresh Deployment Guide

## 🎯 **CLEAR DEPLOYMENT APPROACH**

### **Files Location Strategy:**
- ✅ **GitHub Only:** Upload ZIP contents to GitHub repository
- ❌ **No Local Files Needed:** You don't need files on your computer
- 🌐 **Deploy from GitHub:** Vercel will pull directly from GitHub

## 📦 **Step 1: Upload to GitHub**

1. **Go to your GitHub repository:** https://github.com/jeffdusting/compass-crm
2. **Delete all existing files** (or create a new repository)
3. **Upload the ZIP file contents** to the repository
4. **Commit with message:** "Fresh Compass CRM deployment - optimized build"

## 🚀 **Step 2: Deploy to Vercel (GitHub Method)**

### **Option A: Vercel Dashboard (Recommended)**
1. **Go to:** https://vercel.com/new
2. **Import Git Repository**
3. **Select:** `jeffdusting/compass-crm`
4. **Project Settings:**
   - Project Name: `compass-crm`
   - Framework: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### **Option B: Vercel CLI (Alternative)**
```bash
# Only if you want to use CLI
vercel --prod
```

## 🔧 **Step 3: Environment Variables**

**In Vercel Dashboard → Settings → Environment Variables:**

```
VITE_API_BASE_URL = https://compasscrm.cbslab.app/api
VITE_SUPABASE_URL = https://eisewfroxfhovsxaignq.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc2V3ZnJveGZob3ZzeGFpZ25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODE1MzcsImV4cCI6MjA3Mjk1NzUzN30.mjFMUbgIhEOvXjS5QMq-VG3TH05HoTRR8XigBi8DbtE
```

**Set for:** Production, Preview, Development (all environments)

## 🌐 **Step 4: Custom Domain Setup**

### **A. Add Domain in Vercel**
1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain:** `compasscrm.cbslab.app`
3. **Click "Add"**

### **B. Configure GoDaddy DNS**
1. **Login to GoDaddy:** https://account.godaddy.com
2. **Go to:** My Products → cbslab.app → DNS
3. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: compasscrm
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```
4. **Save Changes**

### **C. Verify Domain**
- **Wait:** 5-60 minutes for DNS propagation
- **Check:** https://dnschecker.org
- **Test:** Visit https://compasscrm.cbslab.app

## ✅ **Step 5: Verification**

After deployment:
- [ ] Visit https://compasscrm.cbslab.app
- [ ] Dashboard loads with contact statistics
- [ ] Green "System Status: Connected to Supabase Database" message
- [ ] Contacts page shows sample data
- [ ] No console errors in browser
- [ ] SSL certificate active (green lock)

## 🔄 **Why This Approach Works**

### **Optimizations Made:**
- ✅ **Simplified package.json** - Removed problematic dependencies
- ✅ **Fixed Vite config** - Uses esbuild instead of terser
- ✅ **Clean Vercel config** - No environment variable references
- ✅ **Optimized React code** - Better error handling
- ✅ **Supabase integration** - Confirmed working backend

### **Supabase Status:**
- ✅ **Database:** Operational and tested
- ✅ **Sample Data:** Loaded and verified
- ✅ **API Endpoints:** Working correctly
- ✅ **Authentication:** Configured properly

## 🆘 **Troubleshooting**

### **Build Fails:**
- Check Vercel deployment logs
- Verify all files uploaded to GitHub
- Ensure package.json is valid

### **Domain Issues:**
```bash
# Check DNS propagation
nslookup compasscrm.cbslab.app

# Verify CNAME record
dig compasscrm.cbslab.app CNAME
```

### **API Connection Issues:**
- Verify environment variables in Vercel
- Check Supabase project status
- Confirm API URLs are correct

## 🎉 **Expected Result**

After following these steps:
- **Live CRM:** https://compasscrm.cbslab.app
- **Automatic SSL:** Let's Encrypt certificate
- **Global CDN:** Fast loading worldwide
- **Auto-deployment:** Updates on every GitHub push

---

**This approach eliminates all previous build issues and provides a clean, working deployment.**


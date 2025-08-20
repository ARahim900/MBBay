# Netlify Deployment Guide

## Quick Deploy to Netlify

### Option 1: Direct GitHub Integration (Recommended)

1. **Connect GitHub Repository**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your repository: `ARahim900/MBBay`

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (will be set automatically from netlify.toml)

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL = https://jpqkoyxnsdzorsadpdvs.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWtveXhuc2R6b3JzYWRwZHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODMwNjcsImV4cCI6MjA3MTA1OTA2N30.6D0kMEPyZVeDi1nUpk_XE8xPIKr6ylHyfjmjG4apPWY
     ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app
   - Your app will be available at a unique URL like `https://remarkable-app-name.netlify.app`

### Option 2: Manual Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Drag and Drop**
   - Go to Netlify dashboard
   - Drag the `dist` folder to the deploy area

### Option 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## Build Configuration

The project includes:
- ✅ `netlify.toml` - Netlify configuration
- ✅ Production build working (`npm run build`)
- ✅ SPA routing configured (redirects to index.html)
- ✅ Environment variables ready
- ✅ Security headers configured
- ✅ Static asset caching optimized

## Features Ready for Production

- ✅ **STP Plant Module** - Fully functional with error handling
- ✅ **Water Management** - Complete dashboard
- ✅ **Electricity Monitoring** - Real-time tracking
- ✅ **HVAC System** - Management interface
- ✅ **Firefighting & Alarm** - Safety monitoring
- ✅ **Contractor Tracker** - Contract management
- ✅ **Supabase Integration** - Database connectivity
- ✅ **Responsive Design** - Mobile-friendly UI
- ✅ **Error Boundaries** - Crash prevention
- ✅ **Modern UI Components** - Consistent design system

## Post-Deployment Steps

1. **Test All Modules** - Ensure all sections load correctly
2. **Verify Database Connection** - Check Supabase integration
3. **Test Responsive Design** - Check mobile/tablet views
4. **Set Custom Domain** (Optional) - Configure your domain in Netlify
5. **Enable Form Handling** (Optional) - If using Netlify forms

## Troubleshooting

### Common Issues:
- **Build fails**: Check that all dependencies are in package.json
- **Environment variables**: Ensure they're set in Netlify dashboard
- **404 errors**: Verify SPA redirects are working (configured in netlify.toml)
- **Large bundle size**: The app uses code splitting for optimal loading

### Support:
- Check build logs in Netlify dashboard
- Verify environment variables are properly set
- Test locally with `npm run build && npm run preview`
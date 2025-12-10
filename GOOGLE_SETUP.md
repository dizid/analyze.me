# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth credentials for the Grok AI Self-Analysis app. The Google Cloud Console can be overwhelming, so we'll take it step-by-step with screenshots and clear instructions.

## Overview

You'll need **two** credentials from Google:
1. **Client ID** - For OAuth authentication (lets users sign in)
2. **API Key** - For the Google Picker (lets users select documents)

Both are obtained from the [Google Cloud Console](https://console.cloud.google.com/).

---

## Step 1: Create a Google Cloud Project

### 1.1 Go to Google Cloud Console
- Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Sign in with your Google account

### 1.2 Create a New Project
- Click the **project dropdown** at the top (next to "Google Cloud")
- Click **"NEW PROJECT"**
- Enter project details:
  - **Project name**: `grok-self-analysis` (or your preferred name)
  - **Organization**: Leave as "No organization" (unless you have one)
- Click **"CREATE"**
- Wait 10-30 seconds for the project to be created
- **Select your new project** from the dropdown

---

## Step 2: Enable Required APIs

You need to enable two APIs for this project.

### 2.1 Navigate to APIs & Services
- Click the **☰ hamburger menu** (top left)
- Go to: **APIs & Services** → **Library**

### 2.2 Enable Google Drive API
- In the search bar, type: `Google Drive API`
- Click on **"Google Drive API"**
- Click the blue **"ENABLE"** button
- Wait for it to enable (5-10 seconds)

### 2.3 Enable Google Docs API
- Click **"EXPLORE AND ENABLE APIS"** or use the back button
- In the search bar, type: `Google Docs API`
- Click on **"Google Docs API"**
- Click the blue **"ENABLE"** button
- Wait for it to enable

---

## Step 3: Create OAuth Consent Screen

Before creating credentials, you must configure the OAuth consent screen. This is what users see when they authenticate.

### 3.1 Navigate to OAuth Consent Screen
- Click **☰ hamburger menu** → **APIs & Services** → **OAuth consent screen**

### 3.2 Choose User Type
- Select **"External"** (allows anyone with a Google account to use your app)
- Click **"CREATE"**

### 3.3 Fill Out App Information

**Page 1: OAuth consent screen**
- **App name**: `Grok AI Self-Analysis` (or your preferred name)
- **User support email**: Select your email from dropdown
- **App logo**: (Optional) Upload a logo if you have one
- **Application home page**: Leave blank for now (or add your Netlify URL later)
- **Authorized domains**: Leave blank for local dev; add your domain later (e.g., `yourapp.netlify.app`)
- **Developer contact information**: Enter your email
- Click **"SAVE AND CONTINUE"**

**Page 2: Scopes**
- Click **"ADD OR REMOVE SCOPES"**
- In the filter box, search for: `drive.readonly`
- Check the box for:
  - `https://www.googleapis.com/auth/drive.readonly`
  - `https://www.googleapis.com/auth/documents.readonly`
- Click **"UPDATE"**
- Click **"SAVE AND CONTINUE"**

**Page 3: Test users** (if your app is in "Testing" mode)
- Click **"+ ADD USERS"**
- Enter your email address (and any other test users)
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**

**Page 4: Summary**
- Review your settings
- Click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth Client ID

Now you'll create the credentials for user authentication.

### 4.1 Navigate to Credentials
- Click **☰ hamburger menu** → **APIs & Services** → **Credentials**

### 4.2 Create OAuth Client ID
- Click **"+ CREATE CREDENTIALS"** (at the top)
- Select **"OAuth client ID"**

### 4.3 Configure OAuth Client
- **Application type**: Select **"Web application"**
- **Name**: `Grok Self-Analysis Web Client` (or your preferred name)

**Authorized JavaScript origins:**
- Click **"+ ADD URI"**
- For local development, add:
  - `http://localhost:3000`
  - `http://localhost:9999` (for Netlify Dev)
- For production (add these later when you deploy):
  - `https://yourapp.netlify.app` (replace with your actual Netlify URL)

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- For local development, add:
  - `http://localhost:3000`
  - `http://localhost:9999`
- For production (add these later):
  - `https://yourapp.netlify.app`

- Click **"CREATE"**

### 4.4 Save Your Client ID
- A popup will appear with your credentials
- **Copy the "Client ID"** - it looks like: `123456789-abc123def456.apps.googleusercontent.com`
- Save it somewhere safe (you'll add it to `.env.local` later)
- Click **"OK"**

---

## Step 5: Create API Key

The API Key is needed for the Google Picker to work.

### 5.1 Create API Key
- Still in **APIs & Services** → **Credentials**
- Click **"+ CREATE CREDENTIALS"** (at the top)
- Select **"API key"**

### 5.2 Save Your API Key
- A popup will appear with your API key
- **Copy the API key** - it looks like: `AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q`
- Save it somewhere safe
- Click **"OK"**

### 5.3 Restrict the API Key (Recommended for Security)
- Find your newly created API key in the list
- Click the **pencil icon** (edit) next to it
- Under "API restrictions":
  - Select **"Restrict key"**
  - Check the boxes for:
    - **Google Drive API**
    - **Google Picker API** (if available)
- Under "Application restrictions":
  - Select **"HTTP referrers (web sites)"**
  - Click **"+ ADD AN ITEM"**
  - Add:
    - `http://localhost:3000/*`
    - `http://localhost:9999/*`
    - `https://yourapp.netlify.app/*` (add later when deployed)
- Click **"SAVE"**

---

## Step 6: Add Credentials to Your Project

Now that you have both credentials, add them to your app.

### 6.1 Open Your Project's .env.local File
```bash
# Navigate to your project directory
cd /path/to/analyze.me

# Open .env.local in your editor
nano .env.local
# or
code .env.local
```

### 6.2 Add Your Credentials
```env
# Google OAuth (Client-side)
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q

# Netlify Function URL (local development)
VITE_NETLIFY_FUNCTIONS_URL=http://localhost:9999/.netlify/functions
```

**Replace** the placeholder values with your actual:
- **Client ID** from Step 4.4
- **API Key** from Step 5.2

### 6.3 Save the File
- Save and close the file
- **Important**: Never commit this file to Git (it's already in .gitignore)

---

## Step 7: Test Your Setup

### 7.1 Start Your Development Server
```bash
npm run dev
```

### 7.2 Open Your App
- Navigate to: [http://localhost:3000](http://localhost:3000)

### 7.3 Test Authentication
- Click the **"Connect Google"** button
- You should see a Google sign-in popup
- Select your Google account
- Grant the requested permissions (Drive & Docs read access)
- After authentication, you should see:
  - Your profile picture
  - "Select Document" button enabled

### 7.4 Test Document Picker
- Click **"Select Document"**
- The Google Picker should open
- You should see your Google Docs
- Select a document
- The document name and size should appear

### 7.5 Troubleshooting

**Error: "Access blocked: This app's request is invalid"**
- Make sure you've added `http://localhost:3000` to:
  - Authorized JavaScript origins
  - Authorized redirect URIs
- Wait a few minutes for changes to propagate

**Error: "API key not valid"**
- Check that you've enabled both Google Drive API and Google Docs API
- Verify the API key is correctly copied to .env.local
- Restart your dev server after changing .env.local

**Error: "The app is in testing mode"**
- Make sure you've added your email to Test Users (Step 3.3)
- OR publish your app (in OAuth consent screen, click "PUBLISH APP")

**Picker doesn't open**
- Check browser console for errors
- Verify the API key has Google Picker API enabled
- Make sure scripts are loaded in index.html

---

## Step 8: Deploy to Production

When you're ready to deploy:

### 8.1 Update Authorized Origins and Redirect URIs
- Go back to **APIs & Services** → **Credentials**
- Click on your **OAuth 2.0 Client ID**
- Add your production URLs:
  - **Authorized JavaScript origins**: `https://yourapp.netlify.app`
  - **Authorized redirect URIs**: `https://yourapp.netlify.app`
- Click **"SAVE"**

### 8.2 Update API Key Restrictions
- Edit your **API Key**
- Under "Application restrictions" → "HTTP referrers":
  - Add: `https://yourapp.netlify.app/*`
- Click **"SAVE"**

### 8.3 Add to Netlify Environment Variables
- In Netlify Dashboard → Site settings → Environment variables
- Add:
  - `VITE_GOOGLE_CLIENT_ID` = (your Client ID)
  - `VITE_GOOGLE_API_KEY` = (your API Key)

### 8.4 Update OAuth Consent Screen
- Go to **OAuth consent screen**
- Add your production domain to **Authorized domains**
- See **Step 9** below for full publishing guide

---

## Step 9: Publishing from Test to Production

By default, your OAuth consent screen is in "Testing" mode, which limits access to 100 test users. To make your app available to all Google users, you need to publish to Production.

### 9.1 Understanding Test vs Production Mode

**Test Mode (Default)**
- Only users in "Test users" list can authenticate
- Up to 100 test users allowed
- No verification required
- Good for development and internal testing

**Production Mode**
- Any Google user can authenticate
- No user limit
- May show "unverified app" warning
- Required for public apps

### 9.2 Prerequisites for Publishing

Before publishing, you must have:

1. **Privacy Policy (Required)**
   - Create a privacy policy page explaining your data usage
   - Must be publicly accessible URL
   - Should cover: data collection, usage, retention, third parties
   - You already have this at `/privacy-policy` (see PrivacyPolicy.vue)

2. **Terms of Service (Recommended)**
   - Optional but recommended for professional apps
   - Available at `/terms` (see TermsOfService.vue)

3. **Authorized Domain**
   - Your Netlify production domain (e.g., `yourapp.netlify.app`)
   - Must be added to OAuth consent screen

### 9.3 Add Privacy Policy URL

**Navigate to OAuth Consent Screen:**
- Google Cloud Console → APIs & Services → OAuth consent screen
- Click **"EDIT APP"**

**Add Required URLs:**
- **Application home page**: `https://yourapp.netlify.app`
- **Privacy policy link**: `https://yourapp.netlify.app/privacy-policy`
- **Terms of service link**: `https://yourapp.netlify.app/terms` (optional)
- **Authorized domains**: Add `yourapp.netlify.app`

**Save Changes:**
- Click **"SAVE AND CONTINUE"** through all pages
- Click **"BACK TO DASHBOARD"**

### 9.4 Publish Your App

**In OAuth Consent Screen Dashboard:**
1. Look for **"Publishing status: Testing"**
2. Click **"PUBLISH APP"** button
3. Read the publishing terms
4. Click **"CONFIRM"**

**Wait for Status Update:**
- Status should change to "In Production" within 1-2 minutes
- Refresh the page if needed

### 9.5 Expected Results After Publishing

**Option A: Unverified Production (Most Likely)**

Your app will go live immediately but show an "unverified app" warning:

- Any Google user can now authenticate
- First-time users see: "Google hasn't verified this app"
- Users must click **"Advanced"** → **"Go to [App Name] (unsafe)"**
- After accepting, app works normally
- This is **completely normal** for personal/small projects

**Option B: Verification Required**

Google may require full verification for sensitive scopes:

- You'll see a message: "Verification required"
- Verification process takes 4-6 weeks
- See section 9.6 below for verification steps

### 9.6 App Verification (Optional)

Full verification removes the "unverified app" warning. This is **optional** and only needed for:
- Public-facing apps with large user base
- Apps requiring professional appearance
- Commercial applications

**When to Apply:**
- **Skip for MVP/Personal Use**: Unverified mode works fine
- **Apply for Public Launch**: Better user trust and experience

**Verification Requirements:**
1. **Privacy Policy** - Public URL (you have this)
2. **Homepage** - Clear description of your app
3. **Demo Video** - YouTube video showing app functionality (optional but helpful)
4. **Domain Verification** - Verify ownership of your domain
5. **Scope Justification** - Explain why you need each OAuth scope

**How to Apply:**
1. Go to **OAuth consent screen**
2. Click **"Prepare for verification"**
3. Fill out the verification questionnaire:
   - Explain how your app uses Drive/Docs APIs
   - Provide demo credentials
   - Upload demo video (if available)
4. Submit for review
5. Wait 4-6 weeks for Google's response

**After Approval:**
- "Verified" badge appears on consent screen
- No warning shown to users
- Professional appearance

### 9.7 Testing Production Mode

**Test with a non-test-user account:**

1. **Clear browser cache** and sign out of Google
2. Open your deployed app: `https://yourapp.netlify.app`
3. Click **"Connect Google"**
4. Sign in with a Google account **NOT** in your test users list
5. You should see either:
   - "Unverified app" warning (click Advanced → Continue)
   - Normal consent screen (if verified)
6. Grant permissions
7. Verify app works correctly

### 9.8 Troubleshooting Publishing

**Error: "Add privacy policy before publishing"**
- You must add a privacy policy URL to OAuth consent screen
- URL must be publicly accessible
- Deploy your app first, then add the URL

**Error: "Domain not verified"**
- Add your domain to "Authorized domains" in OAuth consent screen
- Format: `yourapp.netlify.app` (no https://)
- Wait 5-10 minutes for verification

**Warning: "This app needs verification"**
- Your app uses sensitive scopes (Drive, Docs)
- You can still publish to unverified production
- Full verification is optional (4-6 weeks)

**Users can't access after publishing:**
- Clear browser cache
- Check that app status shows "In Production"
- Verify authorized domains are correct
- Test with incognito/private browsing

### 9.9 Recommended Approach

**For Most Users:**
1. ✅ Publish to unverified production (immediate)
2. ✅ Use app with "unverified" warning (works fine)
3. ⏰ Apply for verification later if needed

**For Professional/Public Apps:**
1. ✅ Create comprehensive privacy policy
2. ✅ Prepare demo video
3. ✅ Apply for verification before launch
4. ⏰ Wait 4-6 weeks for approval

---

## Quick Reference

**Where to find your credentials:**
- Google Cloud Console: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Credentials Page: **APIs & Services** → **Credentials**
- OAuth Consent Screen: **APIs & Services** → **OAuth consent screen**
- Enabled APIs: **APIs & Services** → **Dashboard**

**Required APIs:**
- Google Drive API
- Google Docs API

**Required Scopes:**
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/documents.readonly`

**Environment Variables:**
- `VITE_GOOGLE_CLIENT_ID` - OAuth Client ID
- `VITE_GOOGLE_API_KEY` - API Key for Picker

---

## Still Having Trouble?

Common issues and solutions:

1. **"This app isn't verified" warning**
   - Normal for apps in testing mode
   - Click "Advanced" → "Go to [App Name] (unsafe)"
   - OR publish your app through verification process

2. **Changes not taking effect**
   - Google credentials can take 5-10 minutes to propagate
   - Clear browser cache and cookies
   - Try incognito/private browsing mode

3. **Permissions not showing up correctly**
   - Revoke app access: [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions)
   - Try authenticating again

4. **API quota limits**
   - Free tier: 1 billion queries/day for Drive API
   - Check quota: **APIs & Services** → **Dashboard** → Select API → **Quotas**

---

## Security Best Practices

- ✅ **DO** restrict your API key to specific referrers
- ✅ **DO** use different credentials for dev and production
- ✅ **DO** keep your `.env.local` file out of version control
- ❌ **DON'T** share your API key publicly
- ❌ **DON'T** commit credentials to GitHub
- ❌ **DON'T** use the same credentials across multiple projects

---

**Need help?** Open an issue on GitHub or check the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2).

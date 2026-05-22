# Netlify Deployment Guide for ExpenseAI

This folder contains all the configuration and instructions needed to deploy your ExpenseAI project to Netlify.

---

## 📋 Quick Checklist

- [ ] Step 1: Add `netlify.toml` to the ExpenseAI repo root
- [ ] Step 2: Create Firebase environment variables locally
- [ ] Step 3: Push repo to GitHub
- [ ] Step 4: Connect repo to Netlify
- [ ] Step 5: Add Firebase env vars to Netlify Site Settings
- [ ] Step 6: Trigger deploy

---

## 📁 Files in This Folder

### `netlify.toml`
The main configuration file that tells Netlify how to build your project.

**What it does:**
- Base directory: `ExpensesAI` (where the actual Vite/React project lives)
- Build command: `npm run build` (creates the dist folder)
- Publish directory: `dist` (the folder to deploy)
- Redirects: All routes serve `index.html` for SPA routing

**Where to place it:** Copy this to the root of your `ExpenseAI` repository.

### `.env.example`
Template showing which Firebase variables you need.

**What it does:** Documents the six `VITE_FIREBASE_…` variables required for authentication.

**Where to place it:** Already in your `ExpenseAI/` root (for reference).

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Local Project

1. Ensure `ExpenseAI/netlify.toml` exists and contains:
   ```toml
   [build]
     base    = "ExpensesAI"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to   = "/index.html"
     status = 200
   ```

2. Create `ExpenseAI/.env.local` (in repo root, NOT committed):
   ```text
   VITE_FIREBASE_API_KEY=<your-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
   VITE_FIREBASE_PROJECT_ID=<your-project>
   VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   VITE_FIREBASE_APP_ID=<your-app-id>
   ```

3. Test locally:
   ```bash
   cd ExpenseAI/ExpensesAI
   npm run build
   npm run preview
   ```
   - Should build without errors
   - Preview should show your app (not a 404)

### Step 2: Commit & Push to GitHub

1. Add `.env.local` to `.gitignore` (don't commit secrets):
   ```
   .env.local
   .env*.local
   ```

2. Commit & push:
   ```bash
   git add .
   git commit -m "Add netlify.toml for deployment"
   git push
   ```

### Step 3: Connect Repo to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Log in or sign up
3. Click **"Add new site" → "Import an existing project"**
4. Select your Git provider (GitHub, GitLab, etc.)
5. Search for and select your `ExpenseAI` repository
6. Netlify will auto-fill:
   - **Base directory:** `ExpensesAI`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   
   (These come from `netlify.toml` – no need to change!)

7. Click **"Deploy site"** and wait for the build to complete

### Step 4: Add Firebase Environment Variables on Netlify

1. Go to your Netlify **Site settings**
2. Navigate to **Build & deploy → Environment**
3. Click **"Edit variables"** (or "Add one now")
4. Add each Firebase variable:
   - `VITE_FIREBASE_API_KEY`: `<your-value>`
   - `VITE_FIREBASE_AUTH_DOMAIN`: `<your-value>`
   - `VITE_FIREBASE_PROJECT_ID`: `<your-value>`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `<your-value>`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `<your-value>`
   - `VITE_FIREBASE_APP_ID`: `<your-value>`

5. Click **Save**

### Step 5: Trigger a Deploy

1. Push a new commit (or click **"Deploy site"** in Netlify manually):
   ```bash
   git commit --allow-empty -m "Trigger Netlify deploy"
   git push
   ```

2. Watch the deploy log in Netlify:
   - Build step should complete in ~10 seconds
   - All six Firebase vars should be loaded
   - Console should show: ✅ **Firebase initialized successfully**
   - Deploy step should succeed
   - Site will go live at `https://your-site-name.netlify.app`

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Site loads at your Netlify URL (no 404)
- [ ] Routing works (navigate to different pages, no 404)
- [ ] Open browser DevTools → Console
  - Should show: `✅ Firebase initialized successfully`
  - Should NOT show: `⚠️ Firebase environment variables are missing`
- [ ] Firebase auth features work (login, signup, etc.)

---

## 🔧 Common Issues & Fixes

### Issue: "Page not found" (404) on Netlify

**Cause:** Redirects not working or publish directory wrong.

**Fix:** 
- Verify `netlify.toml` is in repo root
- Verify `publish = "dist"` (not `ExpensesAI/dist`)
- Check that `ExpenseAI/public/_redirects` exists with:
  ```
  /*    /index.html   200
  ```

### Issue: "Firebase environment variables are missing"

**Cause:** Environment variables not set on Netlify.

**Fix:**
- Go to Netlify Site settings → Build & deploy → Environment
- Add all six `VITE_FIREBASE_…` variables
- Trigger a new deploy

### Issue: Build fails with "does not exist"

**Cause:** Path mismatch between base and publish directories.

**Fix:**
- Verify `netlify.toml` has:
  ```toml
  [build]
    base    = "ExpensesAI"
    publish = "dist"
  ```
- NOT `publish = "ExpensesAI/dist"` (would create double path)

---

## 📞 Need Help?

- **Netlify docs:** https://docs.netlify.com
- **Firebase docs:** https://firebase.google.com/docs
- **Vite docs:** https://vitejs.dev

---

## 📝 Project Structure Reference

```
ExpenseAI/                    ← Git repository root
├─ netlify.toml              ← Deployment config (place here!)
├─ .env.local                ← Firebase vars (local only, not committed)
├─ .gitignore                ← Should include .env.local
├─ package.json
└─ ExpensesAI/               ← Vite/React app
   ├─ package.json
   ├─ src/
   ├─ public/
   │  └─ _redirects          ← SPA routing rules
   └─ dist/                  ← Built by Vite, deployed to Netlify
```

---

**You are all set! Good luck deploying!** 🚀

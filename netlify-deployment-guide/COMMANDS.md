# Commands to Deploy on Netlify

## 1. Prepare Local Project

### Test build locally (verify it works before pushing):
```bash
cd "c:\Users\CHAITHANYA\OneDrive\Desktop\Web Dev\ExpenseAI\ExpensesAI"
npm install
npm run build
npm run preview
```
Then open http://localhost:4173 in your browser. It should show your app (not 404).

## 2. Commit & Push to GitHub

From the `ExpenseAI` folder (repository root):

```bash
cd "c:\Users\CHAITHANYA\OneDrive\Desktop\Web Dev\ExpenseAI"

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Add netlify.toml for Netlify deployment"

# Push to GitHub
git push
```

## 3. On Netlify.com Dashboard

1. Go to https://app.netlify.com
2. Click **"Add new site" → "Import an existing project"**
3. Select your Git provider and repository
4. Netlify will auto-detect from `netlify.toml`:
   - Base directory: `ExpensesAI`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **"Deploy site"**

**Wait for build to complete** (should take ~10-15 seconds).

## 4. Add Firebase Environment Variables on Netlify

1. In Netlify dashboard, go to **Site settings → Build & deploy → Environment**
2. Click **"Edit variables"**
3. Add these 6 variables (get values from Firebase Console):

```
VITE_FIREBASE_API_KEY = <your-value>
VITE_FIREBASE_AUTH_DOMAIN = <your-value>
VITE_FIREBASE_PROJECT_ID = <your-value>
VITE_FIREBASE_STORAGE_BUCKET = <your-value>
VITE_FIREBASE_MESSAGING_SENDER_ID = <your-value>
VITE_FIREBASE_APP_ID = <your-value>
```

4. Click **Save**

## 5. Trigger a New Deploy with Environment Variables

From `ExpenseAI` folder:

```bash
cd "c:\Users\CHAITHANYA\OneDrive\Desktop\Web Dev\ExpenseAI"

# Create an empty commit to trigger Netlify rebuild
git commit --allow-empty -m "Trigger Netlify rebuild with Firebase env vars"

# Push to trigger deploy
git push
```

**Or** manually in Netlify: 
- Go to Deploys tab
- Click "Trigger deploy" → "Deploy site"

## 6. Verify Deployment

1. Wait for build to complete in Netlify
2. Open your site URL (shown in Netlify dashboard)
3. Open browser DevTools (F12) → Console tab
4. Should see: ✅ **Firebase initialized successfully**
5. Try logging in to verify Firebase auth works

---

## Helpful Reference

**File Locations:**
```
ExpenseAI/
├─ netlify.toml                    ← Deployment config (copied from guide)
├─ .env.local                      ← Firebase vars (local only, NOT committed)
├─ ExpensesAI/
│  ├─ package.json
│  ├─ src/
│  └─ dist/                        ← Built by npm run build
```

**Key Netlify URLs:**
- Dashboard: https://app.netlify.com
- Site settings: https://app.netlify.com/teams/YOUR-TEAM/sites/YOUR-SITE/settings/general
- Deploy logs: https://app.netlify.com/teams/YOUR-TEAM/sites/YOUR-SITE/deploys
- Environment variables: https://app.netlify.com/teams/YOUR-TEAM/sites/YOUR-SITE/settings/build#environment

---

**If any step fails, check the Netlify deploy log for error messages!**

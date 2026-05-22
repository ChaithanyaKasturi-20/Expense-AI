# Netlify Deployment Quick Checklist

## Before You Deploy

- [ ] GitHub account created
- [ ] Firebase project created and credentials obtained
- [ ] `netlify.toml` is in `ExpenseAI/` repository root
- [ ] `.env.local` created in `ExpenseAI/` with Firebase vars (NOT committed)
- [ ] `.gitignore` includes `.env.local`
- [ ] Local build works: `cd ExpenseAI/ExpensesAI && npm run build && npm run preview`

## On Netlify

- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings auto-filled (base: ExpensesAI, command: npm run build, publish: dist)
- [ ] All six `VITE_FIREBASE_…` environment variables added
- [ ] Initial deploy triggered

## After Deploy

- [ ] Site URL loads without 404
- [ ] Navigation works (no 404 on different pages)
- [ ] Browser console shows: ✅ Firebase initialized successfully
- [ ] Login/authentication works
- [ ] Expenses and savings features work

## Troubleshooting Commands

### Build locally to verify:
```bash
cd "path/to/ExpenseAI/ExpensesAI"
npm install
npm run build
npm run preview
```

Then open http://localhost:4173 and test your app.

### Check if publish directory exists:
```bash
cd "path/to/ExpenseAI/ExpensesAI"
ls dist  # or dir dist (Windows)
```

Should show: index.html, assets/, _redirects, robots.txt, etc.

### Push to trigger Netlify deploy:
```bash
cd "path/to/ExpenseAI"
git add .
git commit -m "Deploy to Netlify"
git push
```

Then check Netlify deploy log for errors.

---

**Quick Reference:**
- Netlify: https://app.netlify.com
- Repo base: ExpenseAI/
- App location: ExpenseAI/ExpensesAI/
- Build output: ExpenseAI/ExpensesAI/dist/
- Netlify config: ExpenseAI/netlify.toml (already created)

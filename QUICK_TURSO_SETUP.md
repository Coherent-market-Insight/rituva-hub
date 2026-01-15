# 🚀 Quick Turso Setup - Step by Step

## Step 1: Create Turso Database (2 minutes)

1. **Open**: https://turso.tech
2. **Sign up** (free account - use GitHub/Google)
3. **Click**: "Create Database"
4. **Name**: `project-hub-production`
5. **Location**: Choose closest to you
6. **Click**: "Create"

## Step 2: Get Credentials (1 minute)

1. **Click** on your database name
2. **Go to**: "Connect" tab
3. **Copy**: Database URL (looks like `libsql://project-hub-production-xxxxx.turso.io`)
4. **Click**: "Create Token" button
5. **Copy**: The auth token (long string)

## Step 3: Run Setup Script

Once you have the credentials, run:

```bash
node scripts/setup-turso.js
```

This will:
- ✅ Generate Prisma client for Turso
- ✅ Push your database schema to Turso
- ✅ Show you what to add to Vercel

## Step 4: Set Vercel Environment Variables

Run:

```bash
node scripts/setup-vercel-env.js
```

Or manually add at:
https://vercel.com/adityas-projects-576d789c/project-hub-main/settings/environment-variables

## Step 5: Redeploy

```bash
vercel --prod
```

## ✅ Done!

Your database is now configured and the app should work without errors!

---

## 🆘 Need Help?

If you get errors:
1. Make sure DATABASE_URL starts with `libsql://`
2. Make sure AUTH_TOKEN is the full token string
3. Check Vercel logs: https://vercel.com/dashboard → Your Project → Deployments



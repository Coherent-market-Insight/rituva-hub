# 🚀 Quick Turso Database Setup for Vercel

## Step 1: Create Turso Database (Free)

1. Go to https://turso.tech and sign up (free account)
2. Click "Create Database"
3. Name it: `project-hub-production`
4. Choose a location (closest to you)
5. Click "Create"

## Step 2: Get Connection Details

After creating the database:

1. Click on your database name
2. Go to "Connect" tab
3. Copy the **Database URL** (looks like: `libsql://project-hub-production-xxxxx.turso.io`)
4. Click "Create Token" and copy the **Auth Token**

## Step 3: Set Environment Variables on Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project: `project-hub-main`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
DATABASE_URL=libsql://your-db-name-xxxxx.turso.io
DATABASE_AUTH_TOKEN=your-auth-token-here
JWT_SECRET=generate-a-random-32-char-string
NEXTAUTH_SECRET=generate-another-random-32-char-string
NEXT_PUBLIC_SITE_URL=https://project-hub-main.vercel.app
NODE_ENV=production
```

### Generate JWT Secrets:

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice to get two different secrets for JWT_SECRET and NEXTAUTH_SECRET.

## Step 4: Update Prisma Schema for Production

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "turso"
  url      = env("DATABASE_URL")
  authToken = env("DATABASE_AUTH_TOKEN")
}
```

## Step 5: Initialize Production Database

Run this locally with your production DATABASE_URL:

```bash
# Set the production database URL temporarily
$env:DATABASE_URL="libsql://your-db-name-xxxxx.turso.io?authToken=your-token"
$env:DATABASE_AUTH_TOKEN="your-token"

# Generate Prisma client
npm run db:generate

# Push schema to Turso
npm run db:push
```

## Step 6: Redeploy on Vercel

After setting environment variables, Vercel will automatically redeploy. Or manually trigger:

```bash
vercel --prod
```

## ✅ Done!

Your database is now configured and the app should work without errors!


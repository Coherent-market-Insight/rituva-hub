# 🚀 Project Hub - SQLite + Turso Setup Guide

**Status**: ✅ App is running on `http://localhost:3001`

Your app is now configured with **SQLite for local development** and **ready for Turso on Vercel**!

## 🎯 Current Setup

✅ **Database**: SQLite (file-based, zero config)  
✅ **Development Server**: Running at http://localhost:3001  
✅ **Environment**: Configured  
✅ **Schema**: Initialized  

---

## 🌐 Access Your App

**Frontend**: http://localhost:3001

> Port 3001 is being used because port 3000 was occupied. If you want to use port 3000, run:
> ```bash
> netstat -ano | findstr :3000
> taskkill /PID <PID> /F
> ```

---

## 📚 Understanding Your Setup

### Local Development (SQLite)

**Database File**: `prisma/dev.db`
- ✅ Zero setup required
- ✅ Perfect for development
- ✅ Auto-created on first run
- ✅ Included in `.gitignore` (don't commit)

**Configuration in `.env.local`**:
```
DATABASE_URL="file:./prisma/dev.db"
```

### Production on Vercel (Turso)

When ready to deploy, you'll use **Turso** (libSQL):
- ✅ Free tier: $9/month for 8 GB storage
- ✅ Serverless-ready for Vercel
- ✅ Drop-in replacement for SQLite
- ✅ Global edge locations

---

## 🔐 Create Your First Account

1. Go to http://localhost:3001
2. Click **"Sign Up"**
3. Enter email and password
4. You're logged in! 🎉

**Test Accounts (after seeding)**:
```
john@example.com / password123
jane@example.com / password123
bob@example.com / password123
```

---

## 📊 View Your Database

Open Prisma Studio to inspect your database:

```bash
npm run db:studio
```

This opens at http://localhost:5555 and shows all your data in real-time.

---

## 🚀 Deploying to Vercel with Turso (Production)

### Step 1: Create Free Turso Account

1. Go to: https://turso.tech
2. Sign up (free tier available)
3. Create organization and database

### Step 2: Create Database

```bash
# Install Turso CLI
npm install -g turso-cli

# Login
turso auth login

# Create database
turso db create project-hub

# Get connection string
turso db show --url project-hub

# Generate auth token
turso db tokens create project-hub
```

### Step 3: Update Prisma Schema for Production

When deploying, switch `prisma/schema.prisma` datasource to:

```prisma
datasource db {
  provider = "turso"
  url      = env("DATABASE_URL")
  authToken = env("DATABASE_AUTH_TOKEN")
}
```

Then regenerate:
```bash
npm run db:generate
```

### Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables:
   ```
   DATABASE_URL=libsql://your-db-name-youruser.turso.io
   DATABASE_AUTH_TOKEN=<your-auth-token-from-turso>
   JWT_SECRET=<your-secret>
   NEXTAUTH_SECRET=<your-secret>
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
5. Deploy!

### Step 5: Initialize Production Database

```bash
# Run migrations on production database
DATABASE_URL="libsql://your-db.turso.io?authToken=<token>" npm run db:push
```

---

## 📝 Available Commands

```bash
# Development
npm run dev                 # Start dev server (hot-reload)
npm run build              # Build for production
npm start                  # Start production server

# Database
npm run db:generate        # Generate Prisma Client
npm run db:push            # Push schema to database
npm run db:migrate         # Create migration
npm run db:studio          # Open database GUI (http://localhost:5555)

# Seeding (optional)
npm run db:seed            # Add sample data
```

---

## 🗄️ Database Schema

Your SQLite database includes:

- **users** - User accounts with roles
- **workspaces** - Workspace organization
- **workspace_members** - Workspace membership with roles
- **projects** - Projects within workspaces
- **project_members** - Project membership with roles
- **boards** - Kanban board columns
- **tasks** - Individual tasks
- **task_comments** - Comments on tasks
- **activity_logs** - Audit trail
- **audit_logs** - Security audit
- **notifications** - User notifications
- **api_keys** - API authentication

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT tokens (30-day expiry)
- ✅ HTTP-only secure cookies
- ✅ Role-based access control (RBAC)
- ✅ Multi-level authorization (System, Workspace, Project)
- ✅ Audit logging for all actions

---

## 💡 Key Differences: SQLite vs Turso

| Feature | SQLite (Local) | Turso (Production) |
|---------|--------|---------|
| Setup | Zero config | Free account |
| File Size | ~ 64 MB limit | 8 GB free |
| Connections | Single | Multiple |
| Replication | No | Yes |
| Backups | Manual | Automatic |
| Cost | Free | $9/month (free tier) |
| Best For | Development | Production |

---

## 🐛 Troubleshooting

### App won't start

```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Regenerate Prisma Client
npm run db:generate

# Restart dev server
npm run dev
```

### Port 3001 already in use

```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database connection issues

```bash
# Check if DATABASE_URL is set
echo $env:DATABASE_URL

# View database file exists
ls prisma/dev.db

# Open Prisma Studio
npm run db:studio
```

### Prisma client out of sync

```bash
npm run db:generate
rm -rf node_modules/.prisma
npm install
```

---

## 📖 Next Steps

1. ✅ App is running at http://localhost:3001
2. Create an account
3. Explore the dashboard
4. Create a project and tasks
5. When ready, follow deployment steps above

---

## 🎯 Architecture Overview

```
Your App (Next.js)
     ↓
  API Routes (Next.js)
     ↓
Prisma ORM
     ↓
SQLite (Dev) / Turso (Prod)
```

---

## 📚 Documentation Files

- `README.md` - Main readme
- `SETUP.md` - Detailed setup
- `DEPLOYMENT.md` - Deployment guide
- `ARCHITECTURE.md` - Architecture details
- `FEATURES.md` - Feature list

---

## 🆘 Need Help?

Check these resources:
- [Prisma Docs](https://www.prisma.io/docs)
- [Turso Docs](https://docs.turso.tech)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Happy coding!** 🚀

Visit http://localhost:3001 to get started.


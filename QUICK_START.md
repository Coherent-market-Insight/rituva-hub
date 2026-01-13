# 🚀 Project Hub - Quick Start Guide

**Your app is running!** 🎉

## Current Status

✅ **Development Server**: Running at http://localhost:3000  
✅ **Environment**: Configured (.env.local created)  
✅ **Dependencies**: Installed  
⏳ **Database**: Needs setup  

## 🗄️ Step 1: Set Up PostgreSQL Database

### Quick Setup (Choose ONE option):

#### Option A: PowerShell Script (Easiest on Windows)

```powershell
cd D:\kanba\project-hub-main
.\setup-db.ps1
```

#### Option B: Batch Script

```cmd
cd D:\kanba\project-hub-main
setup-db.bat
```

#### Option C: Manual Docker Command

Make sure Docker Desktop is running, then:

```bash
docker run --name project_hub_db `
  -e POSTGRES_PASSWORD=projecthub2025 `
  -e POSTGRES_DB=project_hub `
  -p 5432:5432 `
  -d postgres:15-alpine
```

#### Option D: PostgreSQL Installer

1. Download from: https://www.postgresql.org/download/windows/
2. Install with superuser password: `projecthub2025`
3. Create database: `psql -U postgres -c "CREATE DATABASE project_hub;"`

---

## 🎯 Step 2: Initialize Database Schema

Once PostgreSQL is running:

```bash
# Terminal 1: Make sure dev server is still running
npm run dev

# Terminal 2: Initialize database
npm run db:generate
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

---

## 🌐 Step 3: Access Your App

1. **Frontend**: http://localhost:3000
2. **Database Studio**: `npm run db:studio` (then http://localhost:5555)

---

## 🔐 Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. You're logged in! 🎉

---

## 📚 Available Commands

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
npm run db:seed            # Add sample data

# Code Quality
npm run lint               # Run ESLint
```

---

## 🐛 Troubleshooting

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps

# If not running, start it
docker run --name project_hub_db -e POSTGRES_PASSWORD=projecthub2025 -e POSTGRES_DB=project_hub -p 5432:5432 -d postgres:15-alpine
```

### Port 3000 Already in Use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Docker Not Running

Start Docker Desktop:
- Press Windows key
- Type "Docker"
- Click Docker Desktop
- Wait 30 seconds for startup

---

## 🌍 Ready for Vercel Deployment?

Your app is **Vercel-ready**! Follow these steps to deploy for free:

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Set Up Free PostgreSQL

Choose one (all free tier):
- **Railway**: https://railway.app (Recommended)
- **Render**: https://render.com
- **Supabase**: https://supabase.com

Copy the connection string from your chosen provider.

### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   ```
   DATABASE_URL=<from Railway/Render/Supabase>
   DIRECT_URL=<from Railway/Render/Supabase>
   JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   NEXTAUTH_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
5. Click "Deploy"

### 4. Initialize Production Database

```bash
DATABASE_URL="<from Vercel>" npm run db:push
DATABASE_URL="<from Vercel>" npm run db:seed
```

Your app is now live! 🎉

---

## 📁 Project Structure

```
project-hub/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication (signup, login, etc.)
│   │   ├── projects/          # Project management
│   │   └── tasks/             # Task management
│   ├── auth/                   # Auth pages (login, signup)
│   ├── dashboard/              # Main application
│   └── layout.tsx              # Root layout
├── components/ui/              # Reusable UI components
├── lib/
│   ├── auth.ts                # Auth utilities
│   ├── authorization.ts       # Permission checks
│   ├── db.ts                  # Database client
│   └── types.ts               # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── .env.local                 # Environment variables (✅ Already created!)
└── public/                    # Static assets
```

---

## 🎨 Tech Stack

- **Frontend**: React 18, Next.js 13
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (JSON Web Tokens)
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel

---

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT tokens (30-day expiry)
- ✅ HTTP-only secure cookies
- ✅ Role-based access control (RBAC)
- ✅ Audit logging
- ✅ Activity tracking

---

## 📞 Need Help?

Check these files:
- `SETUP.md` - Detailed setup instructions
- `SETUP_LOCALHOST.md` - Local development guide
- `DEPLOYMENT.md` - Production deployment guide
- `ARCHITECTURE.md` - Project architecture
- `FEATURES.md` - Feature documentation

---

## 🚀 You're All Set!

```bash
# 1. Set up database (choose one option above)

# 2. Initialize database
npm run db:generate
npm run db:push

# 3. Dev server is already running!
# Just visit: http://localhost:3000

# 4. Create account and start building!
```

Happy coding! 🎉


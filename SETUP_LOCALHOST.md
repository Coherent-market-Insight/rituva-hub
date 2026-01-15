# Local Setup Guide - Project Hub on Localhost

## Quick Summary

Your project is **ready to go**! Just follow these simple steps to get it running locally.

## ✅ What's Already Done

1. ✅ Created `.env.local` with proper configuration
2. ✅ Installed all dependencies (`npm install`)
3. ✅ Fixed package compatibility issues

## 📦 Next Steps: Set Up PostgreSQL Database

### Option A: Docker (Recommended - Easiest)

If Docker Desktop isn't running, start it first:

```powershell
# Windows - Start Docker Desktop from taskbar
# or from PowerShell:
Start-Process "C:\Program Files\Docker\Docker\Docker.exe"

# Wait 30 seconds for Docker to fully start

# Then run PostgreSQL:
docker run --name project_hub_db `
  -e POSTGRES_PASSWORD=projecthub2025 `
  -e POSTGRES_DB=project_hub `
  -p 5432:5432 `
  -d postgres:15-alpine
```

### Option B: PostgreSQL Installer (Windows)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with these settings:
   - Server port: `5432`
   - Superuser password: `projecthub2025`
   - Keep other settings as default

3. Create the database:
```powershell
psql -U postgres -c "CREATE DATABASE project_hub;"
```

### Option C: Windows Subsystem for Linux (WSL)

```bash
# Inside WSL terminal
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createdb project_hub
```

## 🗄️ Initialize Your Database

Once PostgreSQL is running, run these commands:

```bash
cd D:\kanba\project-hub-main

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data (optional but recommended)
npm run db:seed
```

## 🚀 Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 🔍 Verify Everything Works

### Check Database Connection

```bash
# Open Prisma Studio to view your database
npm run db:studio
```

This opens at http://localhost:5555 and shows all your data.

### Test API Endpoints

```powershell
# Sign up
$response = curl -X POST http://localhost:3000/api/auth/signup `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"password123"}' `
  -UseBasicParsing

# Login
$response = curl -X POST http://localhost:3000/api/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"password123"}' `
  -UseBasicParsing

# Get current user
curl http://localhost:3000/api/auth/me -UseBasicParsing
```

## 📝 Troubleshooting

### Port 5432 Already in Use

```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with the number)
taskkill /PID <PID> /F

# Or use a different port
docker run --name project_hub_db -e POSTGRES_PASSWORD=projecthub2025 -e POSTGRES_DB=project_hub -p 5433:5432 -d postgres:15-alpine
```

Then update your `.env.local`:
```
DATABASE_URL="postgresql://postgres:projecthub2025@localhost:5433/project_hub"
DIRECT_URL="postgresql://postgres:projecthub2025@localhost:5433/project_hub"
```

### Port 3000 Already in Use

```powershell
# Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Database Connection Error

```bash
# Test the connection directly
psql "postgresql://postgres:projecthub2025@localhost:5432/project_hub" -c "SELECT 1;"

# Or with pgAdmin - access at http://localhost:5050
docker run --name pgadmin -e PGADMIN_DEFAULT_EMAIL=admin@example.com -e PGADMIN_DEFAULT_PASSWORD=admin -p 5050:80 -d dpage/pgadmin4
```

## 🌐 Deployment to Vercel (Your Future Plan)

The app is already **Vercel-ready**! When you're ready to deploy:

### Steps:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   ```
   DATABASE_URL=<from Railway/Render>
   DIRECT_URL=<from Railway/Render>
   JWT_SECRET=<your secret>
   NEXTAUTH_SECRET=<your secret>
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
4. Deploy!

### Free PostgreSQL Options for Production:
- **Railway** (Recommended): https://railway.app - 5GB free, $5/month after
- **Render**: https://render.com - Generous free tier
- **Supabase**: https://supabase.com - 500MB free PostgreSQL

## 📚 Project Structure

```
project-hub/
├── app/
│   ├── api/              # Backend API routes
│   ├── auth/             # Login/Signup pages
│   ├── dashboard/        # Main app pages
│   └── layout.tsx        # Root layout
├── components/ui/        # Reusable UI components
├── lib/
│   ├── auth.ts          # Authentication logic
│   ├── db.ts            # Database client
│   └── authorization.ts # Permission checks
├── prisma/
│   └── schema.prisma    # Database schema
└── .env.local           # Environment variables (create this!)
```

## 🔐 Security Notes

- ✅ JWT tokens expire in 30 days
- ✅ Passwords hashed with bcryptjs
- ✅ HTTP-only cookies for secure token storage
- ✅ Authorization checks on all API endpoints

## 🎯 Key Features

- User authentication (signup/login)
- Create and manage projects
- Kanban board with tasks
- Team collaboration
- Role-based access control
- Activity logging
- Database audit trail

## 💡 Tips

1. **Development**: Use `npm run dev` for hot-reload
2. **Database Inspection**: Use `npm run db:studio`
3. **Database Changes**: Use `npm run db:migrate` for schema changes
4. **Type Safety**: Check types with `npm run build`

---

**You're all set!** Follow Option A, B, or C above to set up PostgreSQL, then run:

```bash
npm run db:push
npm run dev
```

Visit **http://localhost:3000** and start building! 🚀



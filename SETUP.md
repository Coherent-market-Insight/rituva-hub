# Project Hub - Setup Guide

This guide will help you set up Project Hub locally for development.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- PostgreSQL 12+ or use Docker
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/project-hub.git
cd project-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/project_hub"
DIRECT_URL="postgresql://postgres:password@localhost:5432/project_hub"

# Authentication
JWT_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Set Up PostgreSQL Database

#### Option A: Using Docker (Easiest)

```bash
# Run PostgreSQL in Docker
docker run --name project_hub_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=project_hub \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Local PostgreSQL Installation

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql
createdb project_hub

# Ubuntu/Debian
sudo apt-get install postgresql
sudo -u postgres createdb project_hub

# Windows
# Download from https://www.postgresql.org/download/windows/
# Use pgAdmin to create database
```

### 5. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Seed sample data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflows

### Viewing Database Changes

```bash
# Open Prisma Studio
npm run db:studio
```

### Running Database Migrations

```bash
# Create a migration
npm run db:migrate

# Follow prompts to name your migration
```

### Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Project Structure

```
project-hub/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── projects/           # Project endpoints
│   │   └── tasks/              # Task endpoints
│   ├── auth/                    # Auth pages (login, signup)
│   ├── dashboard/               # Dashboard pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/
│   └── ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── ...
│
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   ├── authorization.ts        # Authorization checks
│   ├── db.ts                   # Database client
│   ├── api-response.ts         # API response helpers
│   ├── utils.ts                # Utility functions
│   └── types.ts                # TypeScript types
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── public/                      # Static assets
└── package.json                 # Dependencies
```

## Key Technologies

- **Next.js 13** - React framework with server components
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Tailwind CSS** - Utility-first CSS
- **TypeScript** - Type safety
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Authentication System

### Flow
1. User signs up/logs in
2. Password is hashed with bcryptjs
3. JWT token is generated with 30-day expiry
4. Token stored in secure HTTP-only cookie
5. All API requests validated with token

### Key Files
- `lib/auth.ts` - Token generation and verification
- `app/api/auth/*` - Auth endpoints
- `app/auth/*` - Auth pages

## Authorization Model

### Levels

1. **System Level** (User Role)
   - `super_admin`: Full system access
   - `user`: Regular user

2. **Workspace Level**
   - `owner`: Can manage workspace and members
   - `admin`: Can manage settings and members
   - `member`: Can access projects

3. **Project Level**
   - `owner`: Full project control, can delete
   - `lead`: Can manage team and settings
   - `manager`: Can manage tasks and assignments
   - `member`: Can view and work on tasks

### Authorization Checks
See `lib/authorization.ts` for permission functions:
- `canUserAccessProject()` - Check project access
- `canUserEditProject()` - Check edit permissions
- `canUserManageProjectMembers()` - Check team management
- `canUserDeleteProject()` - Check deletion rights
- `getUserProjectRole()` - Get user's project role

## API Routes

### Authentication
```
POST   /api/auth/signup       # Create account
POST   /api/auth/login        # Login
POST   /api/auth/logout       # Logout
GET    /api/auth/me           # Get current user
```

### Projects
```
GET    /api/projects          # List user's projects
POST   /api/projects          # Create project
GET    /api/projects/[id]     # Get project details
PUT    /api/projects/[id]     # Update project
DELETE /api/projects/[id]     # Delete project
```

### Project Members
```
GET    /api/projects/[id]/members      # List members
POST   /api/projects/[id]/members      # Add member
PUT    /api/projects/[id]/members/[mid] # Update role
DELETE /api/projects/[id]/members/[mid] # Remove member
```

### Tasks
```
GET    /api/projects/[id]/tasks     # List tasks by board
POST   /api/projects/[id]/tasks     # Create task
PUT    /api/tasks/[id]              # Update task
DELETE /api/tasks/[id]              # Delete task
```

## Common Development Tasks

### Add a New API Route

1. Create file: `app/api/your-route/route.ts`
2. Implement GET/POST/PUT/DELETE handlers
3. Use helpers from `lib/api-response.ts`
4. Add authorization checks

Example:
```typescript
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  // Your logic here
  return successResponse({ data: 'example' });
}
```

### Add a New Component

1. Create file: `components/your-component.tsx`
2. Use Radix UI components for consistency
3. Style with Tailwind CSS
4. Add TypeScript types

### Add Database Model

1. Update `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Follow naming conventions (table names plural, snake_case)

## Testing

### Test Authentication

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Current User
curl http://localhost:3000/api/auth/me
```

### Test Project Creation

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Test project"}'
```

## Debugging

### Enable Debug Logs

```bash
# In your .env.local
DEBUG=prisma:*
```

### Use Prisma Studio

```bash
npm run db:studio
```

Then visit `http://localhost:5555` to inspect database.

### Check Build Errors

```bash
npm run build
```

### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

## Performance Tips

- Use `npm run build` to check production bundle size
- Enable SWC minification in `next.config.js`
- Use image optimization with `next/image`
- Implement code splitting for routes
- Use React Server Components where possible

## Common Issues

### Port 3000 Already in Use

```bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma Client
npm run db:generate
```

## Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Check out example API routes in `app/api/`
- Explore UI components in `components/ui/`
- Read [Prisma Docs](https://www.prisma.io/docs) for ORM usage
- Join our [Discord Community](https://discord.gg/project-hub)

## Support

- 📖 [Documentation](https://docs.project-hub.dev)
- 🐛 [Report Issues](https://github.com/yourusername/project-hub/issues)
- 💬 [Discussions](https://github.com/yourusername/project-hub/discussions)
- 💡 [Feature Requests](https://github.com/yourusername/project-hub/discussions/new)

## License

MIT License - see [LICENSE](LICENSE)


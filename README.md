# Project Hub - Advanced Project Management Tool

> **🚀 Getting Started?** See [QUICK_START.md](QUICK_START.md) for the fastest setup on your local machine!

A modern, open-source project management platform with multi-level authorization, team collaboration, and free deployment options.

## Features

✨ **Core Features:**
- **Multi-level Authorization & Authentication**
  - System Admin (super_admin)
  - Workspace-level roles (owner, admin, member)
  - Project-level roles (owner, lead, manager, member)
- **Workspace Management** - Organize multiple projects in workspaces
- **Project Management** - Create and manage projects with full customization
- **Kanban Boards** - Drag-and-drop task management with multiple boards
- **Task Management** - Create, assign, and track tasks with priorities and due dates
- **Team Collaboration** - Add team members with role-based permissions
- **Activity Logging** - Audit trail for all actions
- **Notifications** - Real-time updates for team activities
- **API Keys** - Integration support with API authentication

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with secure cookies
- **Deployment**: Vercel, Railway, Render (all free tiers supported)

## Quick Start

### Prerequisites
- Node.js 18+ (or use free tiers on Vercel)
- PostgreSQL database (free options: Railway, Render, Supabase)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/project-hub.git
cd project-hub
npm install
```

2. **Set up environment variables**
```bash
cp env.example .env.local
```

Edit `.env.local` with your database credentials:
```
DATABASE_URL="postgresql://user:password@host:port/project_hub"
DIRECT_URL="postgresql://user:password@host:port/project_hub"
JWT_SECRET="your-secret-key-change-this"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. **Initialize the database**
```bash
npm run db:push
npm run db:seed  # Optional: adds sample data
```

4. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Free Deployment Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Create a Vercel account at [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Option 2: Railway
1. Free $5 monthly credits (includes PostgreSQL)
2. Connect GitHub repository
3. Add database and environment variables
4. Auto-deploy on push

### Option 3: Render
1. Free tier with 0.5GB RAM
2. Connect GitHub repository
3. Set up PostgreSQL database (free tier available)
4. Deploy from `package.json`

## Project Structure

```
project-hub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/
│   ├── auth.ts          # Authentication utilities
│   ├── authorization.ts # Authorization checks
│   ├── db.ts            # Database client
│   └── utils.ts         # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Authorization Model

### User Roles (System Level)
- **super_admin**: Full system access
- **user**: Regular user

### Workspace Roles
- **owner**: Can manage workspace, invite members, delete workspace
- **admin**: Can manage members and settings
- **member**: Can access projects and collaborate

### Project Roles
- **owner**: Can delete project, manage all members and settings
- **lead**: Can manage team members, edit project details
- **manager**: Can edit tasks, manage task assignments
- **member**: Can view and work on assigned tasks

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Teams
- `GET /api/projects/[id]/members` - List project members
- `POST /api/projects/[id]/members` - Add member to project
- `PUT /api/projects/[id]/members/[memberId]` - Update member role
- `DELETE /api/projects/[id]/members/[memberId]` - Remove member

### Tasks
- `GET /api/projects/[id]/tasks` - List project tasks
- `POST /api/projects/[id]/tasks` - Create task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

## Database Schema

### Core Tables
- **users** - System users
- **workspaces** - Workspace organization
- **workspace_members** - Workspace membership with roles
- **projects** - Projects
- **project_members** - Project membership with roles
- **boards** - Task boards/columns
- **tasks** - Individual tasks
- **task_comments** - Task comments
- **activity_logs** - Action audit trail
- **audit_logs** - Security audit trail
- **notifications** - User notifications
- **api_keys** - API authentication

## Security Features

- ✅ JWT-based authentication with secure cookies
- ✅ Role-based access control (RBAC)
- ✅ Audit logging for all sensitive actions
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CSRF protection
- ✅ Secure password hashing with bcryptjs
- ✅ HTTP-only cookies
- ✅ Multi-level authorization checks

## Development

### Database Commands
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed sample data
```

### Scripts
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📖 [Documentation](https://docs.project-hub.dev)
- 💬 [Discord Community](https://discord.gg/project-hub)
- 🐛 [Report Issues](https://github.com/yourusername/project-hub/issues)
- 💡 [Feature Requests](https://github.com/yourusername/project-hub/discussions)

## Roadmap

- [ ] Real-time collaboration with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Time tracking
- [ ] File attachments for tasks
- [ ] Custom workflows
- [ ] Mobile app
- [ ] Integrations (Slack, GitHub, etc.)
- [ ] Email notifications

## Acknowledgments

Inspired by modern project management tools, built with ❤️ for the community.


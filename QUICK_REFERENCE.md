# Quick Reference Guide

## 📍 Project Location
`D:\kanba\project-hub-main\`

## ⚡ Most Important Files

### Configuration
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template
- `tsconfig.json` - TypeScript settings
- `tailwind.config.ts` - Tailwind CSS setup

### Database
- `prisma/schema.prisma` - Database schema
- `scripts/seed.js` - Sample data

### Authentication
- `app/api/auth/signup/route.ts` - Register
- `app/api/auth/login/route.ts` - Login
- `lib/auth.ts` - Token management
- `lib/authorization.ts` - Permission checks

### Pages
- `app/page.tsx` - Landing page
- `app/auth/login/page.tsx` - Login page
- `app/auth/signup/page.tsx` - Signup page
- `app/dashboard/page.tsx` - Dashboard

### API Routes
- `app/api/projects/route.ts` - Projects CRUD
- `app/api/projects/[id]/members/route.ts` - Team management
- `app/api/projects/[id]/tasks/route.ts` - Tasks CRUD
- `app/api/tasks/[id]/route.ts` - Individual task

## 🔧 Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to DB
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed sample data

# Production
npm run build          # Build for production
npm start              # Start production server

# Tools
npm run lint           # Run ESLint
```

## 🗄️ Database Tables

- `users` - User accounts
- `workspaces` - Workspace organization
- `workspace_members` - Workspace membership
- `projects` - Projects
- `project_members` - Project team members
- `boards` - Task boards/columns
- `tasks` - Individual tasks
- `task_comments` - Task comments
- `activity_logs` - Action audit trail
- `audit_logs` - Security audit
- `notifications` - User notifications
- `api_keys` - API authentication

## 👥 User Roles

### System Level
- `super_admin` - Full access
- `user` - Regular user

### Workspace Level
- `owner` - Can delete workspace
- `admin` - Can manage members
- `member` - Can access projects

### Project Level
- `owner` - Can delete project
- `lead` - Can manage team
- `manager` - Can manage tasks
- `member` - Can work on tasks

## 🔑 Authorization Functions

```typescript
// In lib/authorization.ts
canUserAccessProject(userId, projectId)
canUserEditProject(userId, projectId)
canUserManageProjectMembers(userId, projectId)
canUserDeleteProject(userId, projectId)
canUserAccessWorkspace(userId, workspaceId)
canUserManageWorkspace(userId, workspaceId)
canUserViewTask(userId, taskId)
canUserEditTask(userId, taskId)
getUserProjectRole(userId, projectId)
getUserWorkspaceRole(userId, workspaceId)
```

## 📦 Tech Stack Quick Reference

- **Frontend**: Next.js 13, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + HTTP-only cookies
- **Styling**: Tailwind CSS + Radix UI
- **Icons**: Lucide React

## 🔗 API Response Format

```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Optional message"
}
```

## 📖 Documentation Files

- `README.md` - Start here
- `SETUP.md` - Local development
- `DEPLOYMENT.md` - Free deployment guide
- `FEATURES.md` - Feature list
- `ARCHITECTURE.md` - Technical details
- `CONTRIBUTING.md` - Contribution guidelines
- `PROJECT_SUMMARY.md` - Complete overview

## 🚀 Quick Deployment

### Vercel + Railway
1. Push to GitHub
2. Deploy frontend to Vercel
3. Database to Railway
4. Set env variables
5. Done!

### Render
1. New PostgreSQL database
2. New Web Service
3. Connect GitHub
4. Set env variables
5. Deploy!

## 💾 Environment Variables

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=random-32-char-string
NEXTAUTH_SECRET=random-32-char-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

## 🧪 Test Users (from seed)

```
Email: john@example.com
Password: password123
Role: Owner

Email: jane@example.com
Password: password123
Role: Admin

Email: bob@example.com
Password: password123
Role: Member
```

## 🐛 Debugging

```bash
# View database
npm run db:studio

# Check build
npm run build

# Clear cache
rm -rf .next

# Test API
curl http://localhost:3000/api/auth/me
```

## 📁 File Organization

```
app/                  → Pages and routes
├── api/              → API endpoints
├── auth/             → Auth pages
├── dashboard/        → Dashboard pages
components/           → Reusable components
lib/                  → Utilities
├── auth.ts           → Token & cookies
├── authorization.ts  → Permission checks
├── db.ts             → Database client
└── utils.ts          → Helpers
prisma/               → Database
scripts/              → Helper scripts
```

## 🔐 Security Tips

- Keep `JWT_SECRET` secure (use 32+ chars)
- Enable HTTPS in production
- Setup CORS properly
- Use environment variables
- Regular database backups
- Update dependencies
- Use secure cookies (done by default)

## 🚫 Common Mistakes to Avoid

❌ Don't commit `.env.local`
❌ Don't use weak secrets
❌ Don't skip authorization checks
❌ Don't deploy with debug logs
❌ Don't use hardcoded credentials
✅ Do read the documentation
✅ Do test authorization thoroughly
✅ Do backup your database
✅ Do update dependencies regularly
✅ Do monitor your deployment

## 🆘 Getting Help

1. Read **SETUP.md** for setup issues
2. Read **DEPLOYMENT.md** for deployment issues
3. Check **FEATURES.md** for feature details
4. Review **ARCHITECTURE.md** for technical questions
5. Check documentation links in README.md

## 📈 Next Steps After Setup

1. ✅ Get it running locally
2. ✅ Explore the codebase
3. ✅ Test the APIs
4. ✅ Deploy to free platform
5. ✅ Customize for your needs
6. ✅ Add new features
7. ✅ Invite team members
8. ✅ Scale as you grow

## 🎯 Project Milestones

- [x] Authentication system
- [x] Authorization system
- [x] API endpoints
- [x] Dashboard UI
- [x] Database schema
- [x] Documentation
- [x] Deployment guides
- [ ] Drag-and-drop Kanban
- [ ] Email notifications
- [ ] Real-time features

## 💡 Quick Tips

1. Use Prisma Studio to inspect database: `npm run db:studio`
2. Check API response format in `lib/api-response.ts`
3. Follow authorization check examples when adding features
4. Use existing components from `components/ui/`
5. Test API endpoints with curl or Postman

## 🔄 Development Workflow

1. Make changes to code
2. Browser auto-refreshes (Next.js)
3. Check database with Prisma Studio
4. Test APIs with curl/Postman
5. Commit changes to git
6. Push to GitHub
7. Auto-deploys to Vercel (after setup)

---

**Start with**: `npm run dev` and visit `http://localhost:3000`

**Deploy with**: Follow `DEPLOYMENT.md`

**Learn more**: Read the documentation files!


# Project Hub Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  - Next.js 13 Client Components                             │
│  - React 18 with Hooks                                      │
│  - Tailwind CSS + Radix UI                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js App Router (Server)                    │
│  - App Directory with Server Components                    │
│  - API Routes (Backend)                                    │
│  - Authentication Middleware                              │
│  - Authorization Checks                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌────▼──────────┐
│ Auth Service │  │  API Handlers   │  │ Utilities     │
│              │  │                 │  │               │
│ - JWT Tokens │  │ - Projects      │  │ - Helpers     │
│ - Cookies    │  │ - Tasks         │  │ - Types       │
│ - Sessions   │  │ - Members       │  │ - Constants   │
└──────┬───────┘  │ - Auth          │  └───────────────┘
       │          └────────┬────────┘
       │                   │
       └───────────┬───────┘
                   │
        ┌──────────▼──────────┐
        │ Prisma ORM Client    │
        │ - Schema Validation  │
        │ - Query Builder      │
        │ - Type Safety        │
        └──────────┬───────────┘
                   │
        ┌──────────▼──────────┐
        │  PostgreSQL Database │
        │  - Users             │
        │  - Workspaces        │
        │  - Projects          │
        │  - Tasks & Boards    │
        │  - Activity Logs     │
        │  - Notifications     │
        └─────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 13.5.1
  - App Router for file-based routing
  - Server and Client Components
  - API Routes for backend
- **UI Library**: React 18.2.0
  - Functional components with hooks
  - Context API for state
  - Form handling with react-hook-form
- **Styling**: Tailwind CSS 3.3.3
  - Utility-first CSS
  - Dark mode support
  - Responsive design
- **UI Components**: Radix UI
  - Accessible component primitives
  - Unstyled, fully customizable
  - TypeScript support
- **Icons**: Lucide React
  - Modern, consistent icons
  - SVG-based

### Backend
- **Runtime**: Node.js 18+
- **Server**: Next.js API Routes
  - RESTful endpoints
  - Request/response handling
  - Middleware support
- **Authentication**: JWT
  - 30-day tokens
  - Secure HTTP-only cookies
  - Token verification
- **Password Hashing**: bcryptjs
  - Secure password storage
  - Salt rounds: 10

### Database
- **DBMS**: PostgreSQL 12+
  - ACID compliance
  - Reliable backups
  - Free tier available
- **ORM**: Prisma 5.7.1
  - Type-safe database access
  - Automated migrations
  - Query builder
  - Admin UI (Prisma Studio)

### Development Tools
- **Language**: TypeScript 5.2.2
  - Full type safety
  - Better IDE support
  - Compile-time error checking
- **Bundler**: SWC (via Next.js)
  - Fast compilation
  - Rust-based
- **Linter**: ESLint 8.49.0
  - Code quality
  - Style consistency
- **Package Manager**: npm/yarn
  - Dependency management

## Directory Structure

```
project-hub/
├── app/                          # Next.js App Directory
│   ├── api/                      # API Routes
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── projects/            # Project endpoints
│   │   │   ├── route.ts         # GET all, POST create
│   │   │   ├── [id]/
│   │   │   │   ├── members/route.ts
│   │   │   │   └── tasks/route.ts
│   │   └── tasks/               # Task endpoints
│   │       └── [id]/route.ts    # PUT, DELETE
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/               # Main dashboard
│   │   ├── page.tsx
│   │   └── projects/            # Project pages
│   │       └── [id]/page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
│
├── components/                  # Reusable Components
│   └── ui/                     # Radix UI based
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── ... (other UI)
│
├── lib/                        # Utilities & Helpers
│   ├── auth.ts                # JWT + Cookie handling
│   ├── authorization.ts       # Permission checks
│   ├── db.ts                  # Prisma client
│   ├── api-response.ts        # API response helpers
│   ├── utils.ts               # Utility functions
│   └── types.ts               # TypeScript types
│
├── prisma/                    # Database
│   └── schema.prisma          # Database schema
│
├── public/                    # Static assets
│   └── ... (images, icons)
│
├── scripts/                   # Helper scripts
│   └── seed.js               # Database seeding
│
├── .gitignore                # Git ignore rules
├── .env.example              # Environment template
├── env.example               # Environment template
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── postcss.config.js         # PostCSS config
├── next.config.js            # Next.js config
├── package.json              # Dependencies
├── README.md                 # Main documentation
├── SETUP.md                  # Setup guide
├── DEPLOYMENT.md             # Deployment guide
├── FEATURES.md               # Features list
├── CONTRIBUTING.md           # Contributing guide
├── LICENSE                   # MIT License
└── ARCHITECTURE.md           # This file
```

## Data Flow

### Authentication Flow
```
User enters credentials
        ↓
POST /api/auth/login
        ↓
Validate email & password
        ↓
Hash password with bcryptjs
        ↓
Compare with stored hash
        ↓
Generate JWT token (30 day expiry)
        ↓
Set secure HTTP-only cookie
        ↓
Return user data + token
        ↓
Client stores token
```

### Authorization Flow
```
User requests protected resource
        ↓
Extract token from cookie
        ↓
Verify JWT signature
        ↓
Get user ID from token
        ↓
Check permission in database
        ↓
Can access? → YES → Process request
            → NO → Return 403 Forbidden
```

### Task Creation Flow
```
User submits form
        ↓
Client validates input
        ↓
POST /api/projects/[id]/tasks
        ↓
Extract user from JWT
        ↓
Check user can edit project
        ↓
Create task in database
        ↓
Log activity
        ↓
Return task data
        ↓
Update UI
```

## API Endpoint Architecture

### Request/Response Format
```typescript
// Request
POST /api/projects
{
  "name": "My Project",
  "description": "Description",
  "workspace_id": "workspace-id"
}

// Response (Success)
{
  "success": true,
  "data": { /* project data */ },
  "message": "Project created successfully"
}

// Response (Error)
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes
- `200` - OK / Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Database Schema

### Core Relations
```
User
├── WorkspaceMember (many-to-many via join table)
├── ProjectMember (many-to-many via join table)
├── Project (owns)
├── Task (creates/assigns)
├── TaskComment (writes)
├── ActivityLog (performs)
├── Notification (receives)
└── ApiKey (owns)

Workspace
├── WorkspaceMember (many-to-many)
├── Project (contains)
└── ActivityLog (tracks)

Project
├── Workspace (belongs to)
├── User (owned by)
├── ProjectMember (many-to-many)
├── Board (contains)
└── ActivityLog (tracks)

Board
├── Project (belongs to)
└── Task (contains)

Task
├── Board (belongs to)
├── User (assigned to)
├── TaskComment (has many)
└── ActivityLog (tracks)

TaskComment
├── Task (belongs to)
└── User (written by)

ActivityLog
├── Workspace (tracks)
├── Project (tracks)
└── User (performed by)

Notification
└── User (belongs to)
```

## Security Architecture

### Authentication
- JWT tokens with 30-day expiry
- Secure HTTP-only cookies
- Password hashing with bcryptjs (10 salt rounds)
- Token stored server-side in cookie

### Authorization
- Role-based access control (RBAC)
- Three-level authorization:
  1. System level (super_admin, user)
  2. Workspace level (owner, admin, member)
  3. Project level (owner, lead, manager, member)
- Permission checks before every action
- Database-level validation

### Data Protection
- SQL injection prevention (Prisma ORM)
- CSRF protection ready
- CORS configuration
- Input validation with Zod (extensible)
- Secure headers (extensible)

### Audit Trail
- Activity logging for all actions
- Audit logging for sensitive operations
- User tracking (IP, user agent ready)
- Timestamp tracking for all changes

## Performance Optimization

### Frontend
- Server-side rendering (SSR) with Next.js
- Static generation where possible
- Code splitting per route
- Image optimization
- Caching strategies

### Backend
- Prisma caching and query optimization
- Database indexing on foreign keys
- Connection pooling ready
- API response compression
- Request deduplication ready

### Database
- Indexes on primary keys and foreign keys
- Connection pooling support
- Query optimization
- Backup and recovery ready

## Scalability

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Session management via database
- Cache layer ready (Redis)

### Vertical Scaling
- Efficient database queries
- Optimized bundling
- Memory management
- Resource monitoring ready

### Deployment
- Containerization ready (Docker)
- Environment-based configuration
- Health checks ready
- Logging and monitoring ready

## Extension Points

### Easy to Extend
1. **New API Endpoints** - Add routes in `app/api/`
2. **New Models** - Add to Prisma schema
3. **New UI Components** - Add to `components/`
4. **New Authorization Checks** - Add to `lib/authorization.ts`
5. **New Utilities** - Add to `lib/`

### Integration Ready
1. **Email Service** - SendGrid, Resend, AWS SES
2. **Storage** - S3, Cloudinary, Local storage
3. **Analytics** - Vercel Analytics, Mixpanel, Google Analytics
4. **Webhooks** - Slack, GitHub, Custom integrations
5. **Authentication** - OAuth2, SAML, Two-factor

## Testing Strategy

### Recommended Testing Tools
- **Unit Tests** - Jest, Vitest
- **Integration Tests** - Supertest (for API routes)
- **End-to-End Tests** - Playwright, Cypress
- **Database Tests** - Prisma testing utilities

### Testing Areas
1. Authentication endpoints
2. Authorization checks
3. CRUD operations
4. Permission validation
5. Error handling

## Deployment Considerations

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry optional)
- [ ] Monitoring/alerting set up
- [ ] Regular database maintenance scheduled
- [ ] Logging configured
- [ ] Secrets management in place

### Deployment Platforms
- Vercel (Next.js hosting)
- Railway (Database hosting)
- Render (Full-stack)
- Docker (Custom deployment)

## Monitoring & Maintenance

### Key Metrics
- Page load time
- API response time
- Database query time
- Error rate
- User activity

### Maintenance Tasks
- Regular database backups
- Log rotation
- Security patches
- Dependency updates
- Performance optimization

## Future Architecture Improvements

1. **Real-time Features** - WebSockets for live updates
2. **Caching Layer** - Redis for session/data caching
3. **Message Queue** - Background jobs with Bull/Agenda
4. **Microservices** - Service decomposition if needed
5. **Search** - Elasticsearch for full-text search
6. **CDN** - Content delivery network for static assets
7. **File Storage** - Object storage integration
8. **Analytics** - Event tracking and analytics engine

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


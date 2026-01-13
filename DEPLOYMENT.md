# Deployment Guide - Project Hub

This guide covers deploying Project Hub to free platforms. All options require minimal to zero cost.

## Prerequisites

- GitHub account (for version control)
- Node.js 18+ installed locally
- PostgreSQL database (we'll show free options)

## Option 1: Vercel + Railway (Recommended)

### Step 1: Set up Railway PostgreSQL

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project
4. Add PostgreSQL database
5. Go to project settings and copy:
   - `DATABASE_URL`
   - `DIRECT_URL`

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   ```
   DATABASE_URL=<from Railway>
   DIRECT_URL=<from Railway>
   JWT_SECRET=<generate random string>
   NEXTAUTH_SECRET=<generate random string>
   NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
   ```
5. Deploy!

### Step 3: Initialize Database

```bash
# Run once after deployment
npm run db:push
npm run db:seed  # Optional: add sample data
```

## Option 2: Render.com (Single Platform)

### Step 1: Create PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create new PostgreSQL database
4. Choose Free tier
5. Save connection details

### Step 2: Deploy Web Service

1. New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     DATABASE_URL=<from PostgreSQL>
     DIRECT_URL=<from PostgreSQL>
     JWT_SECRET=<random string>
     NEXTAUTH_SECRET=<random string>
     NEXT_PUBLIC_SITE_URL=https://your-service.onrender.com
     NODE_ENV=production
     ```
4. Deploy!

## Option 3: Heroku Alternative (Komodo)

Since Heroku's free tier ended, use [komodo.dev](https://komodo.dev) or similar alternatives.

## Environment Variables

Create `.env.local` for development:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/project_hub"
DIRECT_URL="postgresql://user:password@localhost:5432/project_hub"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars-recommended"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Email Service
# SENDGRID_API_KEY=your_key
# RESEND_API_KEY=your_key
```

### Generate Secure Secrets

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Max 256)}))

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Initialization

### Local Development

```bash
# Create local PostgreSQL database
createdb project_hub

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### Production Database

After deployment, initialize the database once:

```bash
# Option 1: Local script with production DATABASE_URL
DATABASE_URL="prod-url" npm run db:push

# Option 2: SSH into server and run
npm run db:push
npm run db:seed
```

## Production Checklist

- [ ] Set strong `JWT_SECRET` and `NEXTAUTH_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure correct `NEXT_PUBLIC_SITE_URL`
- [ ] Database backups enabled
- [ ] SSL/HTTPS enforced
- [ ] Email notifications configured (optional)
- [ ] Monitoring/alerting set up
- [ ] Rate limiting configured
- [ ] CORS policies set appropriately

## Monitoring & Maintenance

### Vercel
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- View logs: Select project → Deployments
- Analytics: View project analytics

### Railway
- Dashboard: [railway.app/dashboard](https://railway.app/dashboard)
- Logs: Click on service → Logs tab
- Monitor: View resource usage and metrics

### Render
- Dashboard: [dashboard.render.com](https://dashboard.render.com)
- Logs: Select service → Logs tab
- Monitor: Service health metrics

## Backup & Recovery

### PostgreSQL Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Railway: Automatic daily backups (retention based on plan)
- Render: Manual backup feature available
- Supabase: Automatic backups with point-in-time recovery

## Custom Domain

### Vercel
1. Domain settings → Add domain
2. Configure DNS records
3. SSL auto-renewal

### Railway
1. Project settings → Domains
2. Add custom domain
3. Configure DNS

### Render
1. Environment settings → Custom Domain
2. Add domain
3. Update DNS records

## Scaling

All platforms offer automatic scaling. When free tier limits are reached:

- **Vercel**: Scale automatically based on traffic
- **Railway**: Upgrade plan to increase monthly credit limit
- **Render**: Upgrade to paid tier for unlimited resources

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check credentials
echo $DATABASE_URL

# Verify network access
# Ensure IP allowlisting is configured on database service
```

### Build Failures

```bash
# Clear build cache (Vercel)
# Rerun from Deployments tab

# Check logs
npm run build  # Local test

# Verify all dependencies
npm install
```

### Authentication Issues

- Clear browser cookies
- Regenerate JWT secrets if compromised
- Check cookie settings in `lib/auth.ts`
- Verify `NEXT_PUBLIC_SITE_URL` matches domain

## Performance Optimization

### CDN Caching
- Vercel: Automatic with Edge Functions
- Render: CloudFlare integration
- Railway: Configure cache headers

### Database Optimization
```bash
# Create indexes for common queries
# Add connection pooling for higher traffic

# Monitor slow queries
npm run db:studio  # Use Prisma Studio
```

### Image Optimization
- Use `next/image` for all images
- Enable WebP format
- Implement lazy loading

## Support & Resources

- [Project Hub GitHub](https://github.com/yourusername/project-hub)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

## FAQ

**Q: Can I use this on AWS free tier?**
A: Yes, but setup is more complex. EC2 + RDS free tier can work.

**Q: What's included in the free tier?**
A: Database storage, basic compute, bandwidth. Email services not included.

**Q: How do I upgrade without downtime?**
A: Use blue-green deployments or database replicas.

**Q: Is my data secure?**
A: Yes - all connections use SSL/TLS, data encrypted at rest.


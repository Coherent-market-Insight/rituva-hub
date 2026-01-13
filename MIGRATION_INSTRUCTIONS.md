# Migration Instructions

## Fix: Add user_role and team columns

The Prisma client needs to be regenerated to recognize the new `user_role` and `team` fields.

### Steps:

1. **Stop your Next.js dev server** (if running)
   - Press `Ctrl+C` in the terminal where the server is running

2. **Create/Update .env file** (if you don't have one)
   - Copy `env.example` to `.env`
   - Make sure it has: `DATABASE_URL="file:./prisma/prisma/dev.db"`

3. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Add columns to database** (run this SQL using any SQLite tool, or use Prisma Studio)
   
   Option A: Using Prisma Studio (recommended)
   ```bash
   npx prisma studio
   ```
   Then go to the SQL Editor and run:
   ```sql
   ALTER TABLE users ADD COLUMN user_role TEXT;
   ALTER TABLE users ADD COLUMN team TEXT;
   ```

   Option B: Using command line (if you have sqlite3 installed)
   ```bash
   sqlite3 prisma/prisma/dev.db "ALTER TABLE users ADD COLUMN user_role TEXT;"
   sqlite3 prisma/prisma/dev.db "ALTER TABLE users ADD COLUMN team TEXT;"
   ```

5. **Restart your dev server**
   ```bash
   npm run dev
   ```

### Alternative: If columns already exist

If you get an error saying columns already exist, just regenerate the Prisma client:
```bash
npx prisma generate
```

Then restart your dev server.


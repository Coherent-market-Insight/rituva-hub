const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  // Try different possible paths
  const possiblePaths = [
    'file:./prisma/prisma/dev.db',
    'file:./prisma/dev.db',
    'file:./dev.db'
  ];
  
  // Check which path exists
  const fs = require('fs');
  for (const dbPath of possiblePaths) {
    const filePath = dbPath.replace('file:', '').replace(/^\.\//, '');
    if (fs.existsSync(filePath)) {
      process.env.DATABASE_URL = dbPath;
      console.log(`Using database at: ${dbPath}`);
      break;
    }
  }
  
  // Default fallback
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./prisma/prisma/dev.db';
  }
}

async function addUserFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Adding user_role and team columns to users table...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_user_role_and_team/migration.sql');
    
    // For SQLite, we need to use raw SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN user_role TEXT;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN team TEXT;
    `);
    
    console.log('✅ Successfully added user_role and team columns!');
    
    // Regenerate Prisma client
    console.log('Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client regenerated!');
    
  } catch (error) {
    // Check if columns already exist
    if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
      console.log('⚠️  Columns may already exist. Skipping...');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addUserFields()
  .then(() => {
    console.log('✅ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });


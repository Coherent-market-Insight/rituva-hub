// Simple script to add columns using Prisma's raw SQL
const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  const path = require('path');
  const dbPath = path.resolve(__dirname, '../prisma/prisma/dev.db').replace(/\\/g, '/');
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log('Using database at:', process.env.DATABASE_URL);
}

const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log('Adding user_role and team columns...');
    
    // Add user_role column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN user_role TEXT;');
      console.log('✅ Added user_role column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  user_role column already exists');
      } else {
        throw err;
      }
    }
    
    // Add team column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN team TEXT;');
      console.log('✅ Added team column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  team column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('\n✅ All columns added successfully!');
    console.log('You can now use the application.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();


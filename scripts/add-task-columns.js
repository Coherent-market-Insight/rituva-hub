// Script to add columns to tasks table
const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:D:/kanba/project-hub-main/prisma/prisma/dev.db';
}

const prisma = new PrismaClient();

async function addTaskColumns() {
  try {
    console.log('Adding team, month, week, notes columns to tasks table...');
    
    // Add team column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE tasks ADD COLUMN team TEXT;');
      console.log('✅ Added team column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  team column already exists');
      } else {
        throw err;
      }
    }
    
    // Add month column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE tasks ADD COLUMN month TEXT;');
      console.log('✅ Added month column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  month column already exists');
      } else {
        throw err;
      }
    }
    
    // Add week column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE tasks ADD COLUMN week TEXT;');
      console.log('✅ Added week column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  week column already exists');
      } else {
        throw err;
      }
    }
    
    // Add notes column
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE tasks ADD COLUMN notes TEXT;');
      console.log('✅ Added notes column');
    } catch (err) {
      if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
        console.log('⚠️  notes column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('\n✅ All task columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTaskColumns();


#!/usr/bin/env node

/**
 * Turso Database Setup Script
 * 
 * This script helps you set up Turso database for production.
 * 
 * Prerequisites:
 * 1. Create a Turso account at https://turso.tech
 * 2. Create a database and get:
 *    - DATABASE_URL (libsql://...)
 *    - DATABASE_AUTH_TOKEN
 */

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Turso Database Setup\n');
  console.log('This script will help you configure Turso for production.\n');
  
  console.log('📋 Prerequisites:');
  console.log('1. Go to https://turso.tech and sign up (free)');
  console.log('2. Create a database named "project-hub-production"');
  console.log('3. Get your DATABASE_URL and DATABASE_AUTH_TOKEN from the "Connect" tab\n');
  
  const hasCredentials = await question('Do you have your Turso DATABASE_URL and AUTH_TOKEN? (yes/no): ');
  
  if (hasCredentials.toLowerCase() !== 'yes') {
    console.log('\n📝 Please follow these steps:');
    console.log('1. Visit: https://turso.tech');
    console.log('2. Sign up or log in');
    console.log('3. Click "Create Database"');
    console.log('4. Name it: project-hub-production');
    console.log('5. Choose a location');
    console.log('6. Click "Create"');
    console.log('7. Go to "Connect" tab');
    console.log('8. Copy the Database URL (libsql://...)');
    console.log('9. Click "Create Token" and copy the token\n');
    console.log('Then run this script again.\n');
    rl.close();
    return;
  }
  
  const databaseUrl = await question('\nEnter your DATABASE_URL (libsql://...): ');
  const authToken = await question('Enter your DATABASE_AUTH_TOKEN: ');
  
  if (!databaseUrl || !authToken) {
    console.log('\n❌ Error: Both DATABASE_URL and AUTH_TOKEN are required!\n');
    rl.close();
    return;
  }
  
  console.log('\n⚙️  Setting up...\n');
  
  try {
    // Set environment variables
    process.env.DATABASE_URL = databaseUrl;
    process.env.DATABASE_AUTH_TOKEN = authToken;
    
    console.log('✅ Environment variables set');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npm run db:generate', { stdio: 'inherit', env: process.env });
    console.log('✅ Prisma client generated');
    
    // Push schema to database
    console.log('🗄️  Pushing schema to Turso database...');
    execSync('npm run db:push', { stdio: 'inherit', env: process.env });
    console.log('✅ Schema pushed to database');
    
    console.log('\n🎉 Database setup complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Add these environment variables to Vercel:');
    console.log(`   DATABASE_URL=${databaseUrl}`);
    console.log(`   DATABASE_AUTH_TOKEN=${authToken}`);
    console.log(`   JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`);
    console.log(`   NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}`);
    console.log('   NEXT_PUBLIC_SITE_URL=https://project-hub-main.vercel.app');
    console.log('   NODE_ENV=production');
    console.log('\n2. Go to: https://vercel.com/adityas-projects-576d789c/project-hub-main/settings/environment-variables');
    console.log('3. Add all the variables above');
    console.log('4. Redeploy: vercel --prod\n');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\nMake sure:');
    console.log('- Your DATABASE_URL and AUTH_TOKEN are correct');
    console.log('- You have internet connection');
    console.log('- npm packages are installed (npm install)\n');
  }
  
  rl.close();
}

main().catch(console.error);



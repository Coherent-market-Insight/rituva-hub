#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * 
 * This script helps you set environment variables on Vercel.
 * You need to be logged in to Vercel CLI first: vercel login
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
  console.log('\n🚀 Vercel Environment Variables Setup\n');
  
  const databaseUrl = await question('Enter your Turso DATABASE_URL (libsql://...): ');
  const authToken = await question('Enter your Turso DATABASE_AUTH_TOKEN: ');
  
  if (!databaseUrl || !authToken) {
    console.log('\n❌ Error: Both DATABASE_URL and AUTH_TOKEN are required!\n');
    rl.close();
    return;
  }
  
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  
  console.log('\n📝 Setting environment variables on Vercel...\n');
  
  try {
    // Set environment variables using Vercel CLI
    const envVars = [
      { key: 'DATABASE_URL', value: databaseUrl },
      { key: 'DATABASE_AUTH_TOKEN', value: authToken },
      { key: 'JWT_SECRET', value: jwtSecret },
      { key: 'NEXTAUTH_SECRET', value: nextAuthSecret },
      { key: 'NEXT_PUBLIC_SITE_URL', value: 'https://project-hub-main.vercel.app' },
      { key: 'NODE_ENV', value: 'production' }
    ];
    
    for (const envVar of envVars) {
      console.log(`Setting ${envVar.key}...`);
      try {
        execSync(`vercel env add ${envVar.key} production`, {
          input: envVar.value,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`✅ ${envVar.key} set`);
      } catch (error) {
        console.log(`⚠️  ${envVar.key} - You may need to set this manually`);
        console.log(`   Value: ${envVar.value}`);
      }
    }
    
    console.log('\n🎉 Environment variables configured!\n');
    console.log('📋 If any variables failed, set them manually at:');
    console.log('https://vercel.com/adityas-projects-576d789c/project-hub-main/settings/environment-variables\n');
    console.log('📝 Generated secrets:');
    console.log(`JWT_SECRET=${jwtSecret}`);
    console.log(`NEXTAUTH_SECRET=${nextAuthSecret}\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Manual setup:');
    console.log('Go to: https://vercel.com/adityas-projects-576d789c/project-hub-main/settings/environment-variables');
    console.log('Add these variables:');
    console.log(`DATABASE_URL=${databaseUrl}`);
    console.log(`DATABASE_AUTH_TOKEN=${authToken}`);
    console.log(`JWT_SECRET=${jwtSecret}`);
    console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
    console.log('NEXT_PUBLIC_SITE_URL=https://project-hub-main.vercel.app');
    console.log('NODE_ENV=production\n');
  }
  
  rl.close();
}

main().catch(console.error);


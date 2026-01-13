#!/usr/bin/env node

/**
 * Quick Turso Setup Script
 * Run this after you have your DATABASE_URL and AUTH_TOKEN from Turso
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Quick Turso Setup\n');
  
  // Pre-filled with the database URL from the user
  const defaultUrl = 'libsql://project-hub-production-vimarshdwivedi.aws-us-east-2.turso.io';
  
  console.log('📋 Database URL detected:');
  console.log(`   ${defaultUrl}\n`);
  
  const useDefault = await question('Use this URL? (yes/no) [yes]: ');
  const databaseUrl = useDefault.toLowerCase() === 'no' 
    ? await question('Enter your DATABASE_URL: ')
    : defaultUrl;
  
  const authToken = await question('\nEnter your AUTH_TOKEN (from Turso "Create Token"): ');
  
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
    console.log('📦 Generating Prisma client for Turso...');
    execSync('npm run db:generate', { stdio: 'inherit', env: process.env });
    console.log('✅ Prisma client generated');
    
    // Push schema to database
    console.log('🗄️  Pushing schema to Turso database...');
    execSync('npm run db:push', { stdio: 'inherit', env: process.env });
    console.log('✅ Schema pushed to database');
    
    console.log('\n🎉 Database setup complete!\n');
    console.log('📝 Next: Setting up Vercel environment variables...\n');
    
    // Now set up Vercel
    const setupVercel = await question('Set up Vercel environment variables now? (yes/no) [yes]: ');
    
    if (setupVercel.toLowerCase() !== 'no') {
      console.log('\n📝 Setting Vercel environment variables...\n');
      
      const crypto = require('crypto');
      const jwtSecret = crypto.randomBytes(32).toString('hex');
      const nextAuthSecret = crypto.randomBytes(32).toString('hex');
      
      const envVars = [
        { key: 'DATABASE_URL', value: databaseUrl },
        { key: 'DATABASE_AUTH_TOKEN', value: authToken },
        { key: 'JWT_SECRET', value: jwtSecret },
        { key: 'NEXTAUTH_SECRET', value: nextAuthSecret },
        { key: 'NEXT_PUBLIC_SITE_URL', value: 'https://project-hub-main.vercel.app' },
        { key: 'NODE_ENV', value: 'production' }
      ];
      
      console.log('📋 Add these to Vercel:\n');
      console.log('Go to: https://vercel.com/adityas-projects-576d789c/project-hub-main/settings/environment-variables\n');
      
      for (const envVar of envVars) {
        console.log(`${envVar.key}=${envVar.value}`);
      }
      
      console.log('\n💡 Tip: You can also run: npm run setup:vercel\n');
    }
    
    console.log('\n✅ Setup complete!');
    console.log('\n📝 Final step: Redeploy on Vercel');
    console.log('   Run: vercel --prod\n');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\nMake sure:');
    console.log('- Your DATABASE_URL and AUTH_TOKEN are correct');
    console.log('- You have internet connection');
    console.log('- npm packages are installed\n');
  }
  
  rl.close();
}

main().catch(console.error);


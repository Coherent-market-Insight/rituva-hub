#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
  console.log('\n📊 Checking Turso Tables\n');
  
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('✅ Tables in database:');
    if (result.rows.length === 0) {
      console.log('   (No tables found)');
    } else {
      result.rows.forEach(row => console.log(`   - ${row.name}`));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();


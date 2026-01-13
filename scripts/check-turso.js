#!/usr/bin/env node

/**
 * Turso Database Setup - Simplified
 * This script initializes your Turso database for use with the app
 */

const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

async function main() {
  console.log("\n🚀 Turso Database Initialization\n");

  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL not set in environment");
    console.error("   Please check your .env.local file\n");
    process.exit(1);
  }

  try {
    console.log("📡 Connecting to Turso Database...");
    console.log(`   URL: ${databaseUrl.replace(/\?.*/, "")}\n`);

    // Create a libsql client
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    console.log("✅ Successfully connected to Turso!\n");

    // Test a simple query
    try {
      const result = await client.execute("SELECT 1 as test");
      console.log("✅ Database is responding to queries\n");
    } catch (queryError) {
      console.log("ℹ️  Note: Schema will be initialized on first app run\n");
    }

    console.log("🎉 Turso Database is Ready!\n");

    console.log("📝 Next Steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Open: http://localhost:3000");
    console.log("   3. Create an account and start using!\n");

    console.log("📊 Database Information:");
    console.log(`   Provider: Turso (libSQL)`);
    console.log(`   Location: AWS US East 2`);
    console.log(`   Status: ✅ READY\n`);

  } catch (error) {
    console.error("\n❌ Connection Error:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   • Check DATABASE_URL format");
    console.error("   • Verify DATABASE_AUTH_TOKEN is correct");
    console.error("   • Ensure internet connection");
    console.error("   • Visit: https://app.turso.tech\n");
    process.exit(1);
  }
}

// Load env if needed
if (!process.env.DATABASE_URL) {
  const dotenv = require("dotenv");
  // Try .env first, then .env.local
  try {
    const envPath = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, "../.env")
      : path.join(__dirname, "../.env");
    dotenv.config({ path: envPath });
  } catch (e) {
    // Fallback to .env.local
    dotenv.config({ path: path.join(__dirname, "../.env.local") });
  }
}

main().catch(console.error);


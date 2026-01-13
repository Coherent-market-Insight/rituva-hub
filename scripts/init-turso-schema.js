#!/usr/bin/env node

/**
 * Push Schema to Turso
 * This script connects to your Turso database and initializes the schema
 */

const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Initializing Turso Database Schema\n");

  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!databaseUrl || !authToken) {
    console.error("❌ Error: Missing DATABASE_URL or DATABASE_AUTH_TOKEN");
    console.error("   Make sure your .env.local file is configured correctly\n");
    process.exit(1);
  }

  try {
    console.log("📡 Connecting to Turso...");

    // Create client
    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    console.log("✅ Connected to Turso!\n");

    // Read the migration SQL
    const migrationPath = path.join(__dirname, "../prisma/migrations/add_user_role_and_team/migration.sql");
    
    if (!fs.existsSync(migrationPath)) {
      console.warn("⚠️  Migration file not found at", migrationPath);
      console.log("   The database schema should be auto-created when needed.\n");
      return;
    }

    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    // Execute migration
    console.log("📝 Executing migration...");
    await client.execute(migrationSql);

    console.log("✅ Schema initialized successfully!\n");

    console.log("📊 Database is ready to use with:");
    console.log(`   URL: ${databaseUrl.split("?")[0]}`);
    console.log(`   Auth Token: ${authToken.substring(0, 20)}...\n`);

    console.log("🎉 You can now:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Visit: http://localhost:3000");
    console.log("   3. Start using your Turso database!\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check if DATABASE_URL is correct");
    console.error("   - Verify DATABASE_AUTH_TOKEN is valid");
    console.error("   - Ensure you have internet connection");
    console.error("   - Visit https://app.turso.tech to verify your database\n");
    process.exit(1);
  }
}

main().catch(console.error);


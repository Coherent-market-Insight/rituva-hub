const { createClient } = require('@libsql/client');
require('dotenv').config();

async function createAttachmentsTable() {
  console.log('Connecting to Turso database...');

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('Creating task_attachments table...');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS task_attachments (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT,
        uploaded_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ task_attachments table created successfully!');

    // Verify the table was created
    const result = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='task_attachments';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table verified in database');
    } else {
      console.log('❌ Table not found after creation');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

createAttachmentsTable();

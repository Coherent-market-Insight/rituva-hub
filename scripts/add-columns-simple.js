const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/prisma/dev.db');

console.log('Opening database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Add columns
db.serialize(() => {
  db.run(`ALTER TABLE users ADD COLUMN user_role TEXT;`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column') || err.message.includes('already exists')) {
        console.log('⚠️  user_role column already exists');
      } else {
        console.error('❌ Error adding user_role:', err.message);
      }
    } else {
      console.log('✅ Added user_role column');
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN team TEXT;`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column') || err.message.includes('already exists')) {
        console.log('⚠️  team column already exists');
      } else {
        console.error('❌ Error adding team:', err.message);
      }
    } else {
      console.log('✅ Added team column');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection closed');
  console.log('\n✅ Migration complete! Now run: npx prisma generate');
  process.exit(0);
});



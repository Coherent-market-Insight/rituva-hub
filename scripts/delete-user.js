require('dotenv').config();
const { createClient } = require('@libsql/client');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/delete-user.js <email>');
  process.exit(1);
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function deleteUser() {
  try {
    // First check if user exists
    const checkResult = await client.execute({
      sql: 'SELECT id, email, full_name FROM users WHERE email = ?',
      args: [email],
    });
    
    if (checkResult.rows.length === 0) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    console.log('Found user:', checkResult.rows[0]);
    
    // Delete the user
    const deleteResult = await client.execute({
      sql: 'DELETE FROM users WHERE email = ?',
      args: [email],
    });
    
    console.log(`Successfully deleted user with email: ${email}`);
    console.log('Rows affected:', deleteResult.rowsAffected);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

deleteUser();



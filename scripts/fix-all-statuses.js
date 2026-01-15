const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://project-hub-production-vimarshdwivedi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyODg0MjgsImlkIjoiYjdjZjU4OTItYzcxZC00YThlLWI5NzUtZGRlOTE0YWQwZTMxIiwicmlkIjoiMzQxMDhjY2MtNWUxYy00MGNkLWFhYzUtOGY1YmVhNzk3MzYzIn0.hVY6OFHYtFNOb5j7Ha3xUHfL59THIknVGHl0pyPtMv-0qsjYs3dtP59uWsGxCjwcNFpSJe1NvwilkVZxv1YtBA'
});

async function fixStatuses() {
  console.log('Fixing all task statuses...\n');

  try {
    // Delete all tasks to start fresh
    const deleteResult = await client.execute('DELETE FROM tasks');
    console.log('Deleted all tasks:', deleteResult.rowsAffected);

    // Show current tasks (should be empty)
    const tasks = await client.execute('SELECT id, title, status FROM tasks');
    console.log('\nCurrent tasks:', tasks.rows.length);
    console.log('\n✅ Database cleaned! Please create new tasks to test the workflow.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixStatuses();


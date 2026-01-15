const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://project-hub-production-vimarshdwivedi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyODg0MjgsImlkIjoiYjdjZjU4OTItYzcxZC00YThlLWI5NzUtZGRlOTE0YWQwZTMxIiwicmlkIjoiMzQxMDhjY2MtNWUxYy00MGNkLWFhYzUtOGY1YmVhNzk3MzYzIn0.hVY6OFHYtFNOb5j7Ha3xUHfL59THIknVGHl0pyPtMv-0qsjYs3dtP59uWsGxCjwcNFpSJe1NvwilkVZxv1YtBA'
});

async function fixTaskStatus() {
  console.log('Fixing task statuses...\n');

  try {
    // Update any push_to_account_manager tasks to assigned
    const result = await client.execute(
      "UPDATE tasks SET status = 'assigned' WHERE status = 'push_to_account_manager'"
    );
    console.log('Tasks updated from push_to_account_manager to assigned:', result.rowsAffected);

    // Show current tasks
    const tasks = await client.execute('SELECT id, title, status FROM tasks');
    console.log('\nCurrent tasks:');
    console.log(JSON.stringify(tasks.rows, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixTaskStatus();


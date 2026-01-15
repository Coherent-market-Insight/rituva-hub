const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://project-hub-production-vimarshdwivedi.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjgyODg0MjgsImlkIjoiYjdjZjU4OTItYzcxZC00YThlLWI5NzUtZGRlOTE0YWQwZTMxIiwicmlkIjoiMzQxMDhjY2MtNWUxYy00MGNkLWFhYzUtOGY1YmVhNzk3MzYzIn0.hVY6OFHYtFNOb5j7Ha3xUHfL59THIknVGHl0pyPtMv-0qsjYs3dtP59uWsGxCjwcNFpSJe1NvwilkVZxv1YtBA'
});

async function resetDatabase() {
  console.log('🗑️  Cleaning database...\n');

  try {
    // Delete all tasks first (due to foreign key constraints)
    console.log('Deleting all tasks...');
    await client.execute('DELETE FROM tasks');
    console.log('✓ All tasks deleted\n');

    // Delete all task comments
    console.log('Deleting all task comments...');
    await client.execute('DELETE FROM task_comments');
    console.log('✓ All task comments deleted\n');

    // Delete all activity logs
    console.log('Deleting all activity logs...');
    await client.execute('DELETE FROM activity_logs');
    console.log('✓ All activity logs deleted\n');

    // Delete all audit logs
    console.log('Deleting all audit logs...');
    await client.execute('DELETE FROM audit_logs');
    console.log('✓ All audit logs deleted\n');

    // Delete all notifications
    console.log('Deleting all notifications...');
    await client.execute('DELETE FROM notifications');
    console.log('✓ All notifications deleted\n');

    // Delete all messages
    console.log('Deleting all messages...');
    await client.execute('DELETE FROM messages');
    console.log('✓ All messages deleted\n');

    // Delete all API keys
    console.log('Deleting all API keys...');
    await client.execute('DELETE FROM api_keys');
    console.log('✓ All API keys deleted\n');

    // Delete all project members
    console.log('Deleting all project members...');
    await client.execute('DELETE FROM project_members');
    console.log('✓ All project members deleted\n');

    // Delete all workspace members
    console.log('Deleting all workspace members...');
    await client.execute('DELETE FROM workspace_members');
    console.log('✓ All workspace members deleted\n');

    // Delete all boards
    console.log('Deleting all boards...');
    await client.execute('DELETE FROM boards');
    console.log('✓ All boards deleted\n');

    // Delete all projects
    console.log('Deleting all projects...');
    await client.execute('DELETE FROM projects');
    console.log('✓ All projects deleted\n');

    // Delete all workspaces
    console.log('Deleting all workspaces...');
    await client.execute('DELETE FROM workspaces');
    console.log('✓ All workspaces deleted\n');

    // Delete all users
    console.log('Deleting all users...');
    await client.execute('DELETE FROM users');
    console.log('✓ All users deleted\n');

    console.log('✅ Database cleaned successfully!\n');
    console.log('📝 Note: Users will be created when they sign up via the app.');
    console.log('   - random1@gmail.com');
    console.log('   - random2@gmail.com');
    console.log('\n   The special client@rituva.com account will be auto-created on login.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetDatabase();


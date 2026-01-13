const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password_hash: await bcryptjs.hash('password123', 10),
      full_name: 'John Doe',
      role: 'user',
      is_email_verified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password_hash: await bcryptjs.hash('password123', 10),
      full_name: 'Jane Smith',
      role: 'user',
      is_email_verified: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password_hash: await bcryptjs.hash('password123', 10),
      full_name: 'Bob Johnson',
      role: 'user',
      is_email_verified: true,
    },
  });

  console.log('✓ Users created');

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default-workspace' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default-workspace',
      description: 'Your first workspace',
    },
  });

  console.log('✓ Workspace created');

  // Add users to workspace
  await prisma.workspaceMember.upsert({
    where: {
      workspace_id_user_id: {
        workspace_id: workspace.id,
        user_id: user1.id,
      },
    },
    update: {},
    create: {
      workspace_id: workspace.id,
      user_id: user1.id,
      role: 'owner',
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspace_id_user_id: {
        workspace_id: workspace.id,
        user_id: user2.id,
      },
    },
    update: {},
    create: {
      workspace_id: workspace.id,
      user_id: user2.id,
      role: 'admin',
    },
  });

  console.log('✓ Workspace members added');

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { slug: 'website-redesign' },
    update: {},
    create: {
      name: 'Website Redesign',
      slug: 'website-redesign',
      description: 'Complete redesign of the company website',
      workspace_id: workspace.id,
      owner_id: user1.id,
      color: '#3B82F6',
      members: {
        create: [
          { user_id: user1.id, role: 'owner' },
          { user_id: user2.id, role: 'lead' },
          { user_id: user3.id, role: 'member' },
        ],
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: 'mobile-app' },
    update: {},
    create: {
      name: 'Mobile App',
      slug: 'mobile-app',
      description: 'New mobile application',
      workspace_id: workspace.id,
      owner_id: user2.id,
      color: '#10B981',
      members: {
        create: [
          { user_id: user2.id, role: 'owner' },
          { user_id: user1.id, role: 'manager' },
          { user_id: user3.id, role: 'member' },
        ],
      },
    },
  });

  console.log('✓ Projects created');

  // Create boards for project 1
  const board1_1 = await prisma.board.upsert({
    where: { id: 'board-1-1' },
    update: {},
    create: {
      id: 'board-1-1',
      name: 'To Do',
      project_id: project1.id,
      position: 1,
    },
  });

  const board1_2 = await prisma.board.upsert({
    where: { id: 'board-1-2' },
    update: {},
    create: {
      id: 'board-1-2',
      name: 'In Progress',
      project_id: project1.id,
      position: 2,
    },
  });

  const board1_3 = await prisma.board.upsert({
    where: { id: 'board-1-3' },
    update: {},
    create: {
      id: 'board-1-3',
      name: 'Done',
      project_id: project1.id,
      position: 3,
    },
  });

  console.log('✓ Boards created');

  // Create tasks for project 1
  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Design homepage layout',
      description: 'Create the new homepage layout with Figma',
      board_id: board1_1.id,
      position: 1,
      priority: 'high',
      status: 'todo',
      created_by: user1.id,
      assigned_to: user2.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      title: 'Implement responsive design',
      description: 'Make the design responsive for all screen sizes',
      board_id: board1_2.id,
      position: 1,
      priority: 'high',
      status: 'in_progress',
      created_by: user2.id,
      assigned_to: user1.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-3' },
    update: {},
    create: {
      id: 'task-3',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automatic deployment',
      board_id: board1_3.id,
      position: 1,
      priority: 'medium',
      status: 'done',
      created_by: user1.id,
      assigned_to: user3.id,
    },
  });

  console.log('✓ Tasks created');

  console.log('✅ Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('1. john@example.com / password123 (Owner)');
  console.log('2. jane@example.com / password123 (Admin)');
  console.log('3. bob@example.com / password123 (Member)');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


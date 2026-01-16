import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, createdResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    // Get user data to check role and team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true, team: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is supervisor
    if (userData.user_role !== 'admin') {
      return forbiddenResponse('Only supervisors can access this endpoint');
    }

    if (!userData.team) {
      return errorResponse('Admin team not set', 400);
    }

    // Get Rituva project
    const project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
      return successResponse([]);
    }

    // Get all tasks from users in the same team
    const tasks = await prisma.task.findMany({
      where: {
        team: userData.team, // Only tasks from admin's team
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        attachments: {
          select: {
            id: true,
            file_name: true,
            file_url: true,
            file_size: true,
            file_type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('[GET_ADMIN_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    // Get user data to check role and team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true, team: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is admin
    if (userData.user_role !== 'admin') {
      return forbiddenResponse('Only admins can create tasks');
    }

    if (!userData.team) {
      return errorResponse('Admin team not set', 400);
    }

    const body = await request.json();
    const { title, description, month, week, status, notes, assigned_to } = body;

    if (!title || !month || !week || !status) {
      return errorResponse('Title, month, week, and status are required', 400);
    }

    // Get or create Rituva project
    let project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
      // Get or create default workspace
      let workspace = await prisma.workspace.findFirst({
        where: { slug: 'rituva-workspace' },
      });

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: 'Rituva Workspace',
            slug: 'rituva-workspace',
            description: 'Default workspace for Rituva project',
          },
        });
      }

      // Create project with boards
      project = await prisma.project.create({
        data: {
          name: 'Rituva',
          slug: 'rituva',
          description: 'Default project',
          workspace_id: workspace.id,
          owner_id: user.userId,
          boards: {
            create: [
              { name: 'To Do', position: 1 },
              { name: 'In Progress', position: 2 },
              { name: 'In Review', position: 3 },
              { name: 'Done', position: 4 },
            ],
          },
        },
      });
    }

    // Get or create boards for the project
    let board = await prisma.board.findFirst({
      where: { project_id: project.id },
      orderBy: { position: 'asc' },
    });

    if (!board) {
      // Create default boards if they don't exist
      const defaultBoards = [
        { name: 'To Do', position: 1 },
        { name: 'In Progress', position: 2 },
        { name: 'In Review', position: 3 },
        { name: 'Done', position: 4 },
      ];

      for (const boardData of defaultBoards) {
        await prisma.board.create({
          data: {
            ...boardData,
            project_id: project.id,
          },
        });
      }

      // Get the first board
      board = await prisma.board.findFirst({
        where: { project_id: project.id },
        orderBy: { position: 'asc' },
      });
    }

    if (!board) {
      return errorResponse('Failed to create board', 500);
    }

    // Get max position for board
    const maxPosition = await prisma.task.aggregate({
      where: { board_id: board.id },
      _max: { position: true },
    });

    const position = (maxPosition._max.position || 0) + 1;

    // Create task with optional assignment
    // When admin creates a task, valid statuses are: assigned, push_to_project_manager
    const validAdminStatuses = ['assigned', 'push_to_project_manager'];
    const taskStatus = validAdminStatuses.includes(status) ? status : 'assigned';
    
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        board_id: board.id,
        position,
        status: taskStatus,
        team: userData.team,
        month: month,
        week: week,
        notes: notes || null,
        created_by: user.userId,
        assigned_to: assigned_to || null,
        priority: 'medium', // Default priority
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return createdResponse(task, 'Task created successfully');
  } catch (error: any) {
    console.error('[CREATE_ADMIN_TASK]', error);
    if (error.code === 'P2002') {
      return errorResponse('Unique constraint violation', 400);
    }
    if (error.code === 'P2003') {
      return errorResponse('Foreign key constraint failed', 400);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


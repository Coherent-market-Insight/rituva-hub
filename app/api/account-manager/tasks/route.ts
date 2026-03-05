import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, createdResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    if (userData.user_role !== 'account_manager') {
      return forbiddenResponse('Only account managers can access this endpoint');
    }

    // Account Manager sees:
    // - tasks pushed by PM (push_to_account_manager)
    // - tasks they've pushed to client (push_to_client, client_completed)
    // - tasks they created themselves (any status)
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          {
            status: {
              in: ['push_to_account_manager', 'push_to_client', 'client_completed'],
            },
          },
          {
            created_by: user.userId,
          },
        ],
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
        updated_at: 'desc',
      },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('[GET_ACCOUNT_MANAGER_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    if (userData.user_role !== 'account_manager') {
      return forbiddenResponse('Only account managers can create tasks');
    }

    const body = await request.json();
    const { title, description, team, month, week, status, notes, assigned_to } = body;

    if (!title || !team || !month || !week) {
      return errorResponse('Title, team, month, and week are required', 400);
    }

    let project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
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

    let board = await prisma.board.findFirst({
      where: { project_id: project.id },
      orderBy: { position: 'asc' },
    });

    if (!board) {
      const defaultBoards = [
        { name: 'To Do', position: 1 },
        { name: 'In Progress', position: 2 },
        { name: 'In Review', position: 3 },
        { name: 'Done', position: 4 },
      ];

      for (const boardData of defaultBoards) {
        await prisma.board.create({
          data: { ...boardData, project_id: project.id },
        });
      }

      board = await prisma.board.findFirst({
        where: { project_id: project.id },
        orderBy: { position: 'asc' },
      });
    }

    if (!board) {
      return errorResponse('Failed to create board', 500);
    }

    const maxPosition = await prisma.task.aggregate({
      where: { board_id: board.id },
      _max: { position: true },
    });

    const position = (maxPosition._max.position || 0) + 1;

    const validStatuses = ['assigned', 'push_to_project_manager', 'push_to_account_manager', 'work_in_progress', 'completed'];
    const taskStatus = validStatuses.includes(status) ? status : 'assigned';

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        board_id: board.id,
        position,
        status: taskStatus,
        team,
        month,
        week,
        notes: notes || null,
        created_by: user.userId,
        assigned_to: assigned_to || null,
        priority: 'medium',
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
    console.error('[CREATE_ACCOUNT_MANAGER_TASK]', error);
    if (error.code === 'P2002') {
      return errorResponse('Unique constraint violation', 400);
    }
    if (error.code === 'P2003') {
      return errorResponse('Foreign key constraint failed', 400);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


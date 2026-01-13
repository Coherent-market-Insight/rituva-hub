import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, createdResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    // Get user's team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { team: true },
    });

    if (!userData?.team) {
      return successResponse([]);
    }

    // Get Rituva project
    const project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
      return successResponse([]);
    }

    // Get all boards for the project
    const boards = await prisma.board.findMany({
      where: { project_id: project.id },
    });

    // Get tasks created by the user, filtered by team
    const tasks = await prisma.task.findMany({
      where: {
        created_by: user.userId,
        team: userData.team,
      },
      include: {
        creator: {
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
      orderBy: {
        created_at: 'desc',
      },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('[GET_TEAM_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { title, description, month, week, status, notes } = body;

    if (!title || !month || !week || !status) {
      return errorResponse('Title, month, week, and status are required', 400);
    }

    // Get user's team automatically
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { team: true },
    });

    if (!userData?.team) {
      return errorResponse('User team not set', 400);
    }

    const team = userData.team;

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

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        board_id: board.id,
        position,
        status: status === 'completed' ? 'completed' : 'work_in_progress',
        team: team,
        month: month,
        week: week,
        notes: notes || null,
        created_by: user.userId,
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
    console.error('[CREATE_TEAM_TASK]', error);
    // Provide more detailed error message
    if (error.code === 'P2002') {
      return errorResponse('Unique constraint violation', 400);
    }
    if (error.code === 'P2003') {
      return errorResponse('Foreign key constraint failed', 400);
    }
    if (error.message?.includes('Unknown column') || error.message?.includes('no such column')) {
      return errorResponse('Database schema not updated. Please run migration.', 500);
    }
    // Return the actual error message for debugging
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


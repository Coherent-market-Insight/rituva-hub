import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, createdResponse, forbiddenResponse } from '@/lib/api-response';
import { canUserEditProject, canUserAccessProject } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const projectId = params.id;

    // Check access
    const hasAccess = await canUserAccessProject(user.userId, projectId);
    if (!hasAccess) return forbiddenResponse();

    // Get tasks with boards
    const boards = await prisma.board.findMany({
      where: { project_id: projectId },
      include: {
        tasks: {
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
              },
            },
            assignee: {
              select: {
                id: true,
                email: true,
                full_name: true,
                avatar_url: true,
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
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return successResponse(boards);
  } catch (error) {
    console.error('[GET_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const projectId = params.id;

    // Check permission
    const canEdit = await canUserEditProject(user.userId, projectId);
    if (!canEdit) return forbiddenResponse();

    const body = await request.json();
    const { title, description, board_id, priority, due_date, assigned_to } = body;

    if (!title || !board_id) {
      return errorResponse('Title and board_id are required', 400);
    }

    // Get max position for board
    const maxPosition = await prisma.task.aggregate({
      where: { board_id },
      _max: { position: true },
    });

    const position = (maxPosition._max.position || 0) + 1;

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        board_id,
        position,
        priority: priority || 'medium',
        due_date: due_date ? new Date(due_date) : null,
        created_by: user.userId,
        assigned_to: assigned_to || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        user_id: user.userId,
        action: 'created',
        entity_type: 'Task',
        entity_id: task.id,
        details: { title: task.title },
      },
    });

    return createdResponse(task, 'Task created successfully');
  } catch (error) {
    console.error('[CREATE_TASK]', error);
    return errorResponse('Internal server error', 500);
  }
}


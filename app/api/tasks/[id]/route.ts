import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';
import { canUserEditTask } from '@/lib/authorization';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const taskId = params.id;

    // Check permission
    const canEdit = await canUserEditTask(user.userId, taskId);
    if (!canEdit) return forbiddenResponse();

    const body = await request.json();
    const { title, description, status, priority, due_date, assigned_to, board_id, position } = body;

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        ...(assigned_to !== undefined && { assigned_to }),
        ...(board_id && { board_id }),
        ...(position !== undefined && { position }),
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

    // Get project for activity log
    const board = await prisma.board.findUnique({
      where: { id: task.board_id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: board?.project_id || '',
        user_id: user.userId,
        action: 'updated',
        entity_type: 'Task',
        entity_id: task.id,
        details: { changes: body },
      },
    });

    return successResponse(task, 'Task updated successfully');
  } catch (error) {
    console.error('[UPDATE_TASK]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const taskId = params.id;

    // Check permission
    const canEdit = await canUserEditTask(user.userId, taskId);
    if (!canEdit) return forbiddenResponse();

    // Get task for logging
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: true,
      },
    });

    if (!task) return errorResponse('Task not found', 404);

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: task.board.project_id,
        user_id: user.userId,
        action: 'deleted',
        entity_type: 'Task',
        entity_id: taskId,
        details: { title: task.title },
      },
    });

    return successResponse(null, 'Task deleted successfully');
  } catch (error) {
    console.error('[DELETE_TASK]', error);
    return errorResponse('Internal server error', 500);
  }
}


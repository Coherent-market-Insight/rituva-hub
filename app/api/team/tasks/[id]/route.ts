import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const taskId = params.id;
    const body = await request.json();
    const { title, description, month, week, status, notes } = body;

    // Get the task to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify the task was created by the current user
    if (task.created_by !== user.userId) {
      return forbiddenResponse('You can only edit your own tasks');
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(month !== undefined && { month }),
        ...(week !== undefined && { week }),
        ...(status && { status: status === 'completed' ? 'completed' : 'work_in_progress' }),
        ...(notes !== undefined && { notes }),
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

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error: any) {
    console.error('[UPDATE_TEAM_TASK]', error);
    return errorResponse(error.message || 'Internal server error', 500);
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

    // Get the task to verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify the task was created by the current user
    if (task.created_by !== user.userId) {
      return forbiddenResponse('You can only delete your own tasks');
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return successResponse(null, 'Task deleted successfully');
  } catch (error: any) {
    console.error('[DELETE_TEAM_TASK]', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


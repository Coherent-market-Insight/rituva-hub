import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    // Get user data to check role
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is client
    if (userData.user_role !== 'client') {
      return forbiddenResponse('Only clients can mark tasks as done');
    }

    const taskId = params.id;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify task status is push_to_client
    if (task.status !== 'push_to_client') {
      return errorResponse('Task must be in "Push to Client" status to mark as done', 400);
    }

    // Update task status to client_completed
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'client_completed',
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

    return successResponse(updatedTask, 'Task marked as done successfully');
  } catch (error: any) {
    console.error('[MARK_TASK_DONE]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


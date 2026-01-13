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

    // Check if user is account manager
    if (userData.user_role !== 'account_manager') {
      return forbiddenResponse('Only account managers can push tasks to client');
    }

    const taskId = params.id;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify task status is push_to_account_manager or sent_for_review
    if (task.status !== 'push_to_account_manager' && task.status !== 'sent_for_review') {
      return errorResponse('Task must be in "Push to Account Manager" or "Sent for Review" status to push to client', 400);
    }

    // Update task status to push_to_client
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'push_to_client',
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

    return successResponse(updatedTask, 'Task pushed to client successfully');
  } catch (error: any) {
    console.error('[PUSH_TO_CLIENT]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


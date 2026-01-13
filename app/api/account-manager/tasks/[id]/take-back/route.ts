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
      return forbiddenResponse('Only account managers can take back tasks from client');
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
      return errorResponse('Task must be in "Pushed to Client" status to take back', 400);
    }

    // Update task status back to push_to_account_manager
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'push_to_account_manager',
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

    return successResponse(updatedTask, 'Task taken back from client successfully');
  } catch (error: any) {
    console.error('[TAKE_BACK_FROM_CLIENT]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


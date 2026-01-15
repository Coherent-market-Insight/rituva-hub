import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

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

    // Check if user is project manager
    if (userData.user_role !== 'project_manager') {
      return forbiddenResponse('Only project managers can push tasks to account manager');
    }

    const taskId = params.id;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    // Project managers can push tasks that are: push_to_project_manager
    if (task.status !== 'push_to_project_manager') {
      return errorResponse('Only tasks pushed to project manager can be forwarded to account manager', 400);
    }

    // Update task status to push_to_account_manager
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'push_to_account_manager',
        updated_at: new Date(),
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
      },
    });

    return successResponse(updatedTask, 'Task pushed to account manager successfully');
  } catch (error) {
    console.error('[PUSH_TO_AM]', error);
    return errorResponse('Internal server error', 500);
  }
}


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

    // Check if user is project manager
    if (userData.user_role !== 'project_manager') {
      return forbiddenResponse('Only project managers can send tasks back for review');
    }

    const taskId = params.id;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify task status allows sending back for review
    // Project managers can send back tasks that are: push_to_account_manager, push_to_client, or sent_for_review
    if (!['push_to_account_manager', 'push_to_client', 'sent_for_review'].includes(task.status)) {
      return errorResponse('Task cannot be sent back for review from its current status', 400);
    }

    // Update task status to sent_for_review_by_pm (this will send it back to the admin)
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'sent_for_review_by_pm',
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

    return successResponse(updatedTask, 'Task sent back to admin for review successfully');
  } catch (error: any) {
    console.error('[SEND_BACK_REVIEW_PM]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


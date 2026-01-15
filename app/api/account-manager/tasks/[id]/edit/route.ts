import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

export async function PUT(
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
      return forbiddenResponse('Only account managers can edit tasks');
    }

    const taskId = params.id;
    const body = await request.json();
    const { title, description, notes } = body;

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    // Account managers can edit tasks that are: push_to_account_manager or push_to_client
    if (!['push_to_account_manager', 'push_to_client'].includes(task.status)) {
      return errorResponse('Only tasks in your queue can be edited', 400);
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        notes: notes !== undefined ? notes : task.notes,
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

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    console.error('[EDIT_AM_TASK]', error);
    return errorResponse('Internal server error', 500);
  }
}


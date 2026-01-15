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

    // Get user data to check role and team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true, team: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is supervisor
    if (userData.user_role !== 'admin') {
      return forbiddenResponse('Only supervisors can update tasks');
    }

    const taskId = params.id;
    const body = await request.json();
    const { title, description, month, week, status, notes, assigned_to } = body;

    // Verify task belongs to admin's team
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { team: true },
    });

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    if (existingTask.team !== userData.team) {
      return forbiddenResponse('You can only update tasks from your team');
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(month && { month }),
        ...(week && { week }),
        ...(status && { status: status === 'sent_for_review' ? 'sent_for_review' : 'push_to_account_manager' }),
        ...(notes !== undefined && { notes }),
        ...(assigned_to !== undefined && { assigned_to }),
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

    return successResponse(task, 'Task updated successfully');
  } catch (error: any) {
    console.error('[UPDATE_ADMIN_TASK]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
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

    // Get user data to check role and team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true, team: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is supervisor
    if (userData.user_role !== 'admin') {
      return forbiddenResponse('Only supervisors can delete tasks');
    }

    const taskId = params.id;

    // Verify task belongs to admin's team
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { team: true },
    });

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    if (existingTask.team !== userData.team) {
      return forbiddenResponse('You can only delete tasks from your team');
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return successResponse(null, 'Task deleted successfully');
  } catch (error: any) {
    console.error('[DELETE_ADMIN_TASK]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}



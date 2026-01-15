import { NextRequest } from 'next/server';
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

    // Get the task to verify assignment
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        assigned_to: true,
        team: true,
        created_by: true,
      },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Get user's team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { team: true },
    });

    // Verify user is assigned to this task
    if (!task.assigned_to) {
      return forbiddenResponse('Task is not assigned to anyone');
    }

    // Check if user is in the assigned users list (comma-separated)
    const assignedUserIds = task.assigned_to.split(',').map(id => id.trim());
    if (!assignedUserIds.includes(user.userId)) {
      return forbiddenResponse('You can only edit tasks assigned to you');
    }

    // Verify task belongs to user's team
    if (userData?.team && task.team !== userData.team) {
      return forbiddenResponse('Task does not belong to your team');
    }

    // Update task - users can only update title, description, status, and notes
    // Month and week are set by admin and cannot be changed
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) {
      // Users can only set status to 'completed' or 'work_in_progress'
      updateData.status = status === 'completed' ? 'completed' : 'work_in_progress';
    }
    if (notes !== undefined) updateData.notes = notes;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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

    return successResponse(updatedTask, 'Task updated successfully');
  } catch (error: any) {
    console.error('[UPDATE_ASSIGNED_TASK]', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}



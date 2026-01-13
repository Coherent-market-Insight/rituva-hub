import { NextRequest, NextResponse } from 'next/server';
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

    // Get user data to check role and team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true, team: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    // Check if user is admin
    if (userData.user_role !== 'admin') {
      return forbiddenResponse('Only admins can assign tasks');
    }

    if (!userData.team) {
      return errorResponse('Admin team not set', 400);
    }

    const taskId = params.id;
    const body = await request.json();
    const { assigned_to } = body;

    if (!assigned_to) {
      return errorResponse('assigned_to is required', 400);
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    // Verify task is from admin's team
    if (task.team !== userData.team) {
      return forbiddenResponse('You can only assign tasks from your team');
    }

    // Verify assigned user is in the same team
    const assignedUser = await prisma.user.findUnique({
      where: { id: assigned_to },
      select: { team: true },
    });

    if (!assignedUser) {
      return notFoundResponse('Assigned user not found');
    }

    if (assignedUser.team !== userData.team) {
      return forbiddenResponse('You can only assign tasks to users in your team');
    }

    // Update task assignment
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigned_to: assigned_to,
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

    return successResponse(updatedTask, 'Task assigned successfully');
  } catch (error: any) {
    console.error('[ASSIGN_TASK]', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


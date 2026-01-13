import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    // Get user's team
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { team: true },
    });

    if (!userData?.team) {
      return successResponse([]);
    }

    // Get Rituva project
    const project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
      return successResponse([]);
    }

    // Get tasks assigned to the user (handles multiple assignments via comma-separated IDs)
    // We need to use a raw query or filter to check if userId is in the assigned_to string
    const allTasks = await prisma.task.findMany({
      where: {
        team: userData.team,
        assigned_to: {
          not: null,
        },
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

    // Filter tasks where user ID is in the comma-separated assigned_to field
    const tasks = allTasks.filter(task => {
      if (!task.assigned_to) return false;
      const assignedIds = task.assigned_to.split(',').map(id => id.trim());
      return assignedIds.includes(user.userId);
    });

    // Sort by created_at descending
    tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return successResponse(tasks);
  } catch (error) {
    console.error('[GET_ASSIGNED_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}


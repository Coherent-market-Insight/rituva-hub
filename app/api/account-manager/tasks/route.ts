import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
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
      return forbiddenResponse('Only account managers can access this endpoint');
    }

    // Account Manager sees tasks pushed to them AND tasks they've acted on
    // This allows AM to track all their tasks through the workflow
    const tasks = await prisma.task.findMany({
      where: {
        status: {
          in: ['push_to_account_manager', 'push_to_client', 'sent_for_review', 'client_completed'],
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
      orderBy: {
        updated_at: 'desc', // Show most recently updated first
      },
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('[GET_ACCOUNT_MANAGER_TASKS]', error);
    return errorResponse('Internal server error', 500);
  }
}


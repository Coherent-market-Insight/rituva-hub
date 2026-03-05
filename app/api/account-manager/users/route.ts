import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { user_role: true },
    });

    if (!userData) {
      return unauthorizedResponse('User not found');
    }

    if (userData.user_role !== 'account_manager') {
      return forbiddenResponse('Only account managers can access this endpoint');
    }

    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');

    const whereClause: any = {
      id: { not: user.userId },
    };

    if (team) {
      whereClause.team = team;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        full_name: true,
        user_role: true,
        team: true,
      },
      orderBy: {
        full_name: 'asc',
      },
    });

    return successResponse(users);
  } catch (error) {
    console.error('[GET_ACCOUNT_MANAGER_USERS]', error);
    return errorResponse('Internal server error', 500);
  }
}

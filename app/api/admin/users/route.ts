import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
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
      return forbiddenResponse('Only supervisors can access this endpoint');
    }

    if (!userData.team) {
      return errorResponse('Admin team not set', 400);
    }

    // Get all users from the same team (excluding the admin)
    const teamUsers = await prisma.user.findMany({
      where: {
        team: userData.team,
        id: { not: user.userId }, // Exclude admin
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        user_role: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return successResponse(teamUsers);
  } catch (error) {
    console.error('[GET_TEAM_USERS]', error);
    return errorResponse('Internal server error', 500);
  }
}



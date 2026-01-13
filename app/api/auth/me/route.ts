import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return unauthorizedResponse('Not authenticated');
    }

    try {
      // Get full user data
      const user = await prisma.user.findUnique({
        where: { id: tokenPayload.userId },
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          role: true,
          user_role: true,
          team: true,
          created_at: true,
        },
      });

      if (!user) {
        return unauthorizedResponse('User not found');
      }

      return successResponse(user);
    } catch (dbError: any) {
      // Handle database connection errors gracefully
      console.error('[GET_ME] Database error:', dbError);
      // If database is not configured, return unauthorized (user needs to sign in)
      if (dbError.code === 'P1001' || dbError.message?.includes('connect') || dbError.message?.includes('database')) {
        return unauthorizedResponse('Database not configured');
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[GET_ME]', error);
    return unauthorizedResponse('Invalid token');
  }
}


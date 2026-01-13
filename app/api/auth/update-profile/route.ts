import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { user_role, team } = body;

    // Build update data object
    const updateData: any = {};
    if (user_role !== undefined && user_role !== null) {
      updateData.user_role = user_role;
    }
    if (team !== undefined && team !== null) {
      updateData.team = team;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
    });

    return successResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      user_role: updatedUser.user_role || null,
      team: updatedUser.team || null,
    });
  } catch (error: any) {
    console.error('[UPDATE_PROFILE_ERROR]', error);
    // Provide more detailed error message
    if (error.code === 'P2002') {
      return errorResponse('Unique constraint violation', 400);
    }
    if (error.code === 'P2025') {
      return errorResponse('User not found', 404);
    }
    // Check if it's a column doesn't exist error
    if (error.message?.includes('Unknown column') || error.message?.includes('no such column')) {
      return errorResponse('Database schema not updated. Please run: npx prisma migrate dev', 500);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}


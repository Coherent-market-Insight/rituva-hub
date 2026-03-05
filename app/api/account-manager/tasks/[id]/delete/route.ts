import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return forbiddenResponse('Only account managers can delete tasks');
    }

    const taskId = params.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return successResponse(null, 'Task deleted successfully');
  } catch (error: any) {
    console.error('[DELETE_ACCOUNT_MANAGER_TASK]', error);
    if (error.code === 'P2025') {
      return errorResponse('Task not found', 404);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

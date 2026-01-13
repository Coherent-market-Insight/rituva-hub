import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse } from '@/lib/api-response';
import { canUserManageProjectMembers } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const projectId = params.id;

    // Get project members
    const members = await prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    return successResponse(members);
  } catch (error) {
    console.error('[GET_MEMBERS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const projectId = params.id;

    // Check permission
    const canManage = await canUserManageProjectMembers(user.userId, projectId);
    if (!canManage) return forbiddenResponse('You cannot manage project members');

    const body = await request.json();
    const { email, role } = body;

    if (!email) return errorResponse('Email is required', 400);

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return errorResponse('User not found', 404);

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return errorResponse('User is already a member', 400);
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: targetUser.id,
        role: role || 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        user_id: user.userId,
        action: 'added_member',
        entity_type: 'ProjectMember',
        entity_id: member.id,
        details: { member_email: email },
      },
    });

    return successResponse(member, 'Member added successfully');
  } catch (error) {
    console.error('[ADD_MEMBER]', error);
    return errorResponse('Internal server error', 500);
  }
}


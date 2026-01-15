import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-response';
import { canUserAccessProject } from '@/lib/authorization';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const projectId = params.id;

    // Check access
    const hasAccess = await canUserAccessProject(user.userId, projectId);
    if (!hasAccess) return forbiddenResponse();

    // Get project with all related data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            full_name: true,
            avatar_url: true,
          },
        },
        members: {
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
        },
        boards: {
          include: {
            tasks: {
              include: {
                creator: {
                  select: {
                    id: true,
                    email: true,
                    full_name: true,
                    avatar_url: true,
                  },
                },
                assignee: {
                  select: {
                    id: true,
                    email: true,
                    full_name: true,
                    avatar_url: true,
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    return successResponse(project);
  } catch (error) {
    console.error('[GET_PROJECT]', error);
    return errorResponse('Internal server error', 500);
  }
}



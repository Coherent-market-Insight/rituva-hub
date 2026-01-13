import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, errorResponse, createdResponse } from '@/lib/api-response';
import { generateSlug } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    // Get all projects where user is a member
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            user_id: user.userId,
          },
        },
      },
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
          select: {
            id: true,
            user_id: true,
            role: true,
          },
        },
        boards: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return successResponse(projects);
  } catch (error) {
    console.error('[GET_PROJECTS]', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { name, description, workspace_id } = body;

    if (!name) {
      return errorResponse('Project name is required', 400);
    }

    const slug = generateSlug(name);

    // Check if slug is unique
    const existingProject = await prisma.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      return errorResponse('Project with this name already exists', 400);
    }

    // Get or create a default workspace for the user
    let workspace;
    if (workspace_id) {
      // Use provided workspace if user has access
      const workspaceMember = await prisma.workspaceMember.findFirst({
        where: {
          workspace_id: workspace_id,
          user_id: user.userId,
        },
        include: { workspace: true },
      });

      if (!workspaceMember) {
        return errorResponse('Workspace not found or access denied', 403);
      }

      workspace = workspaceMember.workspace;
    } else {
      // Get user's first workspace or create a default one
      const userWorkspace = await prisma.workspaceMember.findFirst({
        where: { user_id: user.userId },
        include: { workspace: true },
        orderBy: { created_at: 'asc' },
      });

      if (userWorkspace) {
        workspace = userWorkspace.workspace;
      } else {
        // Create a default workspace for the user
        const workspaceSlug = generateSlug(`${user.email}-workspace`);
        workspace = await prisma.workspace.create({
          data: {
            name: 'My Workspace',
            slug: workspaceSlug,
            description: 'Default workspace',
            members: {
              create: {
                user_id: user.userId,
                role: 'owner',
              },
            },
          },
        });
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        slug,
        workspace_id: workspace.id,
        owner_id: user.userId,
        members: {
          create: {
            user_id: user.userId,
            role: 'owner',
          },
        },
        boards: {
          create: [
            { name: 'To Do', position: 1 },
            { name: 'In Progress', position: 2 },
            { name: 'In Review', position: 3 },
            { name: 'Done', position: 4 },
          ],
        },
      },
      include: {
        owner: true,
        members: true,
        boards: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: project.id,
        workspace_id: workspace.id,
        user_id: user.userId,
        action: 'created',
        entity_type: 'Project',
        entity_id: project.id,
      },
    });

    return createdResponse(project, 'Project created successfully');
  } catch (error) {
    console.error('[CREATE_PROJECT]', error);
    return errorResponse('Internal server error', 500);
  }
}


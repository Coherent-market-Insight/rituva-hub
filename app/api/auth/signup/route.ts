import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Email already registered', 400);
    }

    // Create user with email verified
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        full_name: full_name || null,
        role: 'user',
        is_email_verified: true,
      },
    });

    // Get or create default workspace
    let workspace = await prisma.workspace.findFirst({
      where: { slug: 'rituva-workspace' },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Rituva Workspace',
          slug: 'rituva-workspace',
          description: 'Default workspace for Rituva project',
        },
      });
    }

    // Get or create default "Rituva" project
    let project = await prisma.project.findFirst({
      where: { slug: 'rituva' },
    });

    if (!project) {
      // Create default project with boards
      project = await prisma.project.create({
        data: {
          name: 'Rituva',
          slug: 'rituva',
          description: 'Default project',
          workspace_id: workspace.id,
          owner_id: user.id,
          boards: {
            create: [
              { name: 'To Do', position: 1 },
              { name: 'In Progress', position: 2 },
              { name: 'In Review', position: 3 },
              { name: 'Done', position: 4 },
            ],
          },
        },
      });
    }

    // Add user to workspace if not already a member
    await prisma.workspaceMember.upsert({
      where: {
        workspace_id_user_id: {
          workspace_id: workspace.id,
          user_id: user.id,
        },
      },
      update: {},
      create: {
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'member',
      },
    });

    // Add user to project if not already a member
    await prisma.projectMember.upsert({
      where: {
        project_id_user_id: {
          project_id: project.id,
          user_id: user.id,
        },
      },
      update: {},
      create: {
        project_id: project.id,
        user_id: user.id,
        role: 'member',
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            is_email_verified: user.is_email_verified,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP_ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

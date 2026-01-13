import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type UserRole = 'super_admin' | 'user';
export type ProjectRole = 'owner' | 'lead' | 'manager' | 'member';
export type WorkspaceRole = 'owner' | 'admin' | 'member';

// Authorization Checks
export async function canUserAccessProject(userId: string, projectId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { project_members: true },
  });

  if (!user) return false;

  // Super admin can access everything
  if (user.role === 'super_admin') return true;

  // Check if user is a member of the project
  const membership = user.project_members.find((m) => m.project_id === projectId);
  return !!membership;
}

export async function canUserEditProject(userId: string, projectId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      project_members: {
        where: { project_id: projectId },
      },
    },
  });

  if (!user) return false;

  // Super admin can edit everything
  if (user.role === 'super_admin') return true;

  // Check project membership role
  const membership = user.project_members[0];
  if (!membership) return false;

  return ['owner', 'lead', 'manager'].includes(membership.role);
}

export async function canUserManageProjectMembers(userId: string, projectId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      project_members: {
        where: { project_id: projectId },
      },
    },
  });

  if (!user) return false;

  // Super admin can manage everything
  if (user.role === 'super_admin') return true;

  // Check project membership role
  const membership = user.project_members[0];
  if (!membership) return false;

  return ['owner', 'lead'].includes(membership.role);
}

export async function canUserDeleteProject(userId: string, projectId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { user_id: userId },
      },
    },
  });

  if (!project) return false;

  // Only project owner or super admin can delete
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === 'super_admin') return true;

  return project.owner_id === userId;
}

export async function canUserAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!member) {
    // Check if user is super admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.role === 'super_admin';
  }

  return true;
}

export async function canUserManageWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!member) {
    // Check if user is super admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.role === 'super_admin';
  }

  return ['owner', 'admin'].includes(member.role);
}

export async function canUserViewTask(userId: string, taskId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      board: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!task) return false;

  return canUserAccessProject(userId, task.board.project_id);
}

export async function canUserEditTask(userId: string, taskId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      board: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!task) return false;

  // User must be able to edit the project to edit tasks
  return canUserEditProject(userId, task.board.project_id);
}

// Get user role in project
export async function getUserProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
  const membership = await prisma.projectMember.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });

  return membership?.role || null;
}

// Get user role in workspace
export async function getUserWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null> {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  return membership?.role || null;
}


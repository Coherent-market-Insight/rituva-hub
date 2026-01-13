export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'super_admin' | 'user';
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  workspace_id: string;
  owner_id: string;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Board {
  id: string;
  name: string;
  project_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  board_id: string;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  due_date: Date | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'lead' | 'manager' | 'member';
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Settings, Users } from 'lucide-react';

interface Board {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  creator: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  assignee: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  owner: {
    id: string;
    email: string;
    full_name: string | null;
  };
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    user: {
      id: string;
      email: string;
      full_name: string | null;
    };
  }>;
  boards: Board[];
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Project not found');
          router.push('/dashboard');
          return;
        }
        if (res.status === 403) {
          toast.error('Access denied');
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch project');
      }
      const data = await res.json();
      setProject(data.data);

      // Initialize boards if they don't exist
      if (data.data.boards.length === 0) {
        await initializeBoards(projectId);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeBoards = async (projectId: string) => {
    try {
      // This would typically be done on project creation, but we'll handle it here
      // For now, we'll just refetch after a moment
      setTimeout(() => fetchProject(), 500);
    } catch (error) {
      console.error('Failed to initialize boards:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard || !taskTitle.trim()) {
      toast.error('Please select a board and enter a task title');
      return;
    }

    setIsCreatingTask(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          board_id: selectedBoard,
          priority: 'medium',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to create task');
        return;
      }

      toast.success('Task created successfully');
      setTaskTitle('');
      setTaskDescription('');
      setShowNewTask(false);
      setSelectedBoard(null);
      await fetchProject();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('An error occurred');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  />
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Users className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Task Form */}
        {showNewTask && (
          <div className="bg-card border rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="board">Select Board</Label>
                <select
                  id="board"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={selectedBoard || ''}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  required
                >
                  <option value="">Select a board...</option>
                  {project.boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Task description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreatingTask}>
                  {isCreatingTask ? 'Creating...' : 'Create Task'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewTask(false);
                    setTaskTitle('');
                    setTaskDescription('');
                    setSelectedBoard(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Board */}
        {project.boards.length === 0 ? (
          <div className="bg-card border-2 border-dashed rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No boards yet</p>
            <p className="text-sm text-muted-foreground">
              Boards will be created automatically when you create your first task.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Button onClick={() => setShowNewTask(!showNewTask)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.boards.map((board) => (
                <div key={board.id} className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">{board.name}</h3>
                  <div className="space-y-3 min-h-[200px]">
                    {board.tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No tasks
                      </p>
                    ) : (
                      board.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                            {task.assignee && (
                              <span className="text-xs text-muted-foreground">
                                {task.assignee.full_name || task.assignee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



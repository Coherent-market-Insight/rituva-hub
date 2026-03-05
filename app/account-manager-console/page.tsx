'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, CheckCircle2, Send, LayoutGrid, List, FileText, Upload, CheckCircle, Eye, ArrowLeftCircle, Edit, X, Save, Plus, Trash2, File as FileIcon, Paperclip, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FileUploadButton } from '@/components/ui/file-upload-button';
import { linkifyText } from '@/lib/text-utils';

interface Task {
  id: string;
  title: string;
  description: string | null;
  team: string | null;
  month: string | null;
  week: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  assigned_to: string | null;
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
  attachments?: {
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string | null;
    created_at: string;
  }[];
}

interface TeamUser {
  id: string;
  email: string;
  full_name: string | null;
  user_role: string | null;
  team: string | null;
}

const teams = [
  { value: 'consulting_advisory', label: 'Consulting and Advisory' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'brand_positioning', label: 'Brand Positioning & Thought Leadership' },
  { value: 'marketing_technology', label: 'Marketing Technology Integration & Analytics' },
  { value: 'artificial_intelligence', label: 'Artificial Intelligence Integration' },
  { value: 'content_marketing', label: 'Content Marketing and Strategy' },
  { value: 'hr_consulting', label: 'HR Consulting' },
  { value: 'it_infrastructure', label: 'IT Infrastructure Consulting' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const generateWeeks = (month: string) => {
  const monthIndex = months.indexOf(month);
  if (monthIndex === -1) return [];

  const year = new Date().getFullYear();
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const shortMonth = (d: Date) =>
    d.toLocaleString('en-US', { month: 'short' });
  const weeks: string[] = [];
  let weekStart = new Date(firstDay);

  let weekNum = 1;
  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const cappedEnd = weekEnd > lastDay ? lastDay : weekEnd;

    weeks.push(
      `Week ${weekNum} (${shortMonth(weekStart)} ${weekStart.getDate()} - ${shortMonth(cappedEnd)} ${cappedEnd.getDate()})`
    );

    weekStart = new Date(cappedEnd);
    weekStart.setDate(cappedEnd.getDate() + 1);
    weekNum++;
  }

  return weeks;
};

export default function AccountManagerConsolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  // Action state
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  // Create task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTeam, setNewTaskTeam] = useState('');
  const [newTaskMonth, setNewTaskMonth] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<'assigned' | 'push_to_project_manager' | 'work_in_progress' | 'completed'>('assigned');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [assignedToUserIds, setAssignedToUserIds] = useState<string[]>([]);
  const [newTaskUploadedFiles, setNewTaskUploadedFiles] = useState<any[]>([]);
  const [teamUsersForCreate, setTeamUsersForCreate] = useState<TeamUser[]>([]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      // Auto-refresh every 30 seconds to get latest tasks pushed by admins
      const interval = setInterval(() => {
        fetchTasks();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await res.json();
      const userData = data.data;
      
      // Redirect if user doesn't have role
      if (!userData.user_role) {
        router.push('/auth/select-role');
        return;
      }
      
      // Check if user is account manager, if not redirect
      if (userData.user_role !== 'account_manager') {
        if (userData.user_role === 'admin') {
          router.push('/admin-console');
        } else {
          router.push('/team-console');
        }
        return;
      }
      
      setUser(userData);
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/account-manager/tasks');
      if (res.ok) {
        const data = await res.json();
        const fetchedTasks = data.data || [];
        setAllTasks(fetchedTasks);
        applyFilters(fetchedTasks, filterMonth, filterWeek, filterTeam);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const applyFilters = (tasksToFilter: Task[], month: string, week: string, team: string) => {
    let filtered = [...tasksToFilter];
    
    if (month) {
      filtered = filtered.filter(task => task.month === month);
    }
    
    if (week) {
      filtered = filtered.filter(task => task.week === week);
    }
    
    if (team) {
      filtered = filtered.filter(task => task.team === team);
    }
    
    setTasks(filtered);
  };

  useEffect(() => {
    if (allTasks.length > 0 || filterMonth || filterWeek || filterTeam) {
      applyFilters(allTasks, filterMonth, filterWeek, filterTeam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterWeek, filterTeam]);

  const fetchTeamUsersForCreate = async (team: string) => {
    try {
      const res = await fetch(`/api/account-manager/users?team=${team}`);
      if (res.ok) {
        const data = await res.json();
        setTeamUsersForCreate(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch team users:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim() || !newTaskTeam || !newTaskMonth || !newTaskWeek) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingTask(true);

    try {
      const res = await fetch('/api/account-manager/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || null,
          team: newTaskTeam,
          month: newTaskMonth,
          week: newTaskWeek,
          status: newTaskStatus,
          notes: newTaskNotes || null,
          assigned_to: assignedToUserIds.length > 0 ? assignedToUserIds.join(',') : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to create task');
        return;
      }

      const result = await res.json();
      const taskId = result.data.id;

      if (newTaskUploadedFiles.length > 0) {
        for (const file of newTaskUploadedFiles) {
          await fetch(`/api/tasks/${taskId}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileSize: file.fileSize,
              fileType: file.fileType || null,
            }),
          });
        }
      }

      toast.success('Task created successfully');
      resetCreateTaskForm();
      setShowCreateTask(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('An error occurred');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const resetCreateTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskTeam('');
    setNewTaskMonth('');
    setNewTaskWeek('');
    setNewTaskStatus('assigned');
    setNewTaskNotes('');
    setAssignedToUserIds([]);
    setNewTaskUploadedFiles([]);
    setTeamUsersForCreate([]);
  };

  const handleUserSelectionChange = (userId: string, checked: boolean) => {
    if (checked) {
      setAssignedToUserIds([...assignedToUserIds, userId]);
    } else {
      setAssignedToUserIds(assignedToUserIds.filter(id => id !== userId));
    }
  };

  const handlePushToClient = async (taskId: string) => {
    setProcessingTaskId(taskId);

    try {
      const res = await fetch(`/api/account-manager/tasks/${taskId}/push-to-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to push task to client');
        return;
      }

      toast.success('Task pushed to client successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to push task to client:', error);
      toast.error('An error occurred');
    } finally {
      setProcessingTaskId(null);
    }
  };

  // Delete task state
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditNotes(task.notes || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditNotes('');
  };

  const saveEdit = async (taskId: string) => {
    setIsSavingEdit(true);

    try {
      const res = await fetch(`/api/account-manager/tasks/${taskId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          notes: editNotes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to update task');
        return;
      }

      toast.success('Task updated successfully');
      cancelEditing();
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('An error occurred');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleTakeBackFromClient = async (taskId: string) => {
    setProcessingTaskId(taskId);

    try {
      const res = await fetch(`/api/account-manager/tasks/${taskId}/take-back`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to take back task from client');
        return;
      }

      toast.success('Task taken back from client successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to take back task from client:', error);
      toast.error('An error occurred');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This will also remove it from the client side. This action cannot be undone.')) {
      return;
    }

    setDeletingTaskId(taskId);

    try {
      const res = await fetch(`/api/account-manager/tasks/${taskId}/delete`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete task');
        return;
      }

      toast.success('Task deleted successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('An error occurred');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getTeamLabel = (teamValue: string) => {
    return teams.find(t => t.value === teamValue)?.label || teamValue;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'push_to_account_manager') return 'Pending Review';
    if (status === 'push_to_client') return 'Pushed to Client';
    if (status === 'client_completed') return 'Client Completed';
    if (status === 'completed') return 'Completed';
    return 'Pending Review';
  };

  const getStatusColor = (status: string) => {
    if (status === 'push_to_client') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (status === 'client_completed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    }
    if (status === 'sent_for_review') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (status === 'push_to_account_manager') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (status === 'completed') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  // Get available weeks based on selected month
  const getAvailableWeeks = () => {
    if (filterMonth) {
      const weeksInMonth = allTasks
        .filter(t => t.month === filterMonth && t.week)
        .map(t => t.week)
        .filter(Boolean);
      return Array.from(new Set(weeksInMonth)).sort();
    }
    return Array.from(new Set(allTasks.map(t => t.week).filter(Boolean))).sort();
  };

  const availableWeeks = getAvailableWeeks();
  
  // Get available teams from tasks
  const availableTeams = Array.from(new Set(allTasks.map(t => t.team).filter(Boolean))).sort();

  // Calculate KPI metrics
  const totalTasks = tasks.length;
  const pushToAccountManagerTasks = tasks.filter(t => t.status === 'push_to_account_manager').length;
  const pushedToClientTasks = tasks.filter(t => t.status === 'push_to_client').length;
  const sentForReviewTasks = tasks.filter(t => t.status === 'sent_for_review').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Hub - Account Manager Console</h1>
            <p className="text-sm text-muted-foreground">
              View and manage tasks pushed by project managers
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Tasks Pushed to Account Manager</h2>
            <p className="text-muted-foreground mt-2">Review and manage tasks pushed by project managers</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              onClick={() => setViewMode('kanban')}
              size="sm"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-3xl font-bold">{totalTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                <p className="text-3xl font-bold">{pushToAccountManagerTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <Upload className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pushed to Client</p>
                <p className="text-3xl font-bold">{pushedToClientTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <CheckCircle className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sent for Review</p>
                <p className="text-3xl font-bold">{sentForReviewTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <Eye className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="filter-team">Filter by Team</Label>
            <select
              id="filter-team"
              className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <option value="">All Teams</option>
              {availableTeams.map((team) => (
                <option key={team} value={team}>
                  {getTeamLabel(team || '')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="filter-month">Filter by Month</Label>
            <select
              id="filter-month"
              className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              value={filterMonth}
              onChange={(e) => {
                const newMonth = e.target.value;
                setFilterMonth(newMonth);
                if (newMonth) {
                  const weeksInNewMonth = allTasks
                    .filter(t => t.month === newMonth && t.week)
                    .map(t => t.week)
                    .filter(Boolean);
                  if (!weeksInNewMonth.includes(filterWeek)) {
                    setFilterWeek('');
                  }
                } else {
                  setFilterWeek('');
                }
              }}
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="filter-week">Filter by Week</Label>
            <select
              id="filter-week"
              className="w-full px-3 py-2 border rounded-md bg-background mt-1"
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
            >
              <option value="">All Weeks</option>
              {availableWeeks.map((week, index) => (
                <option key={index} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>
          {(filterMonth || filterWeek || filterTeam) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterMonth('');
                  setFilterWeek('');
                  setFilterTeam('');
                }}
                className="mb-0"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Tasks View */}
        {tasks.length === 0 ? (
          <div className="bg-card border-2 border-dashed rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Push to Account Manager Column */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Push to Account Manager</h3>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                  {tasks.filter(t => t.status === 'push_to_account_manager').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tasks.filter(t => t.status === 'push_to_account_manager').map((task) => (
                  <div
                    key={task.id}
                    className="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {linkifyText(task.description)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.team && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                          {getTeamLabel(task.team)}
                        </span>
                      )}
                      {task.month && (
                        <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                          {task.month}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditing(task)}
                          disabled={editingTaskId === task.id}
                          className="flex-1 text-xs h-7"
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handlePushToClient(task.id)}
                          disabled={processingTaskId === task.id}
                          className="flex-1 text-xs h-7"
                          variant="default"
                          size="sm"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {processingTaskId === task.id ? '...' : 'Push'}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="w-full text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1 text-red-600" />
                        {deletingTaskId === task.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'push_to_account_manager').length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                )}
              </div>
            </div>

            {/* Push to Client Column */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Pushed to Client</h3>
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                  {tasks.filter(t => t.status === 'push_to_client').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tasks.filter(t => t.status === 'push_to_client').map((task) => (
                  <div
                    key={task.id}
                    className="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {linkifyText(task.description)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.team && (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                          {getTeamLabel(task.team)}
                        </span>
                      )}
                      {task.month && (
                        <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                          {task.month}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        onClick={() => startEditing(task)}
                        disabled={editingTaskId === task.id}
                        className="w-full text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleTakeBackFromClient(task.id)}
                        disabled={processingTaskId === task.id}
                        className="w-full text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <ArrowLeftCircle className="w-3 h-3 mr-1" />
                        {processingTaskId === task.id ? '...' : 'Take Back'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="w-full text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1 text-red-600" />
                        {deletingTaskId === task.id ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'push_to_client').length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                        {task.description && (
                          <p className="text-muted-foreground mb-3">{linkifyText(task.description)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      {task.team && (
                        <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                          {getTeamLabel(task.team)}
                        </span>
                      )}
                      {task.month && (
                        <span className="text-sm bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded">
                          {task.month}
                        </span>
                      )}
                      {task.week && (
                        <span className="text-sm bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded">
                          {task.week}
                        </span>
                      )}
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Created by</p>
                          <p className="text-sm font-medium">
                            {task.creator?.full_name || task.creator?.email || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {task.team && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Team</p>
                            <p className="text-sm font-medium">
                              {getTeamLabel(task.team)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {task.notes && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">{task.notes}</p>
                      </div>
                    )}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Paperclip className="w-4 h-4" />
                          <span>{task.attachments.length} Attachment{task.attachments.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-1">
                          {task.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                            >
                              <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate flex-1">{attachment.file_name}</span>
                              <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="ml-4 flex flex-col gap-2 min-w-[200px]">
                    <Button
                      onClick={() => startEditing(task)}
                      disabled={editingTaskId === task.id}
                      className="w-full"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Task
                    </Button>
                    {task.status !== 'push_to_client' && task.status !== 'client_completed' && (
                      <Button
                        onClick={() => handlePushToClient(task.id)}
                        disabled={processingTaskId === task.id}
                        className="w-full"
                        variant="default"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {processingTaskId === task.id ? 'Processing...' : 'Push to Client'}
                      </Button>
                    )}
                    {task.status === 'push_to_client' && (
                      <Button
                        onClick={() => handleTakeBackFromClient(task.id)}
                        disabled={processingTaskId === task.id}
                        className="w-full"
                        variant="outline"
                      >
                        <ArrowLeftCircle className="w-4 h-4 mr-2" />
                        {processingTaskId === task.id ? 'Processing...' : 'Take Back from Client'}
                      </Button>
                    )}
                    {task.status === 'client_completed' && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center">
                        Client Completed
                      </p>
                    )}
                    <Button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deletingTaskId === task.id}
                      className="w-full"
                      variant="outline"
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                      {deletingTaskId === task.id ? 'Deleting...' : 'Delete Task'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Task Modal */}
      {editingTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Task</h3>
              <Button variant="ghost" size="icon" onClick={cancelEditing}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Task description"
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => saveEdit(editingTaskId)}
                  disabled={isSavingEdit}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Task</h2>
              <button
                onClick={() => {
                  setShowCreateTask(false);
                  resetCreateTaskForm();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
              <div>
                <Label htmlFor="new-title">Task Title *</Label>
                <Input
                  id="new-title"
                  placeholder="Enter task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-description">Description</Label>
                <Input
                  id="new-description"
                  placeholder="Enter description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-team">Assign to Team *</Label>
                <select
                  id="new-team"
                  className="w-full px-3 py-2 border rounded-md bg-background mt-1"
                  value={newTaskTeam}
                  onChange={(e) => {
                    const team = e.target.value;
                    setNewTaskTeam(team);
                    setAssignedToUserIds([]);
                    if (team) {
                      fetchTeamUsersForCreate(team);
                    } else {
                      setTeamUsersForCreate([]);
                    }
                  }}
                  required
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team.value} value={team.value}>
                      {team.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-month">Month *</Label>
                  <select
                    id="new-month"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={newTaskMonth}
                    onChange={(e) => {
                      setNewTaskMonth(e.target.value);
                      setNewTaskWeek('');
                    }}
                    required
                  >
                    <option value="">Select month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="new-week">Week *</Label>
                  <select
                    id="new-week"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={newTaskWeek}
                    onChange={(e) => setNewTaskWeek(e.target.value)}
                    required
                    disabled={!newTaskMonth}
                  >
                    <option value="">Select week</option>
                    {newTaskMonth && generateWeeks(newTaskMonth).map((week, index) => (
                      <option key={index} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Status *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewTaskStatus('assigned')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newTaskStatus === 'assigned'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-border text-muted-foreground hover:border-indigo-500/50'
                    }`}
                  >
                    Assign to Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskStatus('work_in_progress')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newTaskStatus === 'work_in_progress'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                        : 'border-border text-muted-foreground hover:border-yellow-500/50'
                    }`}
                  >
                    Work in Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskStatus('push_to_project_manager')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newTaskStatus === 'push_to_project_manager'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-border text-muted-foreground hover:border-blue-500/50'
                    }`}
                  >
                    Push to PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskStatus('completed')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newTaskStatus === 'completed'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'border-border text-muted-foreground hover:border-green-500/50'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {newTaskTeam && (
                <div>
                  <Label>Assign to Members (Optional)</Label>
                  <div className="mt-2 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                    {teamUsersForCreate.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members found in this team</p>
                    ) : (
                      <div className="space-y-2">
                        {teamUsersForCreate.map((teamUser) => (
                          <label key={teamUser.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={assignedToUserIds.includes(teamUser.id)}
                              onChange={(e) => handleUserSelectionChange(teamUser.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">
                              {teamUser.full_name || teamUser.email}
                            </span>
                            {teamUser.user_role && (
                              <span className="text-xs text-muted-foreground">
                                ({teamUser.user_role})
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {assignedToUserIds.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignedToUserIds.length} user{assignedToUserIds.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="new-notes">Notes</Label>
                <textarea
                  id="new-notes"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                  placeholder="Add any notes..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                />
              </div>

              <div>
                <Label>File Attachments (Optional)</Label>
                <div className="mt-2">
                  <FileUploadButton
                    endpoint="taskAttachment"
                    onUploadComplete={(files) => {
                      setNewTaskUploadedFiles([...newTaskUploadedFiles, ...files]);
                    }}
                    disabled={isCreatingTask}
                  />
                </div>
                {newTaskUploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    {newTaskUploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{file.fileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewTaskUploadedFiles(newTaskUploadedFiles.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={isCreatingTask} className="flex-1">
                  {isCreatingTask ? 'Creating...' : 'Create Task'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateTask(false);
                    resetCreateTaskForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


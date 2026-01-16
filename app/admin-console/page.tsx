'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, CheckCircle2, Plus, X, Edit, Trash2, LayoutGrid, List, FileText, Upload, CheckCircle, Eye, Download, File as FileIcon, Paperclip } from 'lucide-react';
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
  assigned_users?: { // For multiple assignments
    id: string;
    email: string;
    full_name: string | null;
  }[];
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

// Generate weeks for a month (simplified - you may want to make this more dynamic)
const generateWeeks = (month: string) => {
  return [
    `Week 1 (Dec 28 - Jan 3)`,
    `Week 2 (Jan 4 - Jan 10)`,
    `Week 3 (Jan 11 - Jan 17)`,
    `Week 4 (Jan 18 - Jan 24)`,
    `Week 5 (Jan 25 - Jan 31)`,
  ];
};

export default function AdminConsolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'homepage'>('homepage');
  
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('');
  
  // Create task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [taskStatus, setTaskStatus] = useState<'assigned' | 'push_to_project_manager'>('assigned');
  const [taskNotes, setTaskNotes] = useState('');
  const [assignedToUserIds, setAssignedToUserIds] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTeamUsers();
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
      
      // Check if user is admin, if not redirect
      if (userData.user_role !== 'admin') {
        router.push('/team-console');
        return;
      }
      
      // If admin doesn't have team, redirect to team selection
      if (!userData.team) {
        router.push('/auth/select-team');
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
      const res = await fetch('/api/admin/tasks');
      if (res.ok) {
        const data = await res.json();
        const fetchedTasks = data.data || [];
        setAllTasks(fetchedTasks);
        applyFilters(fetchedTasks, filterMonth, filterWeek);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchTeamUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setTeamUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch team users:', error);
    }
  };

  const applyFilters = (tasksToFilter: Task[], month: string, week: string) => {
    let filtered = [...tasksToFilter];
    
    if (month) {
      filtered = filtered.filter(task => task.month === month);
    }
    
    if (week) {
      filtered = filtered.filter(task => task.week === week);
    }
    
    setTasks(filtered);
  };

  useEffect(() => {
    if (allTasks.length > 0 || filterMonth || filterWeek) {
      applyFilters(allTasks, filterMonth, filterWeek);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterWeek]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle.trim() || !selectedMonth || !selectedWeek) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingTask(true);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          month: selectedMonth,
          week: selectedWeek,
          status: taskStatus,
          notes: taskNotes || null,
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

      // Save file attachments if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setSelectedMonth(task.month || '');
    setSelectedWeek(task.week || '');
    setTaskStatus(task.status === 'push_to_project_manager' ? 'push_to_project_manager' : 'assigned');
    setTaskNotes(task.notes || '');
    // Parse assigned_to if it's comma-separated
    if (task.assigned_to) {
      setAssignedToUserIds(task.assigned_to.split(',').filter(Boolean));
    } else {
      setAssignedToUserIds([]);
    }
    setShowCreateTask(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask || !taskTitle.trim() || !selectedMonth || !selectedWeek) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdatingTask(true);

    try {
      const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          month: selectedMonth,
          week: selectedWeek,
          status: taskStatus,
          notes: taskNotes || null,
          assigned_to: assignedToUserIds.length > 0 ? assignedToUserIds.join(',') : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to update task');
        return;
      }

      // Save file attachments if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await fetch(`/api/tasks/${editingTask.id}/attachments`, {
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

      toast.success('Task updated successfully');
      resetCreateTaskForm();
      setEditingTask(null);
      setShowCreateTask(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('An error occurred');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setDeletingTaskId(taskId);

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
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

  const resetCreateTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedMonth('');
    setSelectedWeek('');
    setTaskStatus('assigned');
    setTaskNotes('');
    setAssignedToUserIds([]);
    setUploadedFiles([]);
    setEditingTask(null);
  };

  const handleUserSelectionChange = (userId: string, checked: boolean) => {
    if (checked) {
      setAssignedToUserIds([...assignedToUserIds, userId]);
    } else {
      setAssignedToUserIds(assignedToUserIds.filter(id => id !== userId));
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
    if (status === 'assigned') return 'Assigned to Team';
    if (status === 'sent_for_review_by_pm') return 'Sent for Review (PM)';
    if (status === 'sent_for_review') return 'Sent for Review (AM)';
    if (status === 'push_to_account_manager') return 'Push to AM';
    if (status === 'push_to_project_manager') return 'Push to PM';
    if (status === 'push_to_client') return 'Pushed to Client';
    if (status === 'client_completed') return 'Client Completed';
    if (status === 'completed') return 'Completed';
    if (status === 'work_in_progress' || status === 'pending') return 'Work in Progress';
    return 'Assigned';
  };

  const getStatusColor = (status: string) => {
    if (status === 'assigned') {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
    if (status === 'sent_for_review_by_pm') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
    if (status === 'sent_for_review') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (status === 'push_to_account_manager') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (status === 'push_to_project_manager') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (status === 'push_to_client') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (status === 'client_completed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    }
    if (status === 'completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (status === 'work_in_progress' || status === 'pending') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  };

  // Parse assigned users from comma-separated string
  const getAssignedUsers = (task: Task) => {
    if (!task.assigned_to) return [];
    const userIds = task.assigned_to.split(',').filter(Boolean);
    return teamUsers.filter(user => userIds.includes(user.id));
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

  // Calculate KPI metrics
  const totalTasks = tasks.length;
  const assignedTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'work_in_progress' || t.status === 'pending' || t.status === 'sent_for_review').length;
  const pushToPMTasks = tasks.filter(t => t.status === 'push_to_project_manager' || t.status === 'push_to_account_manager' || t.status === 'push_to_client').length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'client_completed').length;
  const unassignedTasks = tasks.filter(t => !t.assigned_to || t.assigned_to.trim() === '').length;

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
            <h1 className="text-2xl font-bold">Project Hub - Supervisor Console</h1>
            <p className="text-sm text-muted-foreground">
              {user?.team ? `${getTeamLabel(user.team)} Team` : 'Supervisor Console'}
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
        {/* Main Content */}
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Team Tasks</h2>
                <p className="text-muted-foreground mt-2">View and manage tasks for team members</p>
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
                <p className="text-sm text-muted-foreground mb-1">Assigned to Team</p>
                <p className="text-3xl font-bold">{assignedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <Upload className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Push to PM</p>
                <p className="text-3xl font-bold">{pushToPMTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <Upload className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold">{completedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <CheckCircle className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
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
          {(filterMonth || filterWeek) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterMonth('');
                  setFilterWeek('');
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assigned to Team Column */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Assigned to Team</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'assigned' || t.status === 'work_in_progress' || t.status === 'pending').length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {tasks.filter(t => t.status === 'assigned' || t.status === 'work_in_progress' || t.status === 'pending').map((task) => (
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
                          {task.month && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.month}
                            </span>
                          )}
                          {task.week && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.week}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="h-6 w-6"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'assigned' || t.status === 'work_in_progress' || t.status === 'pending').length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                    )}
                  </div>
                </div>

                {/* Push to Project Manager Column */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Push to Project Manager</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'push_to_project_manager' || t.status === 'push_to_account_manager' || t.status === 'push_to_client').length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {tasks.filter(t => t.status === 'push_to_project_manager' || t.status === 'push_to_account_manager' || t.status === 'push_to_client').map((task) => (
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
                          {task.month && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.month}
                            </span>
                          )}
                          {task.week && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.week}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="h-6 w-6"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'push_to_project_manager' || t.status === 'push_to_account_manager' || t.status === 'push_to_client').length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                    )}
                  </div>
                </div>

                {/* Completed Column */}
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Completed</h3>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'completed' || t.status === 'client_completed').length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {tasks.filter(t => t.status === 'completed' || t.status === 'client_completed').map((task) => (
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
                          {task.month && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.month}
                            </span>
                          )}
                          {task.week && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-1.5 py-0.5 rounded">
                              {task.week}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="h-6 w-6"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'completed' || t.status === 'client_completed').length === 0 && (
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
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned to</p>
                          <div className="text-sm font-medium">
                            {(() => {
                              const assignedUsers = getAssignedUsers(task);
                              if (assignedUsers.length === 0) {
                                return <span>Unassigned</span>;
                              }
                              if (assignedUsers.length === 1) {
                                return <span>{assignedUsers[0].full_name || assignedUsers[0].email}</span>;
                              }
                              return (
                                <div>
                                  {assignedUsers.map((user, idx) => (
                                    <span key={user.id}>
                                      {user.full_name || user.email}
                                      {idx < assignedUsers.length - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
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
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deletingTaskId === task.id}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </>

      </main>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
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

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="p-6 space-y-6">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month *</Label>
                  <select
                    id="month"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setSelectedWeek('');
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
                  <Label htmlFor="week">Week *</Label>
                  <select
                    id="week"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    required
                    disabled={!selectedMonth}
                  >
                    <option value="">Select week</option>
                    {selectedMonth && generateWeeks(selectedMonth).map((week, index) => (
                      <option key={index} value={week}>
                        {week}
                      </option>
                    ))}
                  </select>
                  </div>
                </div>

              <div>
                <Label>Status *</Label>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setTaskStatus('assigned')}
                    className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                      taskStatus === 'assigned'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-border text-muted-foreground hover:border-indigo-500/50'
                    }`}
                  >
                    Assign to Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskStatus('push_to_project_manager')}
                    className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                      taskStatus === 'push_to_project_manager'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-border text-muted-foreground hover:border-blue-500/50'
                    }`}
                  >
                    Push to PM
                  </button>
              </div>
              </div>

              <div>
                <Label htmlFor="assign-to">Assign to (Optional - Multiple Selection)</Label>
                <div className="mt-2 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                  {teamUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No team members available</p>
                  ) : (
                    <div className="space-y-2">
                      {teamUsers.map((teamUser) => (
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

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                  placeholder="Add any notes..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                />
              </div>

              <div>
                <Label>File Attachments (Optional)</Label>
                <div className="mt-2">
                  <FileUploadButton
                    endpoint="taskAttachment"
                    onUploadComplete={(files) => {
                      setUploadedFiles([...uploadedFiles, ...files]);
                    }}
                    disabled={isCreatingTask || isUpdatingTask}
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{file.fileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={isCreatingTask || isUpdatingTask} className="flex-1">
                  {isCreatingTask || isUpdatingTask
                    ? editingTask
                      ? 'Updating...'
                      : 'Creating...'
                    : editingTask
                    ? 'Update Task'
                    : 'Create Task'}
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


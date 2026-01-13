'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X, LogOut, Edit, Trash2, FileText, User as UserIcon, Clock, CheckCircle } from 'lucide-react';

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
}

const teams = [
  { value: 'website_development', label: 'Website Development' },
  { value: 'artificial_intelligence', label: 'Artificial Intelligence' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'human_resources', label: 'Human Resources' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate weeks for a month (simplified - you may want to make this more dynamic)
const generateWeeks = (month: string) => {
  // This is a simplified version - you'd want to calculate actual weeks based on the month
  return [
    `Week 1 (Dec 28 - Jan 3)`,
    `Week 2 (Jan 4 - Jan 10)`,
    `Week 3 (Jan 11 - Jan 17)`,
    `Week 4 (Jan 18 - Jan 24)`,
    `Week 5 (Jan 25 - Jan 31)`,
  ];
};

export default function TeamConsolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store all tasks for filtering
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'assigned-tasks'>('my-tasks');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isEditingAssignedTask, setIsEditingAssignedTask] = useState(false);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('');

  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [taskStatus, setTaskStatus] = useState<'work_in_progress' | 'completed'>('work_in_progress');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchAssignedTasks();
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
      
      // Redirect if user doesn't have role or team
      if (!userData.user_role) {
        router.push('/auth/select-role');
        return;
      }
      if (!userData.team) {
        router.push('/auth/select-team');
        return;
      }
      // If user is admin, redirect to admin console
      if (userData.user_role === 'admin') {
        router.push('/admin-console');
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
      const res = await fetch('/api/team/tasks');
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

  const fetchAssignedTasks = async () => {
    try {
      const res = await fetch('/api/team/assigned-tasks');
      if (res.ok) {
        const data = await res.json();
        setAssignedTasks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assigned tasks:', error);
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
      const res = await fetch('/api/team/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          month: selectedMonth,
          week: selectedWeek,
          status: taskStatus,
          notes: taskNotes || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to create task');
        return;
      }

      toast.success('Task created successfully');
      resetForm();
      setShowAddTask(false);
      await fetchTasks();
      await fetchAssignedTasks();
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
    setTaskStatus((task.status === 'completed' ? 'completed' : 'work_in_progress') as 'work_in_progress' | 'completed');
    setTaskNotes(task.notes || '');
    setIsEditingAssignedTask(false);
    setShowAddTask(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask || !taskTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For assigned tasks, only month and week are optional
    if (!isEditingAssignedTask && (!selectedMonth || !selectedWeek)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdatingTask(true);

    try {
      // Use different endpoint for assigned tasks
      const endpoint = isEditingAssignedTask 
        ? `/api/team/assigned-tasks/${editingTask.id}`
        : `/api/team/tasks/${editingTask.id}`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription || null,
          month: selectedMonth || editingTask.month || null,
          week: selectedWeek || editingTask.week || null,
          status: taskStatus,
          notes: taskNotes || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to update task');
        return;
      }

      toast.success('Task updated successfully');
      resetForm();
      setEditingTask(null);
      setIsEditingAssignedTask(false);
      setShowAddTask(false);
      await fetchTasks();
      await fetchAssignedTasks();
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
      const res = await fetch(`/api/team/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete task');
        return;
      }

      toast.success('Task deleted successfully');
      await fetchTasks();
      await fetchAssignedTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('An error occurred');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedMonth('');
    setSelectedWeek('');
    setTaskStatus('work_in_progress');
    setTaskNotes('');
    setEditingTask(null);
    setIsEditingAssignedTask(false);
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

  const getStatusColor = (status: string) => {
    if (status === 'sent_for_review') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (status === 'push_to_account_manager') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    // Legacy statuses
    if (status === 'completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'completed') return 'Completed';
    if (status === 'work_in_progress' || status === 'pending') return 'Work in Progress';
    if (status === 'sent_for_review') return 'Sent for Review';
    if (status === 'push_to_account_manager') return 'Push to Account Manager';
    return 'Work in Progress'; // Default
  };

  // Get unique months and weeks from all tasks for filter options
  // This ensures filters work for all teams
  const availableMonths = Array.from(new Set(allTasks.map(t => t.month).filter(Boolean))).sort();
  
  // Get available weeks based on selected month, or all weeks if no month selected
  const getAvailableWeeks = () => {
    if (filterMonth) {
      // If month is selected, show weeks for that month from actual tasks
      const weeksInMonth = allTasks
        .filter(t => t.month === filterMonth && t.week)
        .map(t => t.week)
        .filter(Boolean);
      return Array.from(new Set(weeksInMonth)).sort();
    }
    // If no month selected, show all unique weeks from all tasks
    return Array.from(new Set(allTasks.map(t => t.week).filter(Boolean))).sort();
  };
  
  const availableWeeks = getAvailableWeeks();

  // Calculate KPI metrics - based on active tab
  const displayTasks = activeTab === 'my-tasks' ? tasks : assignedTasks;
  const totalTasks = displayTasks.length;
  const assignedTasksCount = assignedTasks.length;
  const workInProgressTasks = displayTasks.filter(t => 
    t.status === 'push_to_account_manager' || 
    t.status === 'work_in_progress' || 
    t.status === 'pending'
  ).length;
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;

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
            <h1 className="text-2xl font-bold">Project Hub</h1>
            <p className="text-sm text-muted-foreground">
              {user?.team ? getTeamLabel(user.team) : 'Team Console'}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            <p className="text-muted-foreground mt-2">View and manage your tasks</p>
          </div>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('my-tasks')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'my-tasks'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Created Tasks
          </button>
          <button
            onClick={() => setActiveTab('assigned-tasks')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'assigned-tasks'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Assigned Tasks ({assignedTasks.length})
          </button>
        </div>

        {/* Filters - Only show for My Tasks tab */}
        {activeTab === 'my-tasks' && (
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
                // Reset week when month changes, but keep it if the week is still valid
                if (newMonth) {
                  // Check if current week is still valid for the new month
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
        )}

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
                <p className="text-sm text-muted-foreground mb-1">Assigned Tasks</p>
                <p className="text-3xl font-bold">{assignedTasksCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <UserIcon className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Work in Progress</p>
                <p className="text-3xl font-bold">{workInProgressTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border">
                <Clock className="w-6 h-6 text-foreground" />
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

        {/* Tasks List - My Created Tasks */}
        {activeTab === 'my-tasks' && (
          <>
            {tasks.length === 0 ? (
              <div className="bg-card border-2 border-dashed rounded-lg p-12 text-center">
                <p className="text-muted-foreground mb-4">No tasks yet</p>
                <Button onClick={() => setShowAddTask(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
              <div key={task.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
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
                    {task.notes && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">{task.notes}</p>
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
        )}

        {/* Assigned Tasks Tab */}
        {activeTab === 'assigned-tasks' && (
          <>
            {assignedTasks.length === 0 ? (
              <div className="bg-card border-2 border-dashed rounded-lg p-12 text-center">
                <p className="text-muted-foreground mb-4">No assigned tasks yet</p>
                <p className="text-sm text-muted-foreground">
                  Tasks assigned to you by your team admin will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTasks.map((task) => (
                  <div key={task.id} className="bg-card border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                            Assigned
                          </span>
                          {task.status === 'sent_for_review' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded font-semibold">
                              ⚠️ Marked for Review by Admin
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-muted-foreground mb-3">{task.description}</p>
                        )}
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
                        {task.creator && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Created by: {task.creator.full_name || task.creator.email}
                          </p>
                        )}
                        {task.notes && (
                          <div className="mt-3 p-3 bg-muted rounded">
                            <p className="text-sm text-muted-foreground">{task.notes}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Assigned on {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTask(task);
                            setTaskTitle(task.title);
                            setTaskDescription(task.description || '');
                            setSelectedMonth(task.month || '');
                            setSelectedWeek(task.week || '');
                            setTaskStatus(task.status === 'completed' ? 'completed' : 'work_in_progress');
                            setTaskNotes(task.notes || '');
                            setIsEditingAssignedTask(true);
                            setShowAddTask(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  resetForm();
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
                  <Label htmlFor="month">Month {!isEditingAssignedTask && '*'}</Label>
                  <select
                    id="month"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setSelectedWeek(''); // Reset week when month changes
                    }}
                    required={!isEditingAssignedTask}
                    disabled={isEditingAssignedTask}
                  >
                    <option value="">Select month</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {isEditingAssignedTask && (
                    <p className="text-xs text-muted-foreground mt-1">Month and week are set by admin</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="week">Week {!isEditingAssignedTask && '*'}</Label>
                  <select
                    id="week"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    required={!isEditingAssignedTask}
                    disabled={!selectedMonth || isEditingAssignedTask}
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
                    onClick={() => setTaskStatus('work_in_progress')}
                    className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                      taskStatus === 'work_in_progress'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'border-border text-muted-foreground hover:border-blue-500/50'
                    }`}
                  >
                    Work in Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskStatus('completed')}
                    className={`flex-1 p-3 border-2 rounded-lg transition-all ${
                      taskStatus === 'completed'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'border-border text-muted-foreground hover:border-green-500/50'
                    }`}
                  >
                    Completed
                  </button>
                </div>
                {isEditingAssignedTask && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You can change the status to completed when you finish the assigned task.
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
                    setShowAddTask(false);
                    resetForm();
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


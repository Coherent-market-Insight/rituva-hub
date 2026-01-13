'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, CheckCircle2, Send, ArrowLeft, LayoutGrid, List, FileText, Upload, CheckCircle, Eye, ArrowLeftCircle } from 'lucide-react';

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

  const handlePushBackForReview = async (taskId: string) => {
    setProcessingTaskId(taskId);

    try {
      const res = await fetch(`/api/account-manager/tasks/${taskId}/push-back-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to push task back for review');
        return;
      }

      toast.success('Task pushed back for review successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to push task back for review:', error);
      toast.error('An error occurred');
    } finally {
      setProcessingTaskId(null);
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
    if (status === 'sent_for_review') return 'Sent for Admin Review';
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
              View and manage tasks pushed by team admins
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
            <p className="text-muted-foreground mt-2">Review and manage tasks pushed by team admins</p>
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
                        {task.description}
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
                    <div className="flex gap-2 mt-3">
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
                      <Button
                        onClick={() => handlePushBackForReview(task.id)}
                        disabled={processingTaskId === task.id}
                        className="flex-1 text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        {processingTaskId === task.id ? '...' : 'Review'}
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
                        {task.description}
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
                    <Button
                      onClick={() => handleTakeBackFromClient(task.id)}
                      disabled={processingTaskId === task.id}
                      className="w-full text-xs h-7 mt-2"
                      variant="outline"
                      size="sm"
                    >
                      <ArrowLeftCircle className="w-3 h-3 mr-1" />
                      {processingTaskId === task.id ? '...' : 'Take Back'}
                    </Button>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'push_to_client').length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                )}
              </div>
            </div>

            {/* Sent for Review Column */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Sent for Review</h3>
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                  {tasks.filter(t => t.status === 'sent_for_review').length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tasks.filter(t => t.status === 'sent_for_review').map((task) => (
                  <div
                    key={task.id}
                    className="bg-background border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
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
                    <div className="flex gap-2 mt-3">
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
                      <Button
                        onClick={() => handlePushBackForReview(task.id)}
                        disabled={processingTaskId === task.id}
                        className="flex-1 text-xs h-7"
                        variant="outline"
                        size="sm"
                      >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        {processingTaskId === task.id ? '...' : 'Review'}
                      </Button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'sent_for_review').length === 0 && (
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
                          <p className="text-muted-foreground mb-3">{task.description}</p>
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
                    <p className="text-xs text-muted-foreground mt-3">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2 min-w-[200px]">
                    {task.status === 'push_to_account_manager' && (
                      <>
                        <Button
                          onClick={() => handlePushToClient(task.id)}
                          disabled={processingTaskId === task.id}
                          className="w-full"
                          variant="default"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {processingTaskId === task.id ? 'Processing...' : 'Push to Client'}
                        </Button>
                        <Button
                          onClick={() => handlePushBackForReview(task.id)}
                          disabled={processingTaskId === task.id}
                          className="w-full"
                          variant="outline"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {processingTaskId === task.id ? 'Processing...' : 'Push Back for Review'}
                        </Button>
                      </>
                    )}
                    {task.status === 'sent_for_review' && (
                      <>
                        <Button
                          onClick={() => handlePushToClient(task.id)}
                          disabled={processingTaskId === task.id}
                          className="w-full"
                          variant="default"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {processingTaskId === task.id ? 'Processing...' : 'Push to Client'}
                        </Button>
                        <Button
                          onClick={() => handlePushBackForReview(task.id)}
                          disabled={processingTaskId === task.id}
                          className="w-full"
                          variant="outline"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {processingTaskId === task.id ? 'Processing...' : 'Push Back for Review'}
                        </Button>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center mt-1">
                          ⚠️ Currently marked for review
                        </p>
                      </>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}


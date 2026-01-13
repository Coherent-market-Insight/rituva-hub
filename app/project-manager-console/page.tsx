'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, CheckCircle2, ArrowLeft, FileText, Eye } from 'lucide-react';

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

export default function ProjectManagerConsolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  
  // Action state
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      // Auto-refresh every 30 seconds to get latest tasks
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
      
      // Check if user is project manager, if not redirect
      if (userData.user_role !== 'project_manager') {
        if (userData.user_role === 'admin') {
          router.push('/admin-console');
        } else if (userData.user_role === 'account_manager') {
          router.push('/account-manager-console');
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
      const res = await fetch('/api/project-manager/tasks');
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

  const handleSendBackForReview = async (taskId: string) => {
    setProcessingTaskId(taskId);

    try {
      const res = await fetch(`/api/project-manager/tasks/${taskId}/send-back-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to send task back for review');
        return;
      }

      toast.success('Task sent back to admin for review successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to send task back for review:', error);
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
    if (status === 'sent_for_review') return 'Sent by AM';
    if (status === 'sent_for_review_by_pm') return 'Pushed to Admin';
    if (status === 'client_completed') return 'Client Completed';
    return 'Pending Review';
  };

  const getStatusColor = (status: string) => {
    if (status === 'push_to_account_manager') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (status === 'push_to_client') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (status === 'sent_for_review') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (status === 'sent_for_review_by_pm') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
    if (status === 'client_completed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
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
  const sentForReviewTasks = tasks.filter(t => t.status === 'sent_for_review_by_pm').length;

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
            <h1 className="text-2xl font-bold">Project Hub - Project Manager Console</h1>
            <p className="text-sm text-muted-foreground">
              Review and push tasks back to admin
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Tasks to Review</h2>
          <p className="text-muted-foreground mt-2">Review tasks and push back to admin for action</p>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="bg-card border-2 border-dashed rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        ) : (
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
                    {task.status !== 'sent_for_review_by_pm' && task.status !== 'client_completed' ? (
                      <Button
                        onClick={() => handleSendBackForReview(task.id)}
                        disabled={processingTaskId === task.id}
                        className="w-full"
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {processingTaskId === task.id ? 'Processing...' : 'Push Back to Admin'}
                      </Button>
                    ) : task.status === 'sent_for_review_by_pm' ? (
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        ✓ Pushed to Admin
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Client Completed
                      </p>
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


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User, CheckCircle2, Check, FileText, Clock, CheckCircle, Search, X, File as FileIcon, Paperclip, Download } from 'lucide-react';
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

export default function ClientConsolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Action state
  const [markingDoneTaskId, setMarkingDoneTaskId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

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
      
      // Redirect if user doesn't have role or is not client
      if (!userData.user_role || userData.user_role !== 'client') {
        if (userData.user_role === 'admin') {
          router.push('/admin-console');
        } else if (userData.user_role === 'account_manager') {
          router.push('/account-manager-console');
        } else if (userData.user_role === 'project_manager') {
          router.push('/project-manager-console');
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
      const res = await fetch('/api/client/tasks');
      if (res.ok) {
        const data = await res.json();
        const fetchedTasks = data.data || [];
        setAllTasks(fetchedTasks);
        applyFilters(fetchedTasks, filterMonth, filterWeek, filterTeam, searchQuery);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const applyFilters = (tasksToFilter: Task[], month: string, week: string, team: string, search: string) => {
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
    
    // Search filter - searches title, description, notes, team, month, week
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
        const notesMatch = task.notes?.toLowerCase().includes(searchLower);
        const teamMatch = task.team?.toLowerCase().includes(searchLower);
        const teamLabelMatch = getTeamLabel(task.team || '').toLowerCase().includes(searchLower);
        const monthMatch = task.month?.toLowerCase().includes(searchLower);
        const weekMatch = task.week?.toLowerCase().includes(searchLower);
        const creatorMatch = task.creator?.full_name?.toLowerCase().includes(searchLower) || 
                            task.creator?.email?.toLowerCase().includes(searchLower);
        
        return titleMatch || descriptionMatch || notesMatch || teamMatch || teamLabelMatch || 
               monthMatch || weekMatch || creatorMatch;
      });
    }
    
    setTasks(filtered);
  };

  useEffect(() => {
    if (allTasks.length > 0 || filterMonth || filterWeek || filterTeam || searchQuery) {
      applyFilters(allTasks, filterMonth, filterWeek, filterTeam, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterWeek, filterTeam, searchQuery]);

  const handleMarkAsDone = async (taskId: string) => {
    setMarkingDoneTaskId(taskId);

    try {
      const res = await fetch(`/api/client/tasks/${taskId}/mark-done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to mark task as done');
        return;
      }

      toast.success('Task marked as done');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to mark task as done:', error);
      toast.error('An error occurred');
    } finally {
      setMarkingDoneTaskId(null);
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
    if (status === 'client_completed') return 'Completed';
    if (status === 'push_to_client') return 'Pending';
    return 'Pending';
  };

  const getStatusColor = (status: string) => {
    if (status === 'client_completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
  const completedTasks = tasks.filter(t => t.status === 'client_completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'push_to_client').length;

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
            <h1 className="text-2xl font-bold">Project Hub - Client Console</h1>
            <p className="text-sm text-muted-foreground">
              View tasks pushed by account manager
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
          <h2 className="text-3xl font-bold">Tasks Pushed to Client</h2>
          <p className="text-muted-foreground mt-2">Review and mark tasks as done</p>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold">{pendingTasks}</p>
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

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search">Search Tasks</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by title, description, notes, team, month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              Found {tasks.length} result{tasks.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
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
          {(filterMonth || filterWeek || filterTeam || searchQuery) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterMonth('');
                  setFilterWeek('');
                  setFilterTeam('');
                  setSearchQuery('');
                }}
                className="mb-0"
              >
                Clear All
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

                  <div className="ml-4 flex items-start">
                    {task.status === 'push_to_client' && (
                      <button
                        onClick={() => handleMarkAsDone(task.id)}
                        disabled={markingDoneTaskId === task.id}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark as done"
                      >
                        {markingDoneTaskId === task.id ? (
                          <span className="text-sm">...</span>
                        ) : (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </button>
                    )}
                    {task.status === 'client_completed' && (
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
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


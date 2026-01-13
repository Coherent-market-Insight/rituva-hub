'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        
        // Redirect based on user setup
        if (data.data.user_role === 'admin' && data.data.team) {
          router.push('/admin-console');
          return;
        } else if (data.data.user_role === 'account_manager') {
          router.push('/account-manager-console');
          return;
        } else if (data.data.user_role === 'project_manager') {
          router.push('/project-manager-console');
          return;
        } else if (data.data.user_role === 'client') {
          router.push('/client-console');
          return;
        } else if (data.data.team) {
          router.push('/team-console');
          return;
        } else if (!data.data.user_role) {
          router.push('/auth/select-role');
          return;
        } else if (!data.data.team && data.data.user_role !== 'account_manager' && data.data.user_role !== 'project_manager' && data.data.user_role !== 'client') {
          router.push('/auth/select-team');
          return;
        }
        
        // Only set user if we're not redirecting
        setUser(data.data);
        setIsLoading(false);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    fetchUser();
  }, [router]);


  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

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
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Rituva Project</h2>
          <p className="text-muted-foreground mb-6">Welcome to your project workspace</p>
          <Button onClick={() => router.push('/team-console')}>
            Go to Team Console
          </Button>
        </div>
      </main>
    </div>
  );
}


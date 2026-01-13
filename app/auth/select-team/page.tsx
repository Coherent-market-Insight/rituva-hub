'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

const teams = [
  { value: 'website_development', label: 'Website Development' },
  { value: 'artificial_intelligence', label: 'Artificial Intelligence' },
  { value: 'market_research', label: 'Market Research' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'human_resources', label: 'Human Resources' },
];

export default function SelectTeamPage() {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user already has a team and redirect accordingly
  useEffect(() => {
    const checkUserTeam = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          window.location.href = '/auth/login';
          return;
        }
        const data = await res.json();
        const user = data.data;

        // If user doesn't have a role, redirect to role selection
        if (!user.user_role) {
          window.location.href = '/auth/select-role';
          return;
        }

        // Account managers and project managers don't need a team, redirect to their console
        if (user.user_role === 'account_manager') {
          window.location.href = '/account-manager-console';
          return;
        }
        if (user.user_role === 'project_manager') {
          window.location.href = '/project-manager-console';
          return;
        }

        // If user already has a team, redirect to their console
        if (user.team) {
          if (user.user_role === 'admin') {
            window.location.href = '/admin-console';
            return;
          } else {
            window.location.href = '/team-console';
            return;
          }
        }
        setIsChecking(false);
      } catch (error) {
        window.location.href = '/auth/login';
      }
    };

    // Add a small delay to ensure any previous updates are saved
    const timer = setTimeout(() => {
      checkUserTeam();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    if (!selectedTeam) {
      toast.error('Please select a team');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: selectedTeam }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update team');
        return;
      }

      toast.success('Profile setup complete!');
      // Fetch user data to check role and redirect accordingly
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data.user_role === 'admin') {
            window.location.href = '/admin-console';
          } else {
            window.location.href = '/team-console';
          }
        } else {
          window.location.href = '/team-console';
        }
      } catch {
        window.location.href = '/team-console';
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Which team are you from?</h1>
        </div>

        <div className="space-y-3">
          {teams.map((team) => (
            <button
              key={team.value}
              type="button"
              onClick={() => setSelectedTeam(team.value)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                selectedTeam === team.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-border hover:border-green-500/50'
              }`}
            >
              <span className="font-medium">{team.label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="w-full"
          disabled={!selectedTeam || isLoading}
          type="button"
        >
          {isLoading ? 'Continuing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const roles = [
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'admin', label: 'Supervisor' },
  { value: 'user', label: 'Executioner' },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user already has a role and redirect accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const data = await res.json();
        const user = data.data;

        // If user already has a role, redirect based on their setup
        if (user.user_role) {
          if (user.user_role === 'admin' && user.team) {
            router.push('/admin-console');
            return;
          } else if (user.team) {
            router.push('/team-console');
            return;
          } else {
            // Has role but no team, go to team selection
            router.push('/auth/select-team');
            return;
          }
        }
        setIsChecking(false);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    checkUserRole();
  }, [router]);

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update role');
        setIsLoading(false);
        return;
      }

      toast.success('Role updated successfully!');
      // Use window.location for more reliable navigation
      window.location.href = '/auth/select-team';
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('An error occurred. Please try again.');
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
          <h1 className="text-3xl font-bold">Project Hub</h1>
          <p className="text-muted-foreground mt-2">What is your role?</p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                selectedRole === role.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="font-medium">{role.label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="w-full"
          disabled={!selectedRole || isLoading}
          type="button"
        >
          {isLoading ? 'Continuing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}


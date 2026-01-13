'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle signup form submission
  const handleSignupForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        return;
      }

      toast.success('Account created successfully!');
      // Wait a moment for the cookie to be set, then check if user needs role/team selection
      setTimeout(async () => {
        try {
          const userRes = await fetch('/api/auth/me');
          if (userRes.ok) {
            const userData = await userRes.json();
            const user = userData.data;
            
            // If user already has role and team, redirect to their console
            if (user.user_role && (user.team || user.user_role === 'account_manager' || user.user_role === 'project_manager')) {
              if (user.user_role === 'admin') {
                router.push('/admin-console');
              } else if (user.user_role === 'account_manager') {
                router.push('/account-manager-console');
              } else if (user.user_role === 'project_manager') {
                router.push('/project-manager-console');
              } else {
                router.push('/team-console');
              }
            } else if (user.user_role && !user.team && user.user_role !== 'account_manager' && user.user_role !== 'project_manager') {
              // Has role but no team (except account_manager and project_manager don't need team)
              router.push('/auth/select-team');
            } else {
              // No role, go to role selection
              router.push('/auth/select-role');
            }
          } else {
            router.push('/auth/select-role');
          }
        } catch {
          router.push('/auth/select-role');
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Rituva Hub</h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSignupForm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

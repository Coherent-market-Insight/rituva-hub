'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Logged in successfully');
      
      // Check if user has role and team, redirect directly to console if they do
      // Wait a moment for the cookie to be set
      setTimeout(async () => {
        try {
          const userRes = await fetch('/api/auth/me');
          if (userRes.ok) {
            const userData = await userRes.json();
            const user = userData.data;
            
            // If user already has role and team, redirect directly to their console
            if (user.user_role && (user.team || user.user_role === 'account_manager' || user.user_role === 'project_manager' || user.user_role === 'client')) {
              if (user.user_role === 'admin') {
                router.push('/admin-console');
              } else if (user.user_role === 'account_manager') {
                router.push('/account-manager-console');
              } else if (user.user_role === 'project_manager') {
                router.push('/project-manager-console');
              } else if (user.user_role === 'client') {
                router.push('/client-console');
              } else {
                router.push('/team-console');
              }
            } else {
              // User doesn't have role/team yet, go through dashboard which will redirect to selection
              router.push('/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
        } catch {
          router.push('/dashboard');
        } finally {
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      toast.error('An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Rituva Hub</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


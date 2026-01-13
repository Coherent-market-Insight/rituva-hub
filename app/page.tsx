'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, LayoutGrid, Filter, Send } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fafafa]">
      {/* Navigation */}
      <header className="border-b border-black/5 bg-[#fafafa]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Coherent <span className="font-normal text-gray-500">Market Insights</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - transparent to show 3D scene */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 min-h-[80vh] flex items-center">
        <div className="max-w-2xl">
          <div className="inline-block mb-4 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full text-sm font-medium border border-gray-200">
            Built for Rituva
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight drop-shadow-sm">
            Project Management for Rituva
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Streamline your workflow with role-based task management, intelligent filtering, and seamless collaboration across teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/20">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-[#fafafa]/90 backdrop-blur-sm border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Powerful Features</h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to manage projects efficiently across different roles and teams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Role-Based Access Control',
                description: 'Admin, Account Manager, Project Manager, Team Members, and Client roles with specific permissions',
                color: 'text-gray-900',
                bgColor: 'bg-gray-100',
              },
              {
                icon: Send,
                title: 'Task Workflow Management',
                description: 'Streamlined workflow from admin to account manager to client. Push tasks and track completion',
                color: 'text-gray-900',
                bgColor: 'bg-gray-100',
              },
              {
                icon: LayoutGrid,
                title: 'Kanban Board Views',
                description: 'Visual task management with Kanban boards. Switch between list and board views',
                color: 'text-gray-900',
                bgColor: 'bg-gray-100',
              },
              {
                icon: Filter,
                title: 'Advanced Filtering',
                description: 'Filter tasks by team, month, and week. Find exactly what you need with dynamic filtering',
                color: 'text-gray-900',
                bgColor: 'bg-gray-100',
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 border border-black/5 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-[#fafafa]/90 backdrop-blur-sm border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative overflow-hidden text-center bg-gray-900 rounded-3xl p-12 md:p-16">
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to get started?</h3>
              <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                Streamline your project management workflow with Rituva&apos;s comprehensive task management system.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-6 h-auto bg-white text-gray-900 hover:bg-gray-100 shadow-xl">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/5 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 Coherent Market Insights. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, LayoutGrid, Filter, Send } from 'lucide-react';

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
    <div className="min-h-screen bg-white font-['Figtree',sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="text-xl font-semibold text-white">
              RituvaHub
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10 text-sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <button className="relative px-5 py-2.5 text-sm font-medium text-black bg-white rounded-full overflow-hidden group transition-all duration-300 hover:shadow-lg">
                  <span className="relative z-10">Get Started</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://cdn.prod.website-files.com/669ce7901f2c3433f3727bf1%2F669d061cb5053d239b6c3591_hero-poster-00001.jpg"
          >
            <source src="https://cdn.prod.website-files.com/69674775df61250b30019966/69674776df61250b30019a7b_hero-transcode.mp4" type="video/mp4" />
            <source src="https://cdn.prod.website-files.com/69674775df61250b30019966/69674776df61250b30019a7b_hero-transcode.webm" type="video/webm" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-32 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight">
            Inspired by Nature,<br />
            Perfected by Modern Science
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-fade-in-up-delay-1">
            <span className="font-bold">Supported by Bio Nutra</span>
          </p>

          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Your dedicated portal to track tasks, review deliverables, and mark projects as complete — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <a href="#features">
              <button className="relative px-8 py-4 text-base font-medium text-white bg-transparent border border-white/30 rounded-full overflow-hidden group transition-all duration-300 hover:bg-white hover:text-black">
                <span className="relative z-10">Learn More</span>
              </button>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-bounce" />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Client Portal Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Tasks, Simplified
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access your assigned tasks, review deliverables from our team, and mark them complete when you&apos;re satisfied.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* View Assigned Tasks */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">View Your Tasks</h3>
              <p className="text-gray-600 text-sm">See all tasks assigned to you in a clear, organized view. Know exactly what&apos;s been delivered for your review.</p>
              <div className="mt-4">
                <Link href="/auth/signup" className="inline-flex items-center text-gray-900 font-medium hover:gap-3 transition-all gap-2 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Track Progress */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor the status of each task as it moves through our workflow — from assignment to completion.</p>
              <div className="mt-4">
                <Link href="/auth/signup" className="inline-flex items-center text-gray-900 font-medium hover:gap-3 transition-all gap-2 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Mark Complete */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mark as Done</h3>
              <p className="text-gray-600 text-sm">Review deliverables and mark tasks as complete when you&apos;re satisfied. Simple, one-click confirmation.</p>
              <div className="mt-4">
                <Link href="/auth/signup" className="inline-flex items-center text-gray-900 font-medium hover:gap-3 transition-all gap-2 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-6">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Filter & Organize</h3>
              <p className="text-gray-600 text-sm">Filter tasks by status, date, or type. Find exactly what you need quickly and efficiently.</p>
              <div className="mt-4">
                <Link href="/auth/signup" className="inline-flex items-center text-gray-900 font-medium hover:gap-3 transition-all gap-2 text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Access your client portal and start tracking your deliverables today.
          </p>
          <Link href="/auth/signup">
            <button className="relative px-10 py-4 text-base font-semibold text-gray-900 bg-white rounded-full overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-white/20">
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-100">
            <span className="text-xl font-semibold text-gray-900">RituvaHub</span>
            <div className="flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Features</a>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Sign In</Link>
            </div>
          </div>
          <div className="pt-8 text-center">
            <p className="text-sm text-gray-500">© 2026 RituvaHub. All rights reserved.</p>
            <p className="text-xs text-gray-400 mt-2">Inspired by Nature, Perfected by Modern Science — Supported by Bio Nutra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

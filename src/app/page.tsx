import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Users,
  Zap,
  Shield,
  BarChart3,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function IndexPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-teal-200">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium bg-teal-600 text-white px-5 py-2.5 rounded-full hover:bg-teal-700 transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 flex justify-center opacity-40 pointer-events-none">
            <div className="w-[800px] h-[400px] bg-teal-100 rounded-full blur-[100px] filter mix-blend-multiply" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Sparkles className="w-4 h-4" /> Introducing TaskFlow
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Manage your team's tasks <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                with elegant precision
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
              A premium project management platform tailored for modern teams. Streamline workflows, track true
              progress, and hit your deadlines faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              {user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-600/25 hover:-translate-y-0.5"
                >
                  Go to dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-600/25 hover:-translate-y-0.5"
                  >
                    Start for free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-700 bg-white rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    View Login Page
                  </Link>
                </>
              )}
            </div>

            {!user && (
              <div className="mt-16 text-sm text-gray-500 flex flex-wrap items-center justify-center gap-8 animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> 14-day free trial
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Everything you need to succeed</h2>
              <p className="mt-4 text-lg text-gray-600">Powerful features wrapped in a beautiful, intuitive interface.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: LayoutDashboard,
                  title: 'Intuitive Dashboard',
                  description: "Get a bird's eye view of all your projects, tasks, and team member progress in one place.",
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Assign tasks, monitor roles, and keep every team member perfectly aligned on project goals.',
                },
                {
                  icon: BarChart3,
                  title: 'Advanced Reporting',
                  description: 'Generate beautiful reports and track key metrics to ensure your projects stay absolutely on track.',
                },
                {
                  icon: Zap,
                  title: 'Real-time Updates',
                  description: 'Status changes, assignment modifications, and progress updates happen instantly across your team.',
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'Your project data is securely stored, utilizing leading standards for your ultimate peace of mind.',
                },
                {
                  icon: CheckSquare,
                  title: 'Task Management',
                  description: 'Break complex, sprawling projects down into manageable, highly-trackable tasks and assignments.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-teal-50/80 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-100/80 transition-all">
                    <feature.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">TaskFlow</span>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

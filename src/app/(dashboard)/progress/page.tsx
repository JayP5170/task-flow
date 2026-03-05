"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRole } from "@/hooks/use-role";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { isEmployee, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    projectProgress: [] as any[],
  });

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (user && isEmployee && !fetchRef.current) {
      fetchRef.current = true;
      fetchProgressData();
    }
  }, [user, isEmployee]);

  const fetchProgressData = async () => {
    if (!user) return;
    try {
      // Fetch all tasks for this user
      const { data: tasks, error: tasksError } = await supabaseBrowser
        .from("tasks")
        .select(`
          status,
          project_id,
          projects ( id, title )
        `)
        .eq("assigned_to", user.id);

      if (tasksError) throw tasksError;

      const total = tasks?.length || 0;
      const completed = tasks?.filter(t => t.status === "completed").length || 0;
      const inProgress = tasks?.filter(t => t.status === "in-progress").length || 0;
      const pending = tasks?.filter(t => t.status === "pending").length || 0;

      // Calculate progress per project
      const projectMap: Record<string, { title: string; total: number; completed: number }> = {};
      tasks?.forEach(t => {
        const projectId = t.project_id;
        const projectTitle = Array.isArray(t.projects) 
          ? t.projects[0]?.title 
          : (t.projects as any)?.title || "Unknown Project";
        if (!projectMap[projectId]) {
          projectMap[projectId] = { title: projectTitle, total: 0, completed: 0 };
        }
        projectMap[projectId].total += 1;
        if (t.status === "completed") {
          projectMap[projectId].completed += 1;
        }
      });

      const projectProgress = Object.keys(projectMap).map(id => ({
        id,
        ...projectMap[id],
        percentage: Math.round((projectMap[id].completed / projectMap[id].total) * 100)
      }));

      setStats({
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        projectProgress
      });

    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Progress</h1>
        <p className="text-slate-600 mt-1">Track your personal growth and task completion stats</p>
      </div>

      {/* Overall Progress Circle/Card */}
      {loading || roleLoading ? (
        <ProgressOverallSkeleton />
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 opacity-0 animate-fade-in-up">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * overallProgress) / 100}
                strokeLinecap="round"
                className="text-teal-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{overallProgress}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Done</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <ProgressStatCard title="Total Tasks" value={stats.totalTasks} color="bg-slate-500" />
            <ProgressStatCard title="Completed" value={stats.completedTasks} color="bg-green-500" />
            <ProgressStatCard title="In Progress" value={stats.inProgressTasks} color="bg-blue-500" />
            <ProgressStatCard title="Pending" value={stats.pendingTasks} color="bg-amber-500" />
          </div>
        </div>
      )}

      {/* Project Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 px-1">Project Breakdown</h2>
        <div className="grid gap-4">
          {loading || roleLoading ? (
            [1, 2, 3].map(i => <ProjectProgressSkeleton key={i} />)
          ) : stats.projectProgress.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No active project assignments found.</p>
            </div>
          ) : (
            stats.projectProgress.map((project, index) => (
              <div 
                key={project.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{project.title}</h3>
                    <p className="text-sm text-slate-500">{project.completed} of {project.total} tasks completed</p>
                  </div>
                  <span className="text-2xl font-black text-slate-100">{project.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${project.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressOverallSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
      <Skeleton className="w-40 h-40 rounded-full" />
      <div className="flex-1 grid grid-cols-2 gap-4 w-full">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectProgressSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
      <Skeleton className="w-full bg-slate-100 rounded-full h-3" />
    </div>
  );
}

function ProgressStatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

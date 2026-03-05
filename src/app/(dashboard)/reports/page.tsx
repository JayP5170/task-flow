"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";

import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    projectsByStatus: [] as any[],
    tasksByStatus: [] as any[],
    employeeWorkload: [] as any[],
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, roleLoading, router]);

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (isAdmin && !fetchRef.current) {
      fetchRef.current = true;
      fetchReportData();
    }
  }, [isAdmin]);

  const fetchReportData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        supabaseBrowser
          .from("projects")
          .select("status"),
        supabaseBrowser
          .from("tasks")
          .select("status, assigned_to, profiles:assigned_to(username)")
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const projects = projectsRes.data || [];
      const tasks = tasksRes.data || [];
      
      // Projects by Status
      const projectStatusCounts = projects.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      
      const projectStats = Object.keys(projectStatusCounts).map(key => ({
        name: key,
        value: projectStatusCounts[key]
      }));

      // Tasks by Status
      const taskStatusCounts = tasks.reduce((acc: any, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});

      const taskStats = Object.keys(taskStatusCounts).map(key => ({
        name: key,
        value: taskStatusCounts[key]
      }));

      const workloadMap = tasks.reduce((acc: any, t) => {
        if (t.assigned_to && t.profiles) {
          const profile: any = t.profiles;
          const username = profile.username || (Array.isArray(profile) ? profile[0]?.username : 'Unknown');
          acc[username] = (acc[username] || 0) + 1;
        }
        return acc;
      }, {});

      const workloadStats = Object.keys(workloadMap).map(key => ({
        name: key,
        value: workloadMap[key]
      })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10

      setStats({
        projectsByStatus: projectStats,
        tasksByStatus: taskStats,
        employeeWorkload: workloadStats
      });

    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!roleLoading && !isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">
          Overview of project statuses, tasks progress, and team workload
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading || roleLoading ? (
          <>
            <ReportCardSkeleton title="Projects by Status" />
            <ReportCardSkeleton title="Tasks by Status" />
            <WorkloadTableSkeleton />
          </>
        ) : (
          <>
            {/* Projects By Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Projects by Status</h2>
              {stats.projectsByStatus.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No project data available.</p>
              ) : (
                <div className="space-y-4 flex-1 justify-center flex flex-col">
                  {stats.projectsByStatus.map((stat, idx) => {
                    const colors: Record<string, string> = {
                      'active': 'bg-teal-500',
                      'completed': 'bg-green-500',
                      'on-hold': 'bg-amber-500',
                      'cancelled': 'bg-red-500',
                    };
                    const total = stats.projectsByStatus.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = Math.round((stat.value / total) * 100);
                    
                    return (
                      <div key={idx} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700 capitalize">{stat.name.replace("-", " ")}</span>
                          <span className="text-slate-500">{stat.value} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${colors[stat.name] || 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tasks By Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Tasks by Status</h2>
              {stats.tasksByStatus.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No task data available.</p>
              ) : (
                <div className="space-y-4 flex-1 justify-center flex flex-col">
                  {stats.tasksByStatus.map((stat, idx) => {
                    const colors: Record<string, string> = {
                      'pending': 'bg-slate-400',
                      'in-progress': 'bg-blue-500',
                      'completed': 'bg-green-500',
                    };
                    const total = stats.tasksByStatus.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = Math.round((stat.value / total) * 100);
                    
                    return (
                      <div key={idx} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700 capitalize">{stat.name.replace("-", " ")}</span>
                          <span className="text-slate-500">{stat.value} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${colors[stat.name] || 'bg-teal-500'}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Employee Workload */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Employee Workload (Top 10)</h2>
              {stats.employeeWorkload.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No assigned tasks found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-sm font-semibold text-slate-500">Employee</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Tasks Assigned</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 w-1/2 px-4">Workload Bar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.employeeWorkload.map((stat, idx) => {
                        const maxTasks = Math.max(...stats.employeeWorkload.map(s => s.value));
                        const percentage = Math.round((stat.value / maxTasks) * 100);
                        
                        return (
                          <tr key={idx} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                            <td className="py-4 font-medium text-slate-800">{stat.name}</td>
                            <td className="py-4 text-slate-600 text-right font-semibold">{stat.value}</td>
                            <td className="py-4 px-4">
                              <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReportCardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">{title}</h2>
      <div className="space-y-4 flex-1 justify-center flex flex-col">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkloadTableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">Employee Workload (Top 10)</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-6 py-4 border-b border-slate-100 last:border-0">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-12 ml-auto text-right" />
            <div className="w-1/2 px-4">
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

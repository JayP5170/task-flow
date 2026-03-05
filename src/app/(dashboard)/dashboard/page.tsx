"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/Dropdown";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { User } from "@supabase/supabase-js";

interface Stats {
  totalProjects: number;
  activeMembers: number;
  pendingTasks: number;
  completedTasks: number;
}

export default function DashboardPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeMembers: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  const userRole = (authUser?.user_metadata?.role as "admin" | "employee") || "employee";

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (!authLoading && authUser && !fetchRef.current) {
      fetchRef.current = true;
      if (userRole === "admin") {
        fetchStats();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, authUser, userRole]);

  const fetchStats = async () => {
    try {
      const [projectRes, memberRes, pendingRes, completedRes] = await Promise.all([
        supabaseBrowser.from("projects").select("*", { count: "exact", head: true }),
        supabaseBrowser.from("profiles").select("*", { count: "exact", head: true }),
        supabaseBrowser.from("tasks").select("*", { count: "exact", head: true }).in("status", ["pending", "in-progress"]),
        supabaseBrowser.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed")
      ]);

      setStats({
        totalProjects: projectRes.count || 0,
        activeMembers: memberRes.count || 0,
        pendingTasks: pendingRes.count || 0,
        completedTasks: completedRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {userRole === "admin" ? (
        <AdminOverview stats={stats} loading={loading} />
      ) : (
        <EmployeeOverview user={authUser} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <ActivityItemSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

// Admin Overview Component
function AdminOverview({ stats, loading }: { stats: Stats; loading: boolean }) {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      fetchRecentActivity();
    }
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const { data: tasks } = await supabaseBrowser
        .from("tasks")
        .select(
          `
          id,
          title,
          status,
          updated_at,
          assigned_to,
          profiles:assigned_to (
            username,
            email
          )
        `,
        )
        .order("updated_at", { ascending: false })
        .limit(5);

      if (tasks) {
        setRecentActivity(tasks);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const getActivityText = (task: any) => {
    const profile = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;
    const username = profile?.username || "Someone";
    const action =
      task.status === "completed" ? "completed task" : "updated task";
    return { username, action, task: task.title };
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm md:text-slate-600 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects.toString()}
          loading={loading}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          bgColor="bg-blue-500"
          className="opacity-0 animate-fade-in-up"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers.toString()}
          loading={loading}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          bgColor="bg-teal-500"
          className="opacity-0 animate-fade-in-up delay-100"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toString()}
          loading={loading}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          bgColor="bg-orange-500"
          className="opacity-0 animate-fade-in-up delay-200"
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks.toString()}
          loading={loading}
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          bgColor="bg-green-500"
          className="opacity-0 animate-fade-in-up delay-300"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {loadingActivity ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <ActivityItemSkeleton key={i} />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-4" >
              {recentActivity.map((task, index) => {
                const {
                  username,
                  action,
                  task: taskTitle,
                } = getActivityText(task);
                return (
                  <ActivityItem
                    key={task.id}
                    user={username}
                    action={action}
                    task={taskTitle}
                    time={getTimeAgo(task.updated_at)}
                    className={`opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Employee Overview Component
function EmployeeOverview({ user }: { user: User | null }) {
  const [employeeStats, setEmployeeStats] = useState({
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
  });
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (user && !fetchRef.current) {
      fetchRef.current = true;
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user) return;
    try {
      const [assignedRes, inProgressRes, completedRes, projectsRes, tasksRes] = await Promise.all([
        supabaseBrowser.from("tasks").select("*", { count: "exact", head: true }).eq("assigned_to", user.id),
        supabaseBrowser.from("tasks").select("*", { count: "exact", head: true }).eq("assigned_to", user.id).eq("status", "in-progress"),
        supabaseBrowser.from("tasks").select("*", { count: "exact", head: true }).eq("assigned_to", user.id).eq("status", "completed"),
        supabaseBrowser.from("project_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabaseBrowser.from("tasks").select(`
          id, title, description, status, priority, due_date, labels, created_at, updated_at, project_id,
          projects ( title ),
          profiles:assigned_to ( username, avatar_url )
        `).eq("assigned_to", user.id).in("status", ["pending", "in-progress"]).order("priority", { ascending: false }).limit(5)
      ]);

      setEmployeeStats({
        assignedTasks: assignedRes.count || 0,
        inProgressTasks: inProgressRes.count || 0,
        completedTasks: completedRes.count || 0,
        activeProjects: projectsRes.count || 0,
      });

      setTodayTasks(tasksRes.data || []);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      setTodayTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      const { error } = await supabaseBrowser.from("tasks").update({ status: newStatus }).eq("id", taskId);
      if (error) throw error;
      fetchEmployeeData();
    } catch (error) {
      console.error("Error updating status:", error);
      fetchEmployeeData();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-sm md:text-slate-600 mt-1">Track your tasks and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Tasks"
          value={employeeStats.assignedTasks.toString()}
          loading={loading}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          bgColor="bg-blue-500"
        />
        <StatCard
          title="In Progress"
          value={employeeStats.inProgressTasks.toString()}
          loading={loading}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-amber-500"
        />
        <StatCard
          title="Completed"
          value={employeeStats.completedTasks.toString()}
          loading={loading}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-green-500"
        />
        <StatCard
          title="Active Projects"
          value={employeeStats.activeProjects.toString()}
          loading={loading}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          bgColor="bg-teal-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">My Tasks</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <TaskItemSkeleton key={i} />)}
            </div>
          ) : todayTasks.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4" >
              {todayTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  project={task.projects?.title || "No Project"}
                  priority={task.priority as "high" | "medium" | "low"}
                  status={task.status}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  onStatusUpdate={handleStatusUpdate}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        isAdmin={false}
        projectId={selectedTask?.project_id || ""}
        onUpdate={fetchEmployeeData}
      />
    </div>
  );
}

// Utility Components
function StatCard({
  title,
  value,
  icon,
  bgColor,
  loading = false,
  className = "",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  loading?: boolean;
  className?: string;
}) {
  if (loading) return <StatCardSkeleton />;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2.5 md:p-3 rounded-lg ${bgColor} text-white`}>{icon}</div>
      </div>
      <p className="text-slate-500 md:text-slate-600 text-xs md:text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

// Pixel-perfect skeletons
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

function TaskItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  task,
  time,
  className = "",
  style = {},
}: {
  user: string;
  action: string;
  task: string;
  time: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div 
      className={`flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0 ${className}`}
      style={style}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
        {user.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{user}</span>{" "}
          <span className="text-slate-600">{action}</span>{" "}
          <span className="font-semibold text-slate-900">
            &quot;{task}&quot;
          </span>
        </p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function TaskItem({
  id,
  title,
  project,
  priority,
  status,
  className = "",
  style = {},
  onClick,
  onStatusUpdate,
}: {
  id: string;
  title: string;
  project: string;
  priority: "high" | "medium" | "low";
  status?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onStatusUpdate?: (taskId: string, newStatus: string) => void;
}) {
  const priorityColors = {
    high: "bg-red-50 text-red-600 border-red-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    low: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <div 
      className={`flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-xl transition-all cursor-pointer group ${className}`}
      style={style}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors truncate text-base md:text-lg">{title}</p>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${priorityColors[priority]}`}
          >
            {priority}
          </span>
        </div>
        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{project}</p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-full md:w-36">
          <Dropdown
            value={status}
            onChange={(val) => onStatusUpdate?.(id, val as string)}
            options={[
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in-progress" },
              { label: "Completed", value: "completed" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

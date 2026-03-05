"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRole } from "@/hooks/use-role";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/Dropdown";
import { showToast } from "@/lib/toast";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function MyTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { isEmployee, isAdmin, loading: roleLoading } = useRole();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      router.push("/tasks/assign");
    }
  }, [isAdmin, roleLoading, router]);

  useEffect(() => {
    if (user && isEmployee) {
      fetchMyTasks();
    }
  }, [user, isEmployee]);

  const fetchMyTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabaseBrowser
        .from("tasks")
        .select(`
          id, title, description, status, priority, due_date, assigned_to, labels,
          projects ( id, title ),
          profiles:assigned_to ( username, email )
        `)
        .eq("assigned_to", user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      const { error } = await supabaseBrowser
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        throw error;
      }
      
      showToast.success(`Status updated to ${newStatus.replace("-", " ")}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      showToast.error("Failed to update status. Reverting...");
      // Refresh list to revert
      fetchMyTasks();
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleOpenTask = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    urgent: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };

  if (!roleLoading && !isEmployee) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-sm md:text-slate-600 mt-1">Manage and update your assigned tasks</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "pending", "in-progress", "completed"].map((status) => (
          <button
            key={status}
            disabled={loading}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? "bg-teal-500 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
          </button>
        ))}
      </div>

      {(loading || roleLoading) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <TaskCardSkeleton key={i} />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-slate-600 text-lg">No tasks found</p>
          <p className="text-slate-500 text-sm mt-2">
            {filter === "all" ? "You have no tasks assigned to you right now." : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task, index) => (
            <div 
              key={task.id} 
              onClick={() => handleOpenTask(task)}
              className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 hover:border-teal-400 transition-all shadow-sm flex flex-col h-full opacity-0 animate-fade-in-up cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Link href={`/projects/${task.projects?.id}`} className="hover:text-teal-600">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 transition-colors line-clamp-1 group-hover:text-teal-600">
                      {task.title}
                    </h3>
                  </Link>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${priorityColors[task.priority] || priorityColors.medium}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              
              {task.projects && (
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                  Project: {task.projects.title}
                </p>
              )}
              
              <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                {task.description || "No description provided."}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
                <div className="text-sm">
                  {task.due_date ? (
                    <span className={`font-medium ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-slate-500'}`}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-slate-400">No due date</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-xs font-medium text-slate-500">Status:</span>
                  <div className="w-full sm:w-36" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      value={task.status}
                      onChange={(val) => updateTaskStatus(task.id, val as string)}
                      options={[
                        { label: "Pending", value: "pending" },
                        { label: "In Progress", value: "in-progress" },
                        { label: "Completed", value: "completed" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        isAdmin={isAdmin}
        projectId={selectedTask?.projects?.id}
        onUpdate={fetchMyTasks}
      />
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-7 w-3/4 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-3 w-1/3 mb-4" />
      <div className="space-y-2 mb-6 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-8" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

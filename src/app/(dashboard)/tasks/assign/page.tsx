"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRole } from "@/hooks/use-role";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/Dropdown";
import { showToast } from "@/lib/toast";

export default function AssignTasksPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState("all");
  const [projects, setProjects] = useState<any[]>([]);
  const [projectMembersMapping, setProjectMembersMapping] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, roleLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, membersRes, employeesRes] = await Promise.all([
        supabaseBrowser
          .from("tasks")
          .select(`
            id, title, status, priority, due_date, project_id, assigned_to,
            projects ( id, title ),
            profiles:assigned_to ( id, username, email )
          `)
          .order("created_at", { ascending: false }),
        supabaseBrowser
          .from("projects")
          .select("id, title")
          .order("title"),
        supabaseBrowser
          .from("project_members")
          .select(`
            project_id,
            profiles:user_id ( id, username, email )
          `),
        supabaseBrowser
          .from("profiles")
          .select("id, username, email")
          .eq("role", "employee")
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (membersRes.error) throw membersRes.error;

      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);

      const mapping: Record<string, any[]> = {};
      membersRes.data?.forEach((m: any) => {
        if (!mapping[m.project_id]) mapping[m.project_id] = [];
        mapping[m.project_id].push(m.profiles);
      });
      setProjectMembersMapping(mapping);
      setEmployees(employeesRes.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const { error } = await supabaseBrowser
        .from("tasks")
        .update({ assigned_to: userId || null })
        .eq("id", taskId);

      if (error) throw error;
      
      const assignedUser = employees.find((e: any) => e.id === userId);
      showToast.success(`Task assigned to ${assignedUser?.username || "unassigned"}`);

      // Optimistically update UI
      setTasks(tasks.map((t: any) => t.id === taskId ? {
        ...t, 
        assigned_to: userId,
        profiles: assignedUser || null
      } : t));

    } catch (error) {
      console.error("Error assigning task:", error);
      showToast.error("Failed to assign task");
      fetchData(); // revert
    }
  };

  const filteredTasks = tasks.filter((t: any) => {
    if (filterProject === "all") return true;
    return t.project_id === filterProject;
  });

  if (!roleLoading && !isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Assign Tasks</h1>
          <p className="text-slate-600 mt-1">Manage all tasks and assign them to employees</p>
        </div>
        <div className="w-64">
          <Dropdown
            disabled={loading}
            value={filterProject}
            onChange={(val) => setFilterProject(val as string)}
            options={[
              { label: "All Projects", value: "all" },
              ...projects.map(p => ({ label: p.title, value: p.id }))
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Task Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Project</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Due Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                /* Table Skeletons */
                [1, 2, 3, 4, 5, 6].map((i) => <TaskTableRowSkeleton key={i} />)
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <p>No tasks found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task: any, index: number) => {
                  const projectMembers = projectMembersMapping[task.project_id] || [];
                  return (
                    <tr 
                      key={task.id} 
                      className="hover:bg-slate-50 transition-colors opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 break-words max-w-xs">{task.title}</div>
                        <div className={`text-xs mt-1 font-semibold uppercase ${
                          task.priority === "high" || task.priority === "urgent" ? "text-red-500" :
                          task.priority === "medium" ? "text-amber-500" : "text-blue-500"
                        }`}>
                          {task.priority} Priority
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/projects/${task.project_id}`} className="text-sm font-medium text-teal-600 hover:underline">
                          {task.projects?.title || "Unknown"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : <span className="text-slate-400">Not set</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          task.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                          task.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {task.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-48">
                          <Dropdown
                            value={task.assigned_to || ""}
                            onChange={(val) => handleAssignTask(task.id, val as string)}
                            placeholder="Unassigned"
                            options={projectMembers.map((emp: any) => ({
                              label: emp.username,
                              value: emp.id,
                            }))}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TaskTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </td>
    </tr>
  );
}

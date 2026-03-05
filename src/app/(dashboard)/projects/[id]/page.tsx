"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import Link from "next/link";
import { use } from "react";

import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import TaskDetailsModal from "@/components/TaskDetailsModal";

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { isAdmin, loading: roleLoading } = useRole();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        supabaseBrowser
          .from("projects")
          .select("*")
          .eq("id", id)
          .single(),
        supabaseBrowser
          .from("tasks")
          .select(`
            id, title, description, status, priority, due_date, labels, created_at, updated_at,
            profiles:assigned_to ( username, avatar_url )
          `)
          .eq("project_id", id)
          .order("created_at", { ascending: false }),
        supabaseBrowser
          .from("project_members")
          .select(`
            role,
            profiles:user_id ( id, username, email, avatar_url )
          `)
          .eq("project_id", id)
      ]);

      if (projectRes.error) throw projectRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (membersRes.error) throw membersRes.error;

      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
      setMembers(membersRes.data || []);

    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  const performDeleteProject = async () => {
    try {
      const { error } = await supabaseBrowser
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      showToast.success("Project and associated tasks deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast.error("Failed to delete project.");
    }
  };

  if (!loading && !project) {
    return (
      <div className="text-center py-12 text-slate-600">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-96 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-800 truncate">{project.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    project.status === "active"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : project.status === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : project.status === "on-hold"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {project.status.toUpperCase()}
                </span>
              </>
            )}
          </div>
          {loading ? (
            <div className="space-y-2 max-w-2xl">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : project.description && (
            <p className="text-slate-600 max-w-3xl leading-relaxed">{project.description}</p>
          )}
        </div>
        
        {!loading && isAdmin && (
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${id}/edit`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              Edit Project
            </Link>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              Delete
            </button>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Tasks</h2>
              {!loading && isAdmin && (
                <Link
                  href={`/projects/${id}/tasks/create`}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                >
                  + New Task
                </Link>
              )}
              {loading && <Skeleton className="h-10 w-28 rounded-lg" />}
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <ProjectTaskItemSkeleton key={i} />)}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No tasks found for this project.
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all bg-slate-50 cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 group-hover:text-teal-600 transition-colors truncate">{task.title}</p>
                      {task.due_date && (
                        <p className="text-sm text-slate-500 mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {task.profiles && (() => {
                        const profile = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;
                        const username = profile?.username || "Unknown";
                        return (
                          <div className="flex items-center gap-2 mr-2">
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs uppercase flex-shrink-0">
                              {username.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600 hidden md:inline">
                              {username}
                            </span>
                          </div>
                        );
                      })()}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        task.status === "completed" ? "bg-green-100 text-green-700 border-green-200" :
                        task.status === "in-progress" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {task.status.replace("-", " ")}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        task.priority === "high" || task.priority === "urgent" ? "bg-red-100 text-red-700 border-red-200" :
                        task.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      }`}>
                        {task.priority}
                      </span>
                      {isAdmin && (
                        <Link
                          href={`/projects/${id}/tasks/${task.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-teal-600 transition-colors text-sm font-medium"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <>
              <ProjectDetailsSkeleton />
              <TeamPanelSkeleton />
            </>
          ) : (
            <>
              {/* Project Info Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Priority</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${
                      project.priority === "high" || project.priority === "urgent" ? "bg-red-100 text-red-700 border-red-200" :
                      project.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-blue-100 text-blue-700 border-blue-200"
                    }`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                  {project.start_date && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Start Date</p>
                      <p className="text-slate-800 font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {project.end_date && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Due Date</p>
                      <p className="text-slate-800 font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Team ({members.length})</h2>
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">No members assigned.</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {member.profiles?.username?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{member.profiles?.username}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        isAdmin={isAdmin}
        projectId={id}
        onUpdate={fetchProjectDetails}
      />
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={performDeleteProject}
        title="Delete Project?"
        message="This action is irreversible and will permanently delete this project along with all associated tasks and data."
        confirmLabel="Delete Project"
        variant="danger"
      />
    </div>
  );
}

function ProjectTaskItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-1/2 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-20 hidden md:inline" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamPanelSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

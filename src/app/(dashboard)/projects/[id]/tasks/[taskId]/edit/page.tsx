"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import Link from "next/link";
import { use } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Dropdown } from "@/components/ui/Dropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskValues } from "@/lib/validations/task";
import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Member {
  id: string;
  username: string;
  email: string;
}

export default function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const router = useRouter();
  const { id: projectId, taskId } = use(params);
  const { isAdmin, loading: roleLoading } = useRole();

  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assigned_to: "",
      due_date: "",
      labels: "",
    }
  });

  const formData = watch();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push(`/projects/${projectId}`);
    }
  }, [isAdmin, roleLoading, router, projectId]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, projectId, taskId]);

  const fetchData = async () => {
    try {
      const [taskRes, projectRes, membersRes] = await Promise.all([
        supabaseBrowser
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .single(),
        supabaseBrowser
          .from("projects")
          .select("title")
          .eq("id", projectId)
          .single(),
        supabaseBrowser
          .from("project_members")
          .select(`
            profiles:user_id ( id, username, email )
          `)
          .eq("project_id", projectId)
      ]);

      if (taskRes.error) throw taskRes.error;
      if (projectRes.error) throw projectRes.error;
      if (membersRes.error) throw membersRes.error;

      const taskData = taskRes.data;
      const projectData = projectRes.data;
      const membersData = membersRes.data;

      reset({
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "pending",
        priority: taskData.priority || "medium",
        due_date: taskData.due_date || "",
        assigned_to: taskData.assigned_to || "",
        labels: (taskData.labels || []).join(", "),
      });

      setProjectTitle(projectData.title);

      const membersList = (membersData || [])
        .map((m: any) => m.profiles)
        .filter(Boolean);
        
      setProjectMembers(membersList);

    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TaskValues) => {
    setSaving(true);

    try {
      // Process labels
      const labelsArray = data.labels
        ? data.labels.split(",").map((l) => l.trim()).filter(Boolean)
        : [];

      const { error } = await supabaseBrowser
        .from("tasks")
        .update({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date || null,
          assigned_to: data.assigned_to || null,
          labels: labelsArray,
        })
        .eq("id", taskId);

      if (error) throw error;

      showToast.success("Task updated successfully!");
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1000);
    } catch (error: any) {
      console.error("Error updating task:", error);
      showToast.error(error.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const performDelete = async () => {
    try {
      const { error } = await supabaseBrowser
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) throw error;
      
      showToast.success("Task deleted successfully");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast.error("Failed to delete task.");
    }
  };

  if (!roleLoading && !isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-10 opacity-0 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-3">
            Edit Task
          </h1>
          <p className="text-slate-500 font-medium">
            Project: <span className="font-bold text-teal-600 uppercase tracking-wider text-xs">{loading || roleLoading ? <Skeleton className="inline-block h-3 w-24" /> : projectTitle}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <button
            disabled={loading || roleLoading}
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-6 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {loading || roleLoading ? (
        <TaskFormSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[32px] p-8 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-12 opacity-0 animate-fade-in-up delay-100">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
              <div className="w-4 h-1 bg-teal-500 rounded-full" />
              Task Details
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title *</label>
                <input
                  {...register("title")}
                  type="text"
                  className={`w-full bg-slate-50 border ${errors.title ? 'ring-2 ring-red-500/20 bg-red-50/20' : 'none'} text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-bold placeholder-slate-300`}
                  placeholder="Task title"
                />
                {errors.title && (
                  <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full bg-slate-50 border-none text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-medium leading-relaxed resize-none placeholder-slate-300"
                  placeholder="Task description here..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Labels (comma separated)</label>
                <input
                  {...register("labels")}
                  type="text"
                  placeholder="e.g. Backend, UX, Research"
                  className="w-full bg-slate-50 border-none text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-medium font-bold placeholder-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-10 border-t border-slate-50">
            <div className="space-y-2">
              <Dropdown
                label="Assign To"
                value={formData.assigned_to}
                onChange={(val) => setValue("assigned_to", val as string, { shouldValidate: true })}
                placeholder="Unassigned"
                size="md"
                options={projectMembers.map((member) => ({
                  label: `${member.username} (${member.email})`,
                  value: member.id,
                }))}
              />
              {errors.assigned_to && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.assigned_to.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <DatePicker
                label="Due Date"
                value={formData.due_date}
                size="md"
                onChange={(val) => setValue("due_date", val, { shouldValidate: true })}
              />
              {errors.due_date && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.due_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Dropdown
                label="Status"
                value={formData.status}
                size="md"
                onChange={(val) => setValue("status", val as any, { shouldValidate: true })}
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "In Progress", value: "in-progress" },
                  { label: "Completed", value: "completed" },
                ]}
              />
              {errors.status && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Dropdown
                label="Priority"
                value={formData.priority}
                size="md"
                onChange={(val) => setValue("priority", val as any, { shouldValidate: true })}
                options={[
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                  { label: "Urgent", value: "urgent" },
                ]}
              />
              {errors.priority && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:flex-grow bg-zinc-900 hover:bg-black text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 disabled:opacity-30 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/projects/${projectId}`)}
              className="w-full md:w-auto px-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={performDelete}
        title="Permanently Delete Task?"
        message="This will remove the task from the project. This action cannot be undone."
        confirmLabel="Delete Task"
        variant="danger"
      />
    </div>
  );
}

function TaskFormSkeleton() {
  return (
    <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

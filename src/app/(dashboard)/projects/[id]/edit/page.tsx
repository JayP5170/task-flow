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
import { projectSchema, ProjectValues } from "@/lib/validations/project";
import { showToast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { isAdmin, loading: roleLoading } = useRole();

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      priority: "medium",
      start_date: "",
      end_date: "",
      team_members: [],
    }
  });

  const formData = watch();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, roleLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchProjectData();
    }
  }, [isAdmin, id]);

  const fetchProjectData = async () => {
    try {
      const [empRes, projectRes, membersRes] = await Promise.all([
        supabaseBrowser
          .from("profiles")
          .select("id, username, email, role")
          .eq("role", "employee"),
        supabaseBrowser
          .from("projects")
          .select("*")
          .eq("id", id)
          .single(),
        supabaseBrowser
          .from("project_members")
          .select("user_id")
          .eq("project_id", id)
      ]);

      if (empRes.error) throw empRes.error;
      if (projectRes.error) throw projectRes.error;
      if (membersRes.error) throw membersRes.error;

      setEmployees(empRes.data || []);
      
      const projectData = projectRes.data;
      const membersData = membersRes.data;

      reset({
        title: projectData.title || "",
        description: projectData.description || "",
        status: projectData.status || "active",
        priority: projectData.priority || "medium",
        start_date: projectData.start_date || "",
        end_date: projectData.end_date || "",
        team_members: membersData.map((m) => m.user_id),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamMemberToggle = (userId: string) => {
    const currentMembers = formData.team_members || [];
    const newMembers = currentMembers.includes(userId)
      ? currentMembers.filter((uid) => uid !== userId)
      : [...currentMembers, userId];
    
    setValue("team_members", newMembers, { shouldValidate: true });
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (emp.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: ProjectValues) => {
    setSaving(true);

    try {
      // Update project
      const { error: updateError } = await supabaseBrowser
        .from("projects")
        .update({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update members: delete all and re-insert
      const { error: deleteMembersError } = await supabaseBrowser
        .from("project_members")
        .delete()
        .eq("project_id", id);

      if (deleteMembersError) throw deleteMembersError;

      if (data.team_members && data.team_members.length > 0) {
        const newMembers = data.team_members.map((userId) => ({
          project_id: id,
          user_id: userId,
          role: "member",
        }));

        const { error: insertMembersError } = await supabaseBrowser
          .from("project_members")
          .insert(newMembers);

        if (insertMembersError) throw insertMembersError;
      }

      showToast.success("Project updated successfully!");
      setTimeout(() => {
        router.push(`/projects/${id}`);
      }, 1000);
    } catch (error: any) {
      console.error(error);
      showToast.error(error.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  if (!roleLoading && !isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-10 opacity-0 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Edit Project</h1>
          <p className="text-slate-500 font-medium">Refine project scope or adjust team composition</p>
        </div>
        <Link
          href={`/projects/${id}`}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      {loading || roleLoading ? (
        <ProjectFormSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[32px] p-8 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-12 opacity-0 animate-fade-in-up">
           {/* Section 1: Core Details */}
           <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
              <div className="w-4 h-1 bg-teal-500 rounded-full" />
              Core Information
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Project Title *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className={`w-full bg-slate-50 border ${errors.title ? 'ring-2 ring-red-500/20 bg-red-50/20' : 'none'} text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-bold placeholder-slate-300`}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full bg-slate-50 border-none text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-medium leading-relaxed resize-none placeholder-slate-300"
                  placeholder="Project description here..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-10 border-t border-slate-50">
            <div className="space-y-2">
              <Dropdown
                label="Status"
                value={formData.status}
                size="md"
                onChange={(val) => setValue("status", val as any, { shouldValidate: true })}
                options={[
                  { label: "Active", value: "active" },
                  { label: "On Hold", value: "on-hold" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
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

            <div className="space-y-2">
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                size="md"
                onChange={(val) => setValue("start_date", val, { shouldValidate: true })}
              />
              {errors.start_date && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <DatePicker
                label="End Date"
                value={formData.end_date}
                size="md"
                onChange={(val) => setValue("end_date", val, { shouldValidate: true })}
              />
              {errors.end_date && (
                <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="w-4 h-1 bg-teal-500 rounded-full" />
                  Team Composition
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Manage Members</h3>
              </div>
              
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  placeholder="Filter team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-none py-2.5 px-10 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="min-h-[200px]">
              {employees.length === 0 ? (
                <div className="bg-slate-50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold">No registered employees found.</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="bg-slate-50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold italic">No members matching "{searchTerm}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => {
                    const isSelected = formData.team_members?.includes(employee.id);
                    return (
                      <div
                        key={employee.id}
                        onClick={() => handleTeamMemberToggle(employee.id)}
                        className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? "bg-teal-50 border-teal-200 ring-2 ring-teal-500/10" 
                            : "bg-white border-slate-100 hover:border-teal-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase flex-shrink-0 transition-all ${
                          isSelected ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-slate-100 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600"
                        }`}>
                          {employee.username?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm tracking-tight truncate ${isSelected ? "text-slate-800" : "text-slate-600"}`}>
                            {employee.username}
                          </p>
                          <p className={`text-[10px] font-bold truncate ${isSelected ? "text-teal-600" : "text-slate-400"}`}>
                            {employee.email}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center animate-scale-in">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3 px-1">
              <div className="h-2 flex-grow bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 transition-all duration-500" 
                  style={{ width: `${Math.min((formData.team_members?.length / Math.max(employees.length, 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {formData.team_members?.length || 0} / {employees.length} selected
              </span>
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
              onClick={() => router.push(`/projects/${id}`)}
              className="w-full md:w-auto px-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ProjectFormSkeleton() {
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="pt-10 border-t border-slate-50 space-y-6">
        <div className="flex justify-between items-end">
           <div className="space-y-2">
             <Skeleton className="h-4 w-40 rounded-full" />
             <Skeleton className="h-6 w-48 rounded-lg" />
           </div>
           <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

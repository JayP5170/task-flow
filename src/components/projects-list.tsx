"use client";

import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

type UUID = string;
type ISODate = string; // date or timestamptz from Supabase

type Profile = {
  id: UUID;
  username: string;
  email: string;
  avatar_url: string | null;
  role: string;
};

type ProjectMember = {
  role: string;
  added_at: ISODate;
  user: {
    id: UUID;
    username: string;
    email: string;
    avatar_url: string | null;
  };
};

type TaskCount = {
  count: number;
};

type ProjectWithStats = {
  id: UUID;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: ISODate | null;
  end_date: ISODate | null;
  created_at: ISODate;

  created_by_user: Profile[]; // Supabase returns array

  members: ProjectMember[]; // project_members join

  tasks: TaskCount[]; // tasks(count)
};

import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/use-role";
import { useAuthContext } from "@/components/providers/AuthProvider";

export default function ProjectsList() {
  const { isEmployee } = useRole();
  const { user: currentUser } = useAuthContext();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (currentUser && !fetchRef.current) {
      fetchRef.current = true;
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;
    try {
      let query = supabaseBrowser
        .from("projects")
        .select(`
          id,
          title,
          description,
          status,
          priority,
          start_date,
          end_date,
          created_at,

          created_by_user:profiles (
            id,
            username,
            email,
            avatar_url,
            role
          ),

          members:project_members${isEmployee ? "!inner" : ""} (
            role,
            added_at,
            user:profiles (
              id,
              username,
              email,
              avatar_url
            )
          ),

          tasks:tasks(count)
        `);

      // If employee, filter by current user id through the inner join
      if (isEmployee) {
        query = query.eq("project_members.user_id", currentUser.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      setProjects((data as unknown as ProjectWithStats[]) ?? []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-teal-50 text-teal-700 border-teal-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      "on-hold": "bg-yellow-50 text-yellow-700 border-yellow-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || colors.active;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-slate-500",
      medium: "text-blue-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
      low: "↓",
      medium: "→",
      high: "↑",
      urgent: "⚠",
    };
    return icons[priority] || icons.medium;
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["all", "active", "completed", "on-hold", "cancelled"].map(
          (status) => (
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
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace("-", " ")}
              {status === "all" && !loading && ` (${projects.length})`}
            </button>
          ),
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-600 text-lg">No projects found</p>
          <p className="text-slate-500 text-sm mt-2">
            {filter === "all"
              ? "Create your first project to get started"
              : `No ${filter} projects`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
            <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 hover:border-teal-400 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors line-clamp-2 flex-1">
                    {project.title}
                  </h3>
                  <span
                    className={`ml-2 text-lg ${getPriorityColor(project.priority)}`}
                  >
                    {getPriorityIcon(project.priority)}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {project.description}
                  </p>
                )}

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold border ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {project.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-slate-500"
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
                      <span className="text-slate-600">
                        {project.tasks?.[0]?.count || 0} tasks
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  {project.start_date && (
                    <span className="text-slate-500 text-xs">
                      {new Date(project.start_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-7 w-3/4 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="space-y-2 mb-4 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

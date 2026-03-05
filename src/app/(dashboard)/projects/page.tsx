"use client";

import React from "react";
import ProjectsList from "@/components/projects-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-800">All Projects</h1>
        <p className="text-slate-600 mt-1">
          View and manage all your projects
        </p>
      </div>

      <ProjectsList />
    </div>
  );
}

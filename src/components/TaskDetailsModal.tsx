"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { supabaseBrowser } from "@/lib/supabase/client";
import { showToast } from "@/lib/toast";
import { Dropdown } from "@/components/ui/Dropdown";

interface TaskDetailsModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  projectId: string;
  onUpdate?: () => void;
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  isAdmin,
  projectId,
  onUpdate,
}: TaskDetailsModalProps) {
  const { user } = useAuthContext();
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === task.status) return;

    setUpdating(true);
    try {
      const { error } = await supabaseBrowser
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);

      if (error) throw error;
      showToast.success(`Status updated to ${newStatus.replace("-", " ")}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      showToast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !task) return null;

  const isAssigned = user?.id === task.assigned_to;
  const canUpdateStatus = isAdmin || isAssigned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-[32px] shadow-2xl overflow-hidden animate-scale-in flex flex-col h-full md:h-auto max-h-full md:max-h-[85vh] absolute bottom-0 md:relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="hidden sm:inline">Task Management</span>
              <span className="sm:hidden">Task</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto px-6 md:px-8 py-6 md:py-8 space-y-8 md:space-y-10 custom-scrollbar flex-grow">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              {task.title}
            </h2>

            {/* Property Rows */}
            <div className="space-y-6 md:space-y-4">
              <div className="flex flex-col md:grid md:grid-cols-[120px_1fr] md:items-center gap-2 md:gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </div>
                <div>
                  {canUpdateStatus ? (
                    <div className="w-full md:w-44">
                      <Dropdown
                        value={task.status}
                        onChange={(val: string | number) => handleStatusUpdate(val as string)}
                        disabled={updating}
                        options={[
                          { label: "Pending", value: "pending" },
                          { label: "In Progress", value: "in-progress" },
                          { label: "Completed", value: "completed" },
                        ]}
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700 capitalize pl-6 md:pl-0">{task.status?.replace("-", " ")}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-[120px_1fr] md:items-center gap-2 md:gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due date
                </div>
                <div className="font-bold text-slate-700 pl-6 md:pl-0">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "No date"}
                </div>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-[120px_1fr] md:items-center gap-2 md:gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Assignee
                </div>
                <div className="flex items-center gap-2 pl-6 md:pl-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 pr-4 group transition-all hover:border-teal-200 hover:bg-white">
                    {(() => {
                      const profile = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;
                      const username = profile?.username || "Unassigned";
                      return (
                        <>
                          <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-black uppercase">
                            {username[0]}
                          </div>
                          <span className="font-bold text-slate-700">{username}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-[120px_1fr] md:items-center gap-2 md:gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Label
                </div>
                <div className="flex flex-wrap gap-2 pl-6 md:pl-0">
                  <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${
                    task.priority === "high" || task.priority === "urgent" ? "bg-red-50 text-red-700 border-red-100" :
                    task.priority === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                    "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {task.priority} Priority
                  </span>
                  {(task.labels || []).map((label: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-black uppercase tracking-wider">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description
            </div>
            <div className="text-slate-600 font-medium leading-[1.8] text-sm pl-6 border-l-2 border-slate-100 ml-2">
              {task.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors order-2 sm:order-1"
          >
            Close
          </button>
          {isAdmin && (
            <a
              href={`/projects/${projectId}/tasks/${task.id}/edit`}
              className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 uppercase tracking-widest text-center order-1 sm:order-2"
            >
              Edit Task
            </a>
          )}
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}

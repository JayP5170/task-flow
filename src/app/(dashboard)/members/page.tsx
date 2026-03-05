"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { showToast } from "@/lib/toast";

interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

import { Skeleton } from "@/components/ui/skeleton";

export default function MembersPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, roleLoading, router]);

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (isAdmin && !fetchRef.current) {
      fetchRef.current = true;
      fetchMembers();
    }
  }, [isAdmin]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast.error("Failed to load members list");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabaseBrowser
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setMembers(members.map(m => m.id === userId ? { ...m, role: newRole } : m));
      showToast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      showToast.error("Failed to update role. " + (error.message || ""));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 opacity-0 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">Members</h1>
             {!loading && (
               <span className="bg-teal-500 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-teal-500/20">
                 {members.length} Squad
               </span>
             )}
          </div>
          <p className="text-slate-500 font-medium tracking-tight">
            Manage your high-performance team and their access levels
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden opacity-0 animate-fade-in-up delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-4 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em]">Identity</th>
                <th className="hidden lg:table-cell px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                <th className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em] text-center">Activation</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest md:tracking-[0.2em] text-right">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading || roleLoading ? (
                /* Member Table Skeletons */
                [1, 2, 3, 4, 5, 6].map((i) => <MemberTableRowSkeleton key={i} />)
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-black uppercase tracking-[0.2em] italic text-xs">
                    No active members found in the current squad.
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr 
                    key={member.id} 
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-4 md:px-10 py-4 md:py-6">
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="relative">
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-sm md:text-xl shadow-xl shadow-black/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 flex-shrink-0">
                            {member.username?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 md:w-5 h-3 md:h-5 bg-teal-500 rounded md:rounded-lg border md:border-2 border-white shadow-sm flex items-center justify-center">
                            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="font-black text-slate-800 text-sm md:text-lg tracking-tight group-hover:translate-x-1 transition-transform truncate">
                          {member.username || "Anonymous Operative"}
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-10 py-6">
                      <div className="text-slate-500 font-bold group-hover:text-teal-600 transition-colors">{member.email}</div>
                    </td>
                    <td className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] bg-slate-50 py-2 px-3 md:px-4 rounded-lg md:rounded-xl border border-slate-100 group-hover:border-teal-100 group-hover:bg-teal-50/30 transition-all">
                        {new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 md:px-10 py-4 md:py-6 text-right">
                      <span className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
                        member.role === 'admin' 
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-black/10' 
                          : 'bg-white text-teal-600 border-teal-100 shadow-sm'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MemberTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-50 last:border-b-0">
      <td className="px-4 md:px-10 py-4 md:py-6">
        <div className="flex items-center gap-3 md:gap-6">
          <Skeleton className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl shrink-0" />
          <Skeleton className="h-4 md:h-6 w-24 md:w-40 rounded-lg" />
        </div>
      </td>
      <td className="hidden lg:table-cell px-10 py-6">
        <Skeleton className="h-4 w-56 rounded-lg" />
      </td>
      <td className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-center">
        <Skeleton className="h-6 md:h-8 w-24 md:w-32 rounded-lg md:rounded-xl mx-auto" />
      </td>
      <td className="px-4 md:px-10 py-4 md:py-6 text-right">
        <Skeleton className="h-8 md:h-10 w-16 md:w-24 rounded-xl md:rounded-2xl ml-auto" />
      </td>
    </tr>
  );
}

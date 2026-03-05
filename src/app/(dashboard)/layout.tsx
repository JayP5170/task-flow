"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: "admin" | "employee";
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user: authUser, loading, signOut } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !authUser) {
      router.push("/login");
    }
  }, [authUser, loading, router]);

  const metadata = authUser?.user_metadata || {};
  const user: UserProfile | null = authUser ? {
    id: authUser.id,
    email: authUser.email || "",
    username: metadata.username || metadata.name || authUser.email?.split("@")[0] || "User",
    role: metadata.role || "employee",
  } : null;

  // ⚠️ CRITICAL: Do NOT render Sidebar/Header until role is confirmed.
  // Rendering with fallback "employee" causes admins to see the wrong menu on reload.
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex">
      <Sidebar
        role={user.role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          username={user.username}
          email={user.email}
          role={user.role}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

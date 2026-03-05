"use client";

import React from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  username: string;
  email: string;
  role: "admin" | "employee";
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Header({ username, email, role, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const displayName = username || "User";
  const displayEmail = email || "user@example.com";
  const displayRole = role || "employee";

  // Derive a friendly page title from pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/projects") return "Projects";
    if (pathname === "/projects/create") return "New Project";
    if (pathname?.startsWith("/projects") && pathname?.includes("/edit")) return "Edit Project";
    if (pathname?.startsWith("/projects")) return "Project";
    if (pathname === "/tasks") return "My Tasks";
    if (pathname === "/members") return "Members";
    if (pathname === "/reports") return "Reports";
    if (pathname === "/calendar") return "Calendar";
    if (pathname === "/progress") return "My Progress";
    if (pathname === "/settings") return "Settings";
    return "TaskFlow";
  };

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm flex-shrink-0 relative z-30">
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle - hidden on lg and up */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Left — Greeting + Date */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-800 font-black text-base md:text-xl tracking-tight leading-none">
                {getGreeting()}, <span className="text-teal-600">{displayName.split(" ")[0]}</span> 👋
              </h2>
            </div>
            <p className="hidden md:block text-slate-400 text-[10px] md:text-xs font-semibold mt-0.5 md:mt-1 uppercase tracking-widest whitespace-nowrap">
              {getFormattedDate()}
            </p>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-3">

          {/* Quick page indicator pill */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              {getPageTitle()}
            </span>
          </div>

          {/* Role Badge */}
          <div className={`hidden md:flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            displayRole === "admin"
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : "bg-teal-50 text-teal-600 border-teal-100"
          }`}>
            {displayRole === "admin" ? "⚡ Admin" : "👤 Employee"}
          </div>

          {/* Notification Bell */}
          {/* <button className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-white" />
          </button> */}

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 md:gap-3 pl-1 pr-1 md:pr-3 py-1 rounded-2xl md:hover:bg-slate-50 border border-transparent md:hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-md shadow-teal-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-slate-700 leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-400 capitalize mt-0.5">{displayEmail}</p>
              </div>
              <svg
                className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-20">
                  {/* Profile Header */}
                  <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-teal-50/30 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black shadow-md shadow-teal-500/20">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{displayName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{displayEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3 transition-colors font-semibold"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Settings
                    </Link>

                    <div className="my-1 mx-2 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-semibold"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileValues } from "@/lib/validations/profile";
import { showToast } from "@/lib/toast";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [notifications, setNotifications] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
    },
  });

  const username = watch("username");

  const fetchRef = React.useRef(false);

  useEffect(() => {
    if (user && !fetchRef.current) {
      fetchRef.current = true;
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      reset({
        username: data.username || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileValues) => {
    setUpdating(true);
    try {
      const { error } = await supabaseBrowser
        .from("profiles")
        .update({
          username: data.username,
        })
        .eq("id", user?.id);

      if (error) throw error;
      showToast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast.error("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 opacity-0 animate-fade-in-up">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none mb-4">Settings</h1>
        <p className="text-slate-500 font-medium">Customize your workspace and personal preferences</p>
      </div>

      <div className="space-y-12">
        {(authLoading || loading) ? (
          <>
            <SettingsSectionSkeleton />
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
              <Skeleton className="h-4 w-32 mb-10 rounded-full" />
              <div className="space-y-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          </>
        ) : (
          <>
            <section className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 opacity-0 animate-fade-in-up delay-100">
              <div className="flex items-center gap-8 mb-12">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-black/20 group-hover:scale-105 transition-transform duration-500">
                    {username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-teal-500 w-8 h-8 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Identity</h2>
                  <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest leading-none">Profile Core Details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Unique Username</label>
                    <input
                      {...register("username")}
                      type="text"
                      className={`w-full bg-slate-50 border ${errors.username ? 'ring-2 ring-red-500/20 bg-red-50/20' : 'none'} text-slate-800 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all font-bold placeholder-slate-300`}
                      placeholder="Username"
                    />
                    {errors.username && (
                      <p className="mt-1.5 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email (Immutable)</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 text-slate-400 font-bold cursor-not-allowed opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full md:w-auto bg-zinc-900 hover:bg-black text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 disabled:opacity-30 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deploying Changes...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsSectionSkeleton() {
  return (
    <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40">
      <div className="flex items-center gap-8 mb-12">
        <Skeleton className="w-24 h-24 rounded-[2rem]" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-10 w-48 rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 ml-1" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 ml-1" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
      <div className="pt-10 mt-10 border-t border-slate-50">
        <Skeleton className="h-14 w-40 rounded-2xl" />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterValues } from "@/lib/validations/auth";
import { showToast } from "@/lib/toast";
import Logo from "@/components/Logo";

import { useAuthContext } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      role: "employee",
    }
  });

  const selectedRole = watch("role");

  const handleRegister = async (data: RegisterValues) => {
    setLoading(true);

    try {
      const { data: authData, error } = await signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            email: data.email,
            role: data.role,
          },
        },
      });

      if (error) throw error;

      showToast.success("Registration successful! Please check your email to verify your account.");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

      console.log("Registered:", authData);
    } catch (error: any) {
      showToast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      showToast.error(error.message || "Google signup failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-teal-500/20 opacity-0 animate-fade-in">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8 opacity-0 animate-fade-in-up delay-100">
            <Logo size="xl" iconOnly />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-white text-center mb-6 md:mb-8 opacity-0 animate-fade-in-up delay-200">
            Registration
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit(handleRegister)} className="opacity-0 animate-fade-in-up delay-300">
            {/* Username Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <input
                {...register("username")}
                type="text"
                className={`w-full bg-slate-700/50 border ${errors.username ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 py-3 md:py-2 px-4 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-400 font-medium tracking-tight">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className={`w-full bg-slate-700/50 border ${errors.email ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 py-3 md:py-2 px-4 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium tracking-tight">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("role", "employee", { shouldValidate: true })}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    selectedRole === "employee"
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50 scale-105"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Employee</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("role", "admin", { shouldValidate: true })}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    selectedRole === "admin"
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50 scale-105"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Admin</span>
                  </div>
                </button>
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-400 font-medium tracking-tight">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                className={`w-full bg-slate-700/50 border ${errors.password ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 py-3 md:py-2 px-4 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium tracking-tight whitespace-pre-line">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                className={`w-full bg-slate-700/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 py-3 md:py-2 px-4 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400 font-medium tracking-tight">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-teal-500/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle to Login */}
          <div className="text-center mt-6">
            <span className="text-slate-400">Already have an account?</span>
            <Link
              href="/login"
              className="ml-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-teal-600 to-teal-500 p-8 md:p-12 items-center justify-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-8 right-8">
            <div className="w-12 h-12 bg-white/20 rounded-lg shadow-lg backdrop-blur-sm"></div>
            <div className="w-16 h-1 bg-white/30 mt-2 rounded-full"></div>
          </div>

          {/* Character Illustration */}
          <div className="relative z-10 text-center opacity-0 animate-fade-in delay-500">
            <div className="w-64 h-64 mx-auto mb-4 relative">
              {/* Person sitting */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {/* Head */}
                <div className="relative">
                  <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-2"></div>
                  {/* Hair */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-slate-800 rounded-t-full"></div>
                  {/* Face */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                {/* Body */}
                <div className="w-24 h-32 bg-white rounded-t-3xl"></div>
                {/* Legs */}
                <div className="flex gap-4 justify-center -mt-2">
                  <div className="w-16 h-20 bg-slate-700 rounded-full"></div>
                  <div className="w-16 h-20 bg-slate-700 rounded-full"></div>
                </div>
                {/* Phone */}
                <div className="absolute top-20 -left-8 w-12 h-20 bg-slate-800 rounded-lg shadow-lg"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Join Us Today!
            </h2>
            <p className="text-white/80 text-lg">
              Create your account and get started
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full backdrop-blur-sm opacity-0 animate-fade-in delay-700"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-white/5 rounded-full backdrop-blur-sm opacity-0 animate-fade-in delay-700"></div>
        </div>
      </div>
    </div>
  );
}

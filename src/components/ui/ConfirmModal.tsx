"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 space-y-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
            variant === "danger" ? "bg-red-50 text-red-500 shadow-red-500/10" : "bg-teal-50 text-teal-500 shadow-teal-500/10"
          }`}>
            {variant === "danger" ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-4 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:-translate-y-0.5 ${
                variant === "danger" 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                  : "bg-zinc-900 hover:bg-black text-white shadow-black/10"
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 px-8 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";

interface MonthYearPickerProps {
  currentDate: Date;
  onMonthSelect: (month: number) => void;
  onYearSelect: (year: number) => void;
}

export function MonthYearPicker({ currentDate, onMonthSelect, onYearSelect }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [baseYear, setBaseYear] = useState(currentDate.getFullYear() - (currentDate.getFullYear() % 12));
  const containerRef = useRef<HTMLDivElement>(null);

  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearRange = Array.from({ length: 12 }, (_, i) => baseYear + i);

  useEffect(() => {
    if (isOpen) {
      setBaseYear(currentDate.getFullYear() - (currentDate.getFullYear() % 12));
    }
  }, [isOpen, currentDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode("month");
        }}
        className="text-xs md:text-sm font-bold text-slate-800 min-w-[100px] md:min-w-[120px] text-center hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors flex flex-col items-center group active:scale-95"
      >
        <span className="leading-tight group-hover:text-teal-600 transition-colors">{monthName}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-400 transition-colors">{year}</span>
      </button>

      {isOpen && (
        <div className="absolute z-[110] mt-4 left-1/2 -translate-x-1/2 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-4 animate-scale-in origin-top">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {viewMode}
              </h4>
              {viewMode === "year" && (
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  <button 
                    onClick={() => setBaseYear(prev => prev - 12)}
                    className="hover:text-teal-500 transition-colors"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[9px] font-bold text-slate-400 w-16 text-center">
                    {yearRange[0]} - {yearRange[11]}
                  </span>
                  <button 
                    onClick={() => setBaseYear(prev => prev + 12)}
                    className="hover:text-teal-500 transition-colors"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setViewMode(viewMode === "month" ? "year" : "month")}
              className="text-[10px] font-black text-teal-500 uppercase hover:underline"
            >
              Go to {viewMode === "month" ? "Year" : "Month"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {viewMode === "month" ? (
              monthsShort.map((m, i) => (
                <button
                  key={m}
                  onClick={() => {
                    onMonthSelect(i);
                    setIsOpen(false);
                  }}
                  className={`py-3 rounded-2xl text-[10px] font-bold uppercase transition-all ${
                    i === currentDate.getMonth() 
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105" 
                      : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600"
                  }`}
                >
                  {m}
                </button>
              ))
            ) : (
              yearRange.map((yr) => (
                <button
                  key={yr}
                  onClick={() => {
                    onYearSelect(yr);
                    setViewMode("month");
                  }}
                  className={`py-3 rounded-2xl text-[10px] font-bold transition-all ${
                    yr === currentDate.getFullYear() 
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105" 
                      : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600"
                  }`}
                >
                  {yr}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

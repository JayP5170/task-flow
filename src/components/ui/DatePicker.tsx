"use client";

import React, { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

type ViewMode = "day" | "month" | "year";

export function DatePicker({ value, onChange, label, placeholder = "Select date", className = "", size = "sm" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset view mode when closing
        setTimeout(() => setViewMode("day"), 300);
      }
    };
    document.removeEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(formatDate(selectedDate));
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setViewMode("day");
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode("month");
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const changeYearRange = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear() + offset * 12, viewDate.getMonth(), 1));
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const fullMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  
  // Year range for selector (grid of 12 years)
  const startYear = currentYear - (currentYear % 12);
  const yearRange = Array.from({ length: 12 }, (_, i) => startYear + i);

  const daysCount = daysInMonth(currentYear, currentMonth);
  const firstDay = firstDayOfMonth(currentYear, currentMonth);

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <div 
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode("day");
        }}
        className={`w-full bg-slate-50 border border-slate-200 text-slate-800 ${size === "sm" ? "py-1.5 px-3" : "py-3 px-4"} rounded-2xl focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all font-bold text-sm flex items-center justify-between cursor-pointer group hover:border-teal-300 shadow-sm`}
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? new Date(value).toLocaleDateString() : placeholder}
        </span>
        <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-scale-in origin-top-left overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button 
              type="button"
              onClick={() => viewMode === "year" ? changeYearRange(-1) : changeMonth(-1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-teal-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center flex-1">
              <button 
                type="button"
                onClick={() => setViewMode(viewMode === "day" ? "month" : "year")}
                className="px-3 py-1 hover:bg-slate-50 rounded-xl transition-colors group flex flex-col items-center justify-center mx-auto"
              >
                {viewMode === "day" && (
                  <>
                    <span className="font-black text-slate-800 group-hover:text-teal-600 transition-colors">
                      {fullMonths[currentMonth]}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-400 transition-colors">
                      {currentYear}
                    </span>
                  </>
                )}
                {viewMode === "month" && (
                  <span className="font-black text-slate-800 group-hover:text-teal-600 transition-colors text-lg">
                    {currentYear}
                  </span>
                )}
                {viewMode === "year" && (
                  <span className="font-black text-slate-800 group-hover:text-teal-600 transition-colors text-lg">
                    {yearRange[0]} - {yearRange[11]}
                  </span>
                )}
              </button>
            </div>
            <button 
              type="button"
              onClick={() => viewMode === "year" ? changeYearRange(1) : changeMonth(1)}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-teal-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* View Modes */}
          <div className="min-h-[200px]">
            {viewMode === "day" && (
              <>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysCount }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelectedDate(day);
                    const today = isToday(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`
                          h-9 w-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center
                          ${selected 
                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110 z-10" 
                            : today 
                              ? "bg-teal-50 text-teal-600 border border-teal-100" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-teal-500"}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "month" && (
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`py-4 rounded-2xl text-sm font-bold transition-all ${
                      index === currentMonth 
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-500"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}

            {viewMode === "year" && (
              <div className="grid grid-cols-3 gap-2">
                {yearRange.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`py-4 rounded-2xl text-sm font-bold transition-all ${
                      year === currentYear 
                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-500"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {viewMode === "day" && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between">
              <button 
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Clear
              </button>
              <button 
                type="button"
                onClick={() => {
                  const today = new Date();
                  onChange(formatDate(today));
                  setIsOpen(false);
                }}
                className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
              >
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

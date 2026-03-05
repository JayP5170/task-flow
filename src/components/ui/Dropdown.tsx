"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: Option[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  error,
  className = "",
  size = "sm",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      setHighlightIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < options.length) {
            onChange(options[highlightIndex].value);
            setIsOpen(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, options, highlightIndex, onChange]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listboxRef.current) {
      const highlightedElement = listboxRef.current.children[highlightIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIndex]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && selectedOption) {
        const index = options.findIndex((opt) => opt.value === value);
        setHighlightIndex(index);
      }
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-slate-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between ${size === "sm" ? "py-2.5 md:py-1.5 px-3" : "py-3 px-4"} rounded-xl border transition-all font-bold text-sm shadow-sm outline-none
          ${disabled 
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
            : error 
              ? "bg-white border-red-300 text-red-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500" 
              : isOpen 
                ? "bg-white border-teal-500 ring-4 ring-teal-500/10 text-slate-800" 
                : "bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          }
        `}
      >
        <span className={`truncate ${!selectedOption && !disabled ? "text-slate-400" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-500" : "text-slate-400"}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {error && (
        <p className="mt-1.5 ml-1 text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-in">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {isOpen && (
        <div 
          ref={listboxRef}
          role="listbox"
          className="absolute z-[110] mt-2 w-full bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 animate-scale-in origin-top overflow-y-auto max-h-64 custom-scrollbar"
        >
          {options.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium italic">
              No options available
            </div>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={`
                    group flex items-center justify-between px-4 py-3.5 md:py-3 rounded-xl cursor-pointer transition-all font-bold text-sm mb-1 last:mb-0
                    ${isSelected 
                      ? "bg-teal-50 text-teal-700 shadow-sm" 
                      : isHighlighted 
                        ? "bg-slate-50 text-teal-600" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-500"
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white animate-scale-in">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

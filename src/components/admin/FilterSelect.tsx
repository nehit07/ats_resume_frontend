"use client";

import { useState, useRef, useEffect } from "react";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
}

export function FilterSelect({ value, onChange, options, placeholder = "Select..." }: FilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2
                    px-4 py-2.5 text-sm font-semibold rounded-xl
                    bg-primary/[0.06] border border-primary/20
                    text-foreground transition-all duration-200
                    hover:border-primary/40 hover:bg-primary/10
                    focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]
                    ${isOpen ? "border-primary/50 bg-primary/10 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]" : ""}
                `}
            >
                <span className="flex items-center gap-2">
                    {/* Filter icon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-primary/60 shrink-0">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span className={value ? "text-foreground" : "text-foreground-secondary/60"}>
                        {selectedLabel}
                    </span>
                </span>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-4 h-4 text-primary/60 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[160px] py-1.5
                    bg-background/95 backdrop-blur-xl
                    border border-white/10 rounded-xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)]
                    animate-in fade-in slide-in-from-top-2 duration-150
                ">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-3.5 py-2 text-sm font-medium
                                    transition-all duration-150 flex items-center gap-2
                                    ${isSelected
                                        ? "text-primary bg-primary/10"
                                        : "text-foreground/80 hover:text-foreground hover:bg-white/5"
                                    }
                                `}
                            >
                                {/* Check indicator */}
                                <span className={`w-4 text-xs ${isSelected ? "text-primary" : "opacity-0"}`}>
                                    ✓
                                </span>
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

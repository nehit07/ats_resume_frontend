"use client";

import { useState, useEffect, useRef } from "react";

interface SearchableDropdownProps {
    label?: string;
    placeholder: string;
    value: string;
    options: { label: string; value: string; isoCode?: string }[];
    onChange: (value: string, isoCode?: string) => void;
    onSearchChange?: (search: string) => void; // For async search
    disabled?: boolean;
    error?: boolean;
    isLoading?: boolean;
}

export const SearchableDropdown = ({
    label,
    placeholder,
    value,
    options,
    onChange,
    onSearchChange,
    disabled = false,
    error = false,
    isLoading = false,
}: SearchableDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    // Initial value sync
    useEffect(() => {
        if (value && !isOpen && search !== value) {
            setSearch(value);
        }
    }, [value, isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // On close, ensure parent has the latest search value if no option was mapped
                // This ensures "custom" input is preserved if the user clicked away
                if (search !== value) {
                    onChange(search);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [search, value, onChange]);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-medium text-foreground-secondary mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={isOpen ? search : value} // Show local search when open, prop value when closed
                    onChange={(e) => {
                        const newVal = e.target.value;
                        setSearch(newVal);
                        if (!isOpen) setIsOpen(true);

                        // Hybrid support: Update upstream immediately for custom text
                        onChange(newVal);

                        // Trigger async search if provided
                        if (onSearchChange) {
                            onSearchChange(newVal);
                        }
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        // Optional: clear search on focus if you want to show all options? 
                        // Usually better to keep current value text to edit it.
                    }}
                    disabled={disabled}
                    className={`w-full px-3 py-2 rounded-lg bg-background-secondary border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 bg-red-500/5' : 'border-border'}`}
                />
                {isLoading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && (filteredOptions.length > 0) && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-auto bg-background border border-border rounded-lg shadow-xl">
                    {filteredOptions.slice(0, 100).map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.label, opt.isoCode);
                                setSearch(opt.label);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && filteredOptions.length === 0 && search && !isLoading && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-xl p-3">
                    <p className="text-xs text-foreground-secondary text-center">
                        No matches found. Using &quot;{search}&quot;
                    </p>
                </div>
            )}
        </div>
    );
};

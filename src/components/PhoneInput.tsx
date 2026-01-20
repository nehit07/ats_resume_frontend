"use client";

import { useState, useEffect, useRef } from "react";
import { Country, ICountry } from "country-state-city";

interface PhoneInputProps {
    value: string;
    onChange: (fullNumber: string) => void;
    placeholder?: string;
    error?: boolean;
}

export default function PhoneInput({ value, onChange, placeholder = "Enter phone number", error = false }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCode, setSelectedCode] = useState("+91"); // Default to India
    const [phoneNumber, setPhoneNumber] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const countries: ICountry[] = Country.getAllCountries();

    // Filter countries with phone codes
    const countryOptions = countries
        .filter((c) => c.phonecode)
        .map((c) => ({
            name: c.name,
            code: c.phonecode.startsWith("+") ? c.phonecode : `+${c.phonecode}`,
            flag: c.flag,
            isoCode: c.isoCode,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const filteredOptions = countryOptions.filter(
        (opt) =>
            opt.name.toLowerCase().includes(search.toLowerCase()) ||
            opt.code.includes(search)
    );

    // Parse initial value to extract code and number
    useEffect(() => {
        if (value) {
            // Try to find a matching country code
            const matchedCountry = countryOptions.find((c) => value.startsWith(c.code));
            if (matchedCountry) {
                setSelectedCode(matchedCountry.code);
                setPhoneNumber(value.slice(matchedCountry.code.length).trim());
            } else if (value.startsWith("+")) {
                // Try to split at space or after first few digits
                const match = value.match(/^(\+\d{1,4})\s*(.*)$/);
                if (match) {
                    setSelectedCode(match[1]);
                    setPhoneNumber(match[2]);
                }
            } else {
                setPhoneNumber(value);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCodeSelect = (code: string) => {
        setSelectedCode(code);
        setIsOpen(false);
        setSearch("");
        onChange(`${code} ${phoneNumber}`.trim());
    };

    const handleNumberChange = (num: string) => {
        // Only allow digits, spaces, and hyphens
        const sanitized = num.replace(/[^\d\s-]/g, "");
        setPhoneNumber(sanitized);
        onChange(`${selectedCode} ${sanitized}`.trim());
    };

    // Find current country for flag display
    const currentCountry = countryOptions.find((c) => c.code === selectedCode);

    return (
        <div className="flex gap-2">
            {/* Country Code Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg bg-background-secondary border text-foreground text-sm hover:border-primary/50 transition-all min-w-[90px] ${error ? 'border-red-500 bg-red-500/5' : 'border-border'}`}
                >
                    {currentCountry?.flag && <span className="text-lg">{currentCountry.flag}</span>}
                    <span className="font-medium">{selectedCode}</span>
                    <svg className="w-3 h-3 ml-1 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-50 left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-xl">
                        {/* Search Input */}
                        <div className="p-2 border-b border-border">
                            <input
                                type="text"
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                autoFocus
                            />
                        </div>
                        {/* Options List */}
                        <div className="max-h-48 overflow-auto">
                            {filteredOptions.slice(0, 50).map((opt) => (
                                <button
                                    key={opt.isoCode}
                                    type="button"
                                    onClick={() => handleCodeSelect(opt.code)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${selectedCode === opt.code ? "bg-primary/5 text-primary" : "text-foreground"
                                        }`}
                                >
                                    <span className="text-lg">{opt.flag}</span>
                                    <span className="flex-1 truncate">{opt.name}</span>
                                    <span className="text-foreground-secondary font-mono">{opt.code}</span>
                                </button>
                            ))}
                            {filteredOptions.length === 0 && (
                                <p className="text-xs text-foreground-secondary text-center py-3">No results found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Phone Number Input */}
            <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder={placeholder}
                className={`flex-1 px-3 py-2 rounded-lg bg-background-secondary border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${error ? 'border-red-500 bg-red-500/5' : 'border-border'}`}
            />
        </div>
    );
}

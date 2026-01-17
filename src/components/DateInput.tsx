"use client";

import { useState, useEffect } from "react";

interface DateInputProps {
    value: string; // Expected format: "YYYY-MM" or "Month Year"
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

// Generate years from current year back to 1950
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

export default function DateInput({ value, onChange, disabled = false, placeholder }: DateInputProps) {
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    // Parse initial value
    useEffect(() => {
        if (value) {
            // Try to parse "YYYY-MM" format
            const match = value.match(/^(\d{4})-(\d{2})$/);
            if (match) {
                setYear(match[1]);
                setMonth(match[2]);
            } else {
                // Try to parse "Month Year" format
                const monthMatch = value.match(/^(\w+)\s+(\d{4})$/);
                if (monthMatch) {
                    const foundMonth = months.find(m => m.label.toLowerCase() === monthMatch[1].toLowerCase());
                    if (foundMonth) {
                        setMonth(foundMonth.value);
                        setYear(monthMatch[2]);
                    }
                }
            }
        }
    }, []);

    const handleMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        if (newMonth && year) {
            onChange(`${year}-${newMonth}`);
        } else if (!newMonth && !year) {
            onChange("");
        }
    };

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
        if (month && newYear) {
            onChange(`${newYear}-${month}`);
        } else if (!month && !newYear) {
            onChange("");
        }
    };

    return (
        <div className="flex gap-2">
            {/* Month Dropdown */}
            <select
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={disabled}
                className="flex-1 px-3 py-2 rounded-lg bg-background-secondary border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
            >
                <option value="">{placeholder ? "Month" : "Select Month"}</option>
                {months.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>

            {/* Year Dropdown */}
            <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={disabled}
                className="w-24 px-3 py-2 rounded-lg bg-background-secondary border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
            >
                <option value="">{placeholder ? "Year" : "Year"}</option>
                {years.map((y) => (
                    <option key={y} value={y.toString()}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
}

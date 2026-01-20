"use client";

import { useState, useEffect } from "react";
import { SearchableDropdown } from "./SearchableDropdown";
import { useDebounce } from "@/hooks/useDebounce";

interface InstitutionSelectorProps {
    value: string;
    onChange: (value: string) => void;
    country?: string;
    showErrors?: boolean;
}

interface University {
    name: string;
    domains: string[];
    web_pages: string[];
    country: string;
    alpha_two_code: string;
    "state-province": string | null;
}

export default function InstitutionSelector({
    value,
    onChange,
    country,
    showErrors = false,
}: InstitutionSelectorProps) {
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Use our custom hook for debouncing
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        const fetchUniversities = async () => {
            if (!debouncedSearch || debouncedSearch.length < 3) return;

            setLoading(true);
            try {
                let url = `http://universities.hipolabs.com/search?name=${encodeURIComponent(debouncedSearch)}`;
                if (country) {
                    url += `&country=${encodeURIComponent(country)}`;
                }

                const res = await fetch(url);
                const data: University[] = await res.json();

                // Deduplicate and format
                const unique = Array.from(new Set(data.map(u => u.name)));
                setOptions(unique.slice(0, 50).map(name => ({ label: name, value: name })));
            } catch (error) {
                console.error("Failed to fetch universities", error);
            } finally {
                setLoading(false);
            }
        };

        if (debouncedSearch) {
            fetchUniversities();
        }
    }, [debouncedSearch, country]);

    return (
        <SearchableDropdown
            placeholder="Type to search university..."
            value={value}
            options={options}
            onChange={(val) => {
                onChange(val);
                setSearchTerm(val);
            }}
            onSearchChange={(val) => setSearchTerm(val)}
            isLoading={loading}
            error={showErrors && !value.trim()}
        />
    );
}

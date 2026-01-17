"use client";

import { useState, useEffect, useRef } from "react";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";

interface LocationSelectorProps {
    country: string;
    state: string;
    city: string;
    onCountryChange: (value: string, isoCode: string) => void;
    onStateChange: (value: string, isoCode: string) => void;
    onCityChange: (value: string) => void;
    layout?: "horizontal" | "vertical";
    showLabels?: boolean;
}

interface SearchableDropdownProps {
    label: string;
    placeholder: string;
    value: string;
    options: { label: string; value: string; isoCode?: string }[];
    onChange: (value: string, isoCode?: string) => void;
    disabled?: boolean;
}

const SearchableDropdown = ({
    label,
    placeholder,
    value,
    options,
    onChange,
    disabled = false,
}: SearchableDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update search when value changes externally
    useEffect(() => {
        if (value && !isOpen) {
            setSearch(value);
        }
    }, [value, isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-foreground-secondary mb-1">
                {label}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                value={isOpen ? search : value || search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => {
                    setIsOpen(true);
                    setSearch("");
                }}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg bg-background-secondary border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isOpen && filteredOptions.length > 0 && (
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
            {isOpen && filteredOptions.length === 0 && search && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-xl p-3">
                    <p className="text-xs text-foreground-secondary text-center">No results found</p>
                </div>
            )}
        </div>
    );
};

export default function LocationSelector({
    country,
    state,
    city,
    onCountryChange,
    onStateChange,
    onCityChange,
    layout = "horizontal",
    showLabels = true,
}: LocationSelectorProps) {
    const [countryIso, setCountryIso] = useState<string>("");
    const [stateIso, setStateIso] = useState<string>("");

    // Get all countries
    const countries: ICountry[] = Country.getAllCountries();
    const countryOptions = countries.map((c) => ({
        label: c.name,
        value: c.name,
        isoCode: c.isoCode,
    }));

    // Get states for selected country
    const states: IState[] = countryIso ? State.getStatesOfCountry(countryIso) : [];
    const stateOptions = states.map((s) => ({
        label: s.name,
        value: s.name,
        isoCode: s.isoCode,
    }));

    // Get cities for selected state
    const cities: ICity[] = countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : [];
    const cityOptions = cities.map((c) => ({
        label: c.name,
        value: c.name,
    }));

    // Find country ISO code on initial load if country name is provided
    useEffect(() => {
        if (country && !countryIso) {
            const foundCountry = countries.find(
                (c) => c.name.toLowerCase() === country.toLowerCase()
            );
            if (foundCountry) {
                setCountryIso(foundCountry.isoCode);
            }
        }
    }, [country, countryIso, countries]);

    // Find state ISO code on initial load if state name is provided
    useEffect(() => {
        if (state && countryIso && !stateIso) {
            const foundState = states.find(
                (s) => s.name.toLowerCase() === state.toLowerCase()
            );
            if (foundState) {
                setStateIso(foundState.isoCode);
            }
        }
    }, [state, countryIso, stateIso, states]);

    const handleCountryChange = (value: string, isoCode?: string) => {
        setCountryIso(isoCode || "");
        setStateIso("");
        onCountryChange(value, isoCode || "");
        onStateChange("", "");
        onCityChange("");
    };

    const handleStateChange = (value: string, isoCode?: string) => {
        setStateIso(isoCode || "");
        onStateChange(value, isoCode || "");
        onCityChange("");
    };

    const handleCityChange = (value: string) => {
        onCityChange(value);
    };

    const containerClass = layout === "horizontal"
        ? "grid grid-cols-1 md:grid-cols-3 gap-3"
        : "space-y-3";

    return (
        <div className={containerClass}>
            <SearchableDropdown
                label={showLabels ? "Country" : ""}
                placeholder="Select country..."
                value={country}
                options={countryOptions}
                onChange={handleCountryChange}
            />
            <SearchableDropdown
                label={showLabels ? "State/Province" : ""}
                placeholder="Select state..."
                value={state}
                options={stateOptions}
                onChange={handleStateChange}
                disabled={!countryIso}
            />
            <SearchableDropdown
                label={showLabels ? "City" : ""}
                placeholder="Select city..."
                value={city}
                options={cityOptions}
                onChange={handleCityChange}
                disabled={!stateIso}
            />
        </div>
    );
}

// Simplified single location dropdown for just city or just country
export function SingleLocationDropdown({
    type,
    value,
    onChange,
    countryIso,
    stateIso,
    label,
    placeholder,
    disabled = false,
}: {
    type: "country" | "state" | "city";
    value: string;
    onChange: (value: string, isoCode?: string) => void;
    countryIso?: string;
    stateIso?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}) {
    let options: { label: string; value: string; isoCode?: string }[] = [];

    if (type === "country") {
        options = Country.getAllCountries().map((c) => ({
            label: c.name,
            value: c.name,
            isoCode: c.isoCode,
        }));
    } else if (type === "state" && countryIso) {
        options = State.getStatesOfCountry(countryIso).map((s) => ({
            label: s.name,
            value: s.name,
            isoCode: s.isoCode,
        }));
    } else if (type === "city" && countryIso && stateIso) {
        options = City.getCitiesOfState(countryIso, stateIso).map((c) => ({
            label: c.name,
            value: c.name,
        }));
    }

    return (
        <SearchableDropdown
            label={label || type.charAt(0).toUpperCase() + type.slice(1)}
            placeholder={placeholder || `Select ${type}...`}
            value={value}
            options={options}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

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
    showErrors?: boolean;
}

import { SearchableDropdown } from "./SearchableDropdown";

export default function LocationSelector({
    country,
    state,
    city,
    onCountryChange,
    onStateChange,
    onCityChange,
    layout = "horizontal",
    showLabels = true,
    showErrors = false,
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
                error={showErrors && !country}
            />
            <SearchableDropdown
                label={showLabels ? "State/Province" : ""}
                placeholder="Select state..."
                value={state}
                options={stateOptions}
                onChange={handleStateChange}
                disabled={!countryIso}
                error={showErrors && !state}
            />
            <SearchableDropdown
                label={showLabels ? "City" : ""}
                placeholder="Select city..."
                value={city}
                options={cityOptions}
                onChange={handleCityChange}
                disabled={!stateIso}
                error={showErrors && !city}
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

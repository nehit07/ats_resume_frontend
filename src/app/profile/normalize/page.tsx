"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Section types for navigation
type SectionType = "contact" | "summary" | "skills" | "education" | "experience" | "projects" | "achievements" | "certifications";

// Source types for tabs
type SourceType = "resume" | "linkedin" | "manual";

interface SectionData {
    resume: any;
    linkedin: any;
    manual: any;
    generated: any;
    has_sources: SourceType[];
}

interface AllSections {
    [key: string]: SectionData;
}

const SECTION_CONFIG: { key: SectionType; label: string; icon: string }[] = [
    { key: "contact", label: "Contact Info", icon: "👤" },
    { key: "summary", label: "Summary", icon: "📝" },
    { key: "skills", label: "Skills", icon: "🛠️" },
    { key: "education", label: "Education", icon: "🎓" },
    { key: "experience", label: "Experience", icon: "💼" },
    { key: "projects", label: "Projects", icon: "🚀" },
    { key: "achievements", label: "Achievements", icon: "🏆" },
    { key: "certifications", label: "Certifications", icon: "📜" },
];

const SOURCE_CONFIG: Record<SourceType, { label: string; icon: string }> = {
    resume: { label: "Resume", icon: "📄" },
    linkedin: { label: "LinkedIn", icon: "💼" },
    manual: { label: "Manual", icon: "✍️" },
};

export default function NormalizePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, accessToken } = useAuth();

    // State
    const [activeSection, setActiveSection] = useState<SectionType>("contact");
    const [activeSource, setActiveSource] = useState<SourceType | null>(null);
    const [sections, setSections] = useState<AllSections>({});
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isMerging, setIsMerging] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });

    // Source toggle state - which sources are ENABLED for merge
    const [enabledSources, setEnabledSources] = useState<Set<SourceType>>(new Set(["resume", "linkedin", "manual"]));

    // Edited content state - stores user modifications to generated content
    const [editedContent, setEditedContent] = useState<{ [section: string]: any }>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Generated content state - persists across section navigation
    const [generatedContent, setGeneratedContent] = useState<{ [section: string]: any }>({});

    // LocalStorage key for backup
    const STORAGE_KEY = `resumify_generated_${user?.id || 'guest'}`;

    // Restore generated content from localStorage on mount
    useEffect(() => {
        if (user?.id) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setGeneratedContent(parsed.generated || {});
                    setEditedContent(parsed.edited || {});
                }
            } catch (e) {
                console.error("Failed to restore from localStorage:", e);
            }
        }
    }, [user?.id, STORAGE_KEY]);

    // Save generated and edited content to localStorage whenever they change
    useEffect(() => {
        if (user?.id && (Object.keys(generatedContent).length > 0 || Object.keys(editedContent).length > 0)) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    generated: generatedContent,
                    edited: editedContent,
                    savedAt: new Date().toISOString()
                }));
            } catch (e) {
                console.error("Failed to save to localStorage:", e);
            }
        }
    }, [generatedContent, editedContent, user?.id, STORAGE_KEY]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast.type) {
            const timer = setTimeout(() => setToast({ message: "", type: null }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.type]);

    // Auth redirect
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Fetch section data
    const fetchSectionData = useCallback(async () => {
        if (!accessToken) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/section-data/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSections(data.sections);

                // Set initial active source to first available
                const currentSection = data.sections[activeSection];
                if (currentSection?.has_sources?.length > 0) {
                    setActiveSource(currentSection.has_sources[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch section data:", error);
            setToast({ message: "Failed to load data", type: "error" });
        } finally {
            setIsDataLoading(false);
        }
    }, [accessToken, activeSection]);

    // Fetch on mount
    useEffect(() => {
        if (accessToken) {
            fetchSectionData();
        }
    }, [accessToken, fetchSectionData]);

    // Update active source when section changes
    useEffect(() => {
        const currentSection = sections[activeSection];

        // Reset enabled sources when switching sections
        setEnabledSources(new Set(["resume", "linkedin", "manual"]));

        if (currentSection?.has_sources?.length > 0) {
            setActiveSource(currentSection.has_sources[0]);
        } else {
            setActiveSource(null);
        }
    }, [activeSection, sections]);

    // Toggle source for merge
    const toggleSource = (source: SourceType) => {
        setEnabledSources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(source)) {
                newSet.delete(source);

                // If we're disabling the currently active source, switch to another available one
                if (activeSource === source) {
                    const currentSection = sections[activeSection];
                    const stillAvailable = (currentSection?.has_sources || []).filter(
                        s => newSet.has(s)
                    );
                    if (stillAvailable.length > 0) {
                        setActiveSource(stillAvailable[0]);
                    } else {
                        setActiveSource(null);
                    }
                }
            } else {
                newSet.add(source);
                // If we enabling a source and currently have no active source, select this one
                if (!activeSource) {
                    const currentSection = sections[activeSection];
                    if (currentSection?.has_sources?.includes(source)) {
                        setActiveSource(source);
                    }
                }
            }
            return newSet;
        });
    };

    // Generate merged content for a section
    const handleGenerate = async () => {
        if (!accessToken) return;

        setIsMerging(true);
        try {
            const currentSection = sections[activeSection];
            // Only include sources that are both available AND enabled
            const sources = (currentSection?.has_sources || []).filter(
                source => enabledSources.has(source)
            );

            if (sources.length === 0) {
                setToast({ message: "Please enable at least one source", type: "error" });
                setIsMerging(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/ingestion/merge/${activeSection}/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sources }),
            });

            if (response.ok) {
                const data = await response.json();
                // Store generated content in persistent state (not in sections which gets refetched)
                setGeneratedContent(prev => ({
                    ...prev,
                    [activeSection]: data.generated,
                }));
                setToast({ message: "Content generated successfully!", type: "success" });
            } else {
                const errorData = await response.json().catch(() => ({}));
                setToast({ message: errorData.error || "Failed to generate content", type: "error" });
            }
        } catch (error) {
            console.error("Merge failed:", error);
            setToast({ message: "Failed to generate content", type: "error" });
        } finally {
            setIsMerging(false);
        }
    };

    // Generate merged content for ALL sections at once
    const handleGenerateAll = async () => {
        if (!accessToken) return;

        setIsMerging(true);
        try {
            const sectionsToGenerate = SECTION_CONFIG.map(s => s.key);
            const results: { [key: string]: any } = {};
            let successCount = 0;
            let errorCount = 0;

            // Generate for all sections in parallel
            const promises = sectionsToGenerate.map(async (sectionKey) => {
                const currentSection = sections[sectionKey];
                if (!currentSection) return null;

                // Only include sources that are both available AND enabled
                const sources = (currentSection.has_sources || []).filter(
                    source => enabledSources.has(source)
                );

                if (sources.length === 0) return null;

                try {
                    const response = await fetch(`${API_BASE_URL}/api/ingestion/merge/${sectionKey}/`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ sources }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        results[sectionKey] = data.generated;
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch {
                    errorCount++;
                }
            });

            await Promise.all(promises);

            // Update all generated content at once
            setGeneratedContent(prev => ({
                ...prev,
                ...results,
            }));

            if (successCount > 0) {
                setToast({
                    message: `Generated content for ${successCount} section${successCount > 1 ? 's' : ''}!`,
                    type: "success"
                });
            }
            if (errorCount > 0) {
                setToast({
                    message: `Failed to generate ${errorCount} section${errorCount > 1 ? 's' : ''}`,
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Generate all failed:", error);
            setToast({ message: "Failed to generate content", type: "error" });
        } finally {
            setIsMerging(false);
        }
    };

    // Save all generated/edited content to profile
    const handleSaveProfile = async () => {
        if (!accessToken) return;

        setIsSaving(true);
        try {
            // Collect all section data (edited or generated)
            const sectionsToSave: { [key: string]: any } = {};

            for (const sectionKey of SECTION_CONFIG.map(s => s.key)) {
                // Use edited content if available, otherwise use generated
                const content = editedContent[sectionKey] ?? generatedContent[sectionKey];
                if (content) {
                    sectionsToSave[sectionKey] = content;
                }
            }

            if (Object.keys(sectionsToSave).length === 0) {
                setToast({ message: "No content to save. Generate content first.", type: "error" });
                setIsSaving(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/ingestion/save-profile/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sections: sectionsToSave,
                    sources_used: Array.from(enabledSources)
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setToast({ message: `Profile saved! (v${data.version})`, type: "success" });

                // Clear localStorage backup after successful save
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    console.error("Failed to clear localStorage:", e);
                }

                // Clear local generated/edited state since it's now saved
                setGeneratedContent({});
                setEditedContent({});

                // Optionally redirect to dashboard after save
                // router.push("/dashboard");
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.error || "Failed to save profile", type: "error" });
            }
        } catch (error) {
            console.error("Save failed:", error);
            setToast({ message: "Failed to save profile", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const renderDataContent = (data: any) => {
        if (!data) {
            return (
                <div className="text-center text-foreground-secondary py-8">
                    <p>No data available for this source</p>
                </div>
            );
        }

        if (typeof data === "string") {
            return <p className="text-foreground whitespace-pre-wrap">{data}</p>;
        }

        if (Array.isArray(data)) {
            if (data.length === 0) {
                return (
                    <div className="text-center text-foreground-secondary py-4">
                        <p>No entries</p>
                    </div>
                );
            }
            return (
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="p-4 bg-background-secondary rounded-xl border border-border/50">
                            {renderDataContent(item)}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof data === "object") {
            const entries = Object.entries(data).filter(([key, v]) =>
                key !== "id" && v !== "" && v !== null && v !== undefined
            );
            if (entries.length === 0) {
                return (
                    <div className="text-center text-foreground-secondary py-4">
                        <p>No data</p>
                    </div>
                );
            }
            return (
                <div className="space-y-2">
                    {entries.map(([key, value]) => (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                            <span className="text-sm font-medium text-foreground-secondary min-w-[140px] capitalize">
                                {key.replace(/_/g, " ")}:
                            </span>
                            <div className="flex-1">
                                {typeof value === "object" && value !== null
                                    ? renderDataContent(value)
                                    : <span className="text-foreground">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <p className="text-foreground">{String(data)}</p>;
    };

    // Get the current content to display (edited if available, otherwise generated)
    const getCurrentContent = () => {
        return editedContent[activeSection] ?? generatedContent[activeSection];
    };

    // Update edited content for a field
    const updateEditedField = (path: string[], value: any) => {
        setEditedContent(prev => {
            const current = prev[activeSection] ?? JSON.parse(JSON.stringify(generatedContent[activeSection] || {}));
            let obj = current;
            for (let i = 0; i < path.length - 1; i++) {
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            return { ...prev, [activeSection]: current };
        });
    };

    const renderEditableContent = (data: any, path: string[] = []) => {
        if (!data) return null;

        if (typeof data === "string") {
            const isLongText = data.length > 100 || activeSection === "summary" || path.some(p => p.includes("description") || p.includes("summary"));
            if (isLongText) {
                return (
                    <textarea
                        value={data}
                        onChange={(e) => updateEditedField(path, e.target.value)}
                        className="input-field w-full min-h-[100px] resize-y"
                        placeholder="Enter text..."
                    />
                );
            }
            return (
                <input
                    type="text"
                    value={data}
                    onChange={(e) => updateEditedField(path, e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter text..."
                />
            );
        }

        if (Array.isArray(data)) {
            return (
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="p-4 bg-background-secondary rounded-xl border border-border/50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-foreground-secondary">Entry {index + 1}</span>
                                <button
                                    onClick={() => {
                                        const newData = [...data];
                                        newData.splice(index, 1);
                                        updateEditedField(path, newData);
                                    }}
                                    className="text-xs text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                            {renderEditableContent(item, [...path, String(index)])}
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            const newData = [...data, typeof data[0] === 'object' ? {} : ""];
                            updateEditedField(path, newData);
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        + Add Entry
                    </button>
                </div>
            );
        }

        if (typeof data === "object") {
            const entries = Object.entries(data).filter(([key]) => key !== "id");
            return (
                <div className="space-y-3">
                    {entries.map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-foreground-secondary capitalize">
                                {key.replace(/_/g, " ")}
                            </label>
                            {typeof value === "object" && value !== null ? (
                                <div className="pl-4 border-l-2 border-border/30">
                                    {renderEditableContent(value, [...path, key])}
                                </div>
                            ) : typeof value === "boolean" ? (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => updateEditedField([...path, key], e.target.checked)}
                                        className="w-4 h-4 rounded border-border accent-primary"
                                    />
                                    <span className="text-sm text-foreground">{value ? "Yes" : "No"}</span>
                                </label>
                            ) : typeof value === "string" && (value.length > 100 || key.includes("description")) ? (
                                <textarea
                                    value={value}
                                    onChange={(e) => updateEditedField([...path, key], e.target.value)}
                                    className="input-field w-full min-h-[80px] resize-y"
                                    placeholder={`Enter ${key.replace(/_/g, " ")}...`}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={String(value ?? "")}
                                    onChange={(e) => updateEditedField([...path, key], e.target.value)}
                                    className="input-field w-full"
                                    placeholder={`Enter ${key.replace(/_/g, " ")}...`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    // Loading state
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-foreground-secondary">Loading...</div>
            </div>
        );
    }

    // Helper to check if data has actual meaningful content
    const hasActualContent = (data: any): boolean => {
        if (!data) return false;
        if (Array.isArray(data)) return data.length > 0;
        if (typeof data === 'object') {
            const values = Object.values(data);
            return values.length > 0 && values.some(v => v !== null && v !== undefined && v !== '');
        }
        if (typeof data === 'string') return data.trim().length > 0;
        return true;
    };

    // Check if user has any ACTUAL data (not just empty sections)
    const hasAnyData = Object.keys(sections).length > 0 && Object.values(sections).some(
        (s: SectionData) => hasActualContent(s.resume) || hasActualContent(s.linkedin) || hasActualContent(s.manual) || hasActualContent(s.generated)
    );

    // Flag for showing blur overlay instead of empty state
    const showNoDataOverlay = !isDataLoading && !hasAnyData;

    const currentSectionData = sections[activeSection];
    // Only show sources that are both available AND enabled
    const availableSources = (currentSectionData?.has_sources || []).filter(
        source => enabledSources.has(source)
    );

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Blur Overlay when no data */}
            {showNoDataOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="glass-card p-8 max-w-md w-full mx-4 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            No Data Available
                        </h2>
                        <p className="text-foreground-secondary mb-6">
                            You need to first upload your resume or add your details on the Create Profile page and click <strong>&quot;Get My Data&quot;</strong> to process it.
                        </p>
                        <Link
                            href="/profile/create"
                            className="btn-primary w-full block text-center text-lg py-3"
                        >
                            Go to Create Profile
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-foreground-secondary hover:text-foreground text-sm mt-4 inline-block"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            )}

            {/* Header - Same as Create page */}
            <header className={`sticky border-b border-primary/0 bg-background/50 backdrop-blur-md top-0 h-16 z-30 ${showNoDataOverlay ? 'pointer-events-none' : ''}`}>
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center" style={{ maxWidth: '1400px' }}>
                    <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
                        <Image src="/logo.png" alt="Resumify" width={32} height={32} className="rounded-lg md:w-10 md:h-10" />
                        <span className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Sticky Action Bar */}
            <div className="sticky top-16 z-20 bg-background/50 backdrop-blur-xl border-b border-primary/0">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg md:text-xl font-semibold text-foreground">
                            ✨ Normalize & Merge
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            {(["resume", "linkedin", "manual"] as const).map(source => {
                                // Check if this source has data for the CURRENT section
                                const currentSection = sections[activeSection];
                                const hasData = currentSection?.has_sources?.includes(source) || false;
                                const isEnabled = enabledSources.has(source);
                                return (
                                    <button
                                        key={source}
                                        onClick={() => hasData && toggleSource(source)}
                                        disabled={!hasData}
                                        title={hasData ? (isEnabled ? "Click to exclude from merge" : "Click to include in merge") : `No ${source} data for this section`}
                                        className={`text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${!hasData
                                            ? "bg-background-secondary text-foreground-secondary border border-border/50 opacity-50 cursor-not-allowed"
                                            : isEnabled
                                                ? "bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20 cursor-pointer"
                                                : "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 cursor-pointer line-through"
                                            }`}
                                    >
                                        {hasData && isEnabled && "✓ "}
                                        {hasData && !isEnabled && "✕ "}
                                        {!hasData && "– "}
                                        {SOURCE_CONFIG[source].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile/create"
                            className="btn-secondary text-sm px-4 py-2"
                        >
                            Back to Create
                        </Link>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Profile</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Section Sidebar */}
                        <aside className="w-full lg:w-64 shrink-0">
                            <div className="glass-card p-2 md:p-4 lg:sticky lg:top-40 overflow-hidden">
                                <h3 className="hidden lg:block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3 px-2">
                                    Sections
                                </h3>
                                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 no-scrollbar">
                                    {SECTION_CONFIG.map(section => {
                                        const sectionData = sections[section.key];
                                        const hasSources = sectionData?.has_sources?.length > 0;
                                        const hasGenerated = !!generatedContent[section.key];

                                        return (
                                            <button
                                                key={section.key}
                                                onClick={() => setActiveSection(section.key)}
                                                className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-left transition-all duration-200 ${activeSection === section.key
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                    : hasSources
                                                        ? "hover:bg-background-secondary text-foreground"
                                                        : "hover:bg-background-secondary/50 text-foreground-secondary opacity-60"
                                                    }`}
                                            >
                                                <span className="text-base lg:text-lg">{section.icon}</span>
                                                <span className="font-medium text-xs lg:text-sm whitespace-nowrap">{section.label}</span>
                                                {hasGenerated && (
                                                    <span className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-green-500"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Generate All Button */}
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <button
                                        onClick={handleGenerateAll}
                                        disabled={isMerging}
                                        className="w-full btn-primary py-2 flex items-center justify-center shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isMerging ? (
                                            <>
                                                <span className="animate-spin">⏳</span>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>✨</span>
                                                <span>Generate All Content</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-foreground-secondary text-center mt-2">
                                        Generates AI content for all sections at once
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0">
                            {isDataLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-pulse text-foreground-secondary">Loading data...</div>
                                </div>
                            ) : (
                                <div className="glass-card overflow-hidden">
                                    {/* Section Header with Tabs */}
                                    <div className="border-b border-border/50 p-4 md:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <h2 className="text-xl font-semibold text-foreground capitalize flex items-center gap-2">
                                                <span>{SECTION_CONFIG.find(s => s.key === activeSection)?.icon}</span>
                                                {activeSection.replace(/_/g, " ")}
                                            </h2>

                                            {/* Source Tabs */}
                                            {availableSources.length > 0 && (
                                                <div className="flex gap-2">
                                                    {availableSources.map(source => (
                                                        <button
                                                            key={source}
                                                            onClick={() => setActiveSource(source)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeSource === source
                                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                                : "bg-background-secondary text-foreground hover:bg-primary/10 border border-border/50"
                                                                }`}
                                                        >
                                                            {SOURCE_CONFIG[source].icon} {SOURCE_CONFIG[source].label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Content */}
                                    <div className="p-4 md:p-6">
                                        {availableSources.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="text-4xl mb-4">📭</div>
                                                <h3 className="text-lg font-medium text-foreground mb-2">
                                                    No data available
                                                </h3>
                                                <p className="text-foreground-secondary mb-4">
                                                    No sources have data for this section.
                                                </p>
                                                <Link
                                                    href="/profile/create"
                                                    className="btn-primary inline-flex items-center gap-2"
                                                >
                                                    <span>Add Data</span>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div>
                                                {/* Source Data Display */}
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-lg">{SOURCE_CONFIG[activeSource!]?.icon}</span>
                                                        <h4 className="text-sm font-medium text-foreground-secondary">
                                                            Data from {SOURCE_CONFIG[activeSource!]?.label}
                                                            {activeSource === "manual" && (
                                                                <Link
                                                                    href="/profile/create"
                                                                    className="ml-2 text-primary hover:text-primary/80 text-xs"
                                                                >
                                                                    (Edit on Create Page)
                                                                </Link>
                                                            )}
                                                        </h4>
                                                    </div>
                                                    <div className="bg-background-secondary rounded-xl p-4 border border-border/50">
                                                        {renderDataContent(currentSectionData?.[activeSource!])}
                                                    </div>
                                                </div>

                                                {/* Generate This Section Button */}
                                                <div className="pt-4 border-t border-border/50">
                                                    <button
                                                        onClick={handleGenerate}
                                                        disabled={isMerging || availableSources.length === 0}
                                                        className="btn-secondary w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                    >
                                                        {isMerging ? (
                                                            <>
                                                                <span className="animate-spin">⏳</span>
                                                                <span>Generating...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>🔄</span>
                                                                <span>Regenerate This Section</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Generated Content - Editable */}
                                                {generatedContent[activeSection] && (
                                                    <div className="mt-6 p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-600">✓</span>
                                                                <h4 className="text-sm font-semibold text-green-600">
                                                                    Generated Content
                                                                </h4>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (!isEditing) {
                                                                        // Initialize edited content when entering edit mode
                                                                        setEditedContent(prev => ({
                                                                            ...prev,
                                                                            [activeSection]: JSON.parse(JSON.stringify(generatedContent[activeSection]))
                                                                        }));
                                                                    }
                                                                    setIsEditing(!isEditing);
                                                                }}
                                                                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${isEditing
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "bg-background-secondary text-foreground-secondary hover:bg-primary/10"
                                                                    }`}
                                                            >
                                                                {isEditing ? "✓ Done Editing" : "✏️ Edit"}
                                                            </button>
                                                        </div>
                                                        {isEditing ? (
                                                            <div className="bg-background rounded-lg p-4 border border-border/50">
                                                                {renderEditableContent(getCurrentContent())}
                                                            </div>
                                                        ) : (
                                                            renderDataContent(getCurrentContent() || generatedContent[activeSection])
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toast.type && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${toast.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

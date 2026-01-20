"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";
import ATSResumePreview from "@/components/ATSResumePreview";

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
    { key: "summary", label: "Summary", icon: "📄" },
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
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    // Source toggle state - which sources are ENABLED for merge
    const [enabledSources, setEnabledSources] = useState<Set<SourceType>>(new Set(["resume", "linkedin", "manual"]));

    // Edited content state - stores user modifications to generated content
    const [editedContent, setEditedContent] = useState<{ [section: string]: any }>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Generated content state - persists across section navigation
    const [generatedContent, setGeneratedContent] = useState<{ [section: string]: any }>({});
    const [sourceMeta, setSourceMeta] = useState<{ resume_id: string | null; linkedin_id: string | null } | null>(null);
    const [isInitialMount, setIsInitialMount] = useState(true);

    // LocalStorage key for backup
    const STORAGE_KEY = `resumify_generated_${user?.id || 'guest'}`;

    // Data restoration and cache invalidation logic
    useEffect(() => {
        if (user?.id && sourceMeta && isInitialMount) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);

                    // Check if sources have changed since last save
                    const metaMatch =
                        parsed.sourceMeta?.resume_id === sourceMeta.resume_id &&
                        parsed.sourceMeta?.linkedin_id === sourceMeta.linkedin_id;

                    if (metaMatch) {
                        setGeneratedContent(parsed.generated || {});
                        setEditedContent(parsed.edited || {});
                    } else {
                        console.log("Sources changed, clearing stale cache");
                        setGeneratedContent({});
                        setEditedContent({});
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
                setIsInitialMount(false);
            } catch (e) {
                console.error("Failed to handle localStorage:", e);
            }
        }
    }, [user?.id, STORAGE_KEY, sourceMeta, isInitialMount]);

    // Save generated and edited content to localStorage whenever they change
    useEffect(() => {
        if (user?.id && sourceMeta && (Object.keys(generatedContent).length > 0 || Object.keys(editedContent).length > 0)) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    generated: generatedContent,
                    edited: editedContent,
                    sourceMeta: sourceMeta,
                    savedAt: new Date().toISOString()
                }));
            } catch (e) {
                console.error("Failed to save to localStorage:", e);
            }
        }
    }, [generatedContent, editedContent, user?.id, STORAGE_KEY, sourceMeta]);

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
                setSourceMeta(data.source_meta);

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

    // Generate merged content for ALL sections at once using consolidated API
    const handleGenerateAll = async () => {
        if (!accessToken) return;

        setIsMerging(true);
        try {
            // Get all sections that have sources available
            const sectionsToGenerate = SECTION_CONFIG.filter(s =>
                sections[s.key]?.has_sources?.some(source => enabledSources.has(source))
            ).map(s => s.key);

            if (sectionsToGenerate.length === 0) {
                setToast({ message: "No source data enabled for any section", type: "error" });
                setIsMerging(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/ingestion/batch-merge/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sections: sectionsToGenerate,
                    sources: Array.from(enabledSources)
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Update all generated content at once
                setGeneratedContent(prev => ({
                    ...prev,
                    ...data.results,
                }));

                const successCount = Object.keys(data.results).length;
                setToast({
                    message: `Success! Generated content for ${successCount} sections.`,
                    type: "success"
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                setToast({ message: errorData.error || "Failed to generate all content", type: "error" });
            }
        } catch (error) {
            console.error("Batch merge failed:", error);
            setToast({ message: "Failed to connect to generator", type: "error" });
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
        <div className="h-screen flex flex-col relative overflow-hidden">
            {/* Blur Overlay when no data */}
            {showNoDataOverlay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl">
                    <div className="glass-card p-10 max-w-lg w-full mx-4 text-center shadow-[0_0_50px_rgba(99,102,241,0.2)] border-primary/20 animate-in fade-in zoom-in duration-500">
                        <div className="text-7xl mb-6 animate-bounce">📝</div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">
                            No Content Ready Yet
                        </h2>
                        <p className="text-foreground-secondary mb-8 text-lg leading-relaxed">
                            To see your resume flow here, you first need to upload your sources or add manual details in the <strong>Create Profile</strong> page.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/profile/create"
                                className="btn-primary w-full text-center text-lg py-4 shadow-xl shadow-primary/20"
                            >
                                Start Creating Profile
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-foreground-secondary hover:text-foreground text-sm font-medium transition-colors"
                            >
                                Go Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Header - Same as Create page */}
            <header className={`shrink-0 border-b border-white/10 bg-background/50 backdrop-blur-md h-16 z-30 ${showNoDataOverlay ? 'pointer-events-none' : ''}`}>
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
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
            <div className="shrink-0 bg-background/50 backdrop-blur-xl border-b border-white/10">
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

            {/* Main Content - 35% Editor / 65% Preview Split */}
            <main className="flex-1 overflow-hidden p-4 md:p-6">
                <div className="h-full max-w-[1400px] mx-auto">
                    <div className="h-full flex flex-col xl:flex-row gap-6">

                        {/* Left Panel - Editor (35%) */}
                        <div className="w-full xl:w-[38%] h-full flex flex-col gap-4 overflow-hidden">

                            {/* Section Navigation (Horizontal Pills) */}
                            <div className="glass-card p-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {SECTION_CONFIG.map(section => {
                                        const sectionData = sections[section.key];
                                        const hasSources = sectionData?.has_sources?.length > 0;
                                        const hasGenerated = !!generatedContent[section.key];

                                        return (
                                            <button
                                                key={section.key}
                                                onClick={() => setActiveSection(section.key)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeSection === section.key
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : hasSources
                                                        ? "bg-background-secondary hover:bg-primary/10 text-foreground"
                                                        : "bg-background-secondary/50 text-foreground-secondary opacity-60"
                                                    }`}
                                            >
                                                <span>{section.icon}</span>
                                                <span className="hidden sm:inline">{section.label}</span>
                                                {hasGenerated && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Generate All Button */}
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <button
                                        onClick={handleGenerateAll}
                                        disabled={isMerging}
                                        className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                </div>
                            </div>

                            {/* Section Editor */}
                            <div className="glass-card p-4 flex-1 overflow-hidden flex flex-col">
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/50">
                                    <h2 className="text-lg font-semibold text-foreground capitalize flex items-center gap-2">
                                        <span>{SECTION_CONFIG.find(s => s.key === activeSection)?.icon}</span>
                                        {activeSection.replace(/_/g, " ")}
                                    </h2>
                                </div>

                                {/* Source Tabs */}
                                {availableSources.length > 0 && (
                                    <div className="flex gap-1.5 mb-3">
                                        {availableSources.map(source => (
                                            <button
                                                key={source}
                                                onClick={() => setActiveSource(source)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeSource === source
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-background-secondary text-foreground hover:bg-primary/10"
                                                    }`}
                                            >
                                                {SOURCE_CONFIG[source].icon} {SOURCE_CONFIG[source].label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Content Area - Scrollable */}
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {isDataLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <div className="animate-pulse text-foreground-secondary">Loading...</div>
                                        </div>
                                    ) : availableSources.length === 0 ? (
                                        <div className="text-center py-10 text-foreground-secondary">
                                            <div className="text-4xl mb-2">📭</div>
                                            <p className="text-sm">No source data available for this section</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Source Preview */}
                                            {activeSource && currentSectionData?.[activeSource] && (
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-xs font-semibold text-foreground-secondary uppercase">
                                                            {SOURCE_CONFIG[activeSource].label} Data
                                                        </h4>
                                                        <button
                                                            onClick={() => toggleSource(activeSource)}
                                                            className={`text-xs px-2 py-1 rounded ${enabledSources.has(activeSource) ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
                                                        >
                                                            {enabledSources.has(activeSource) ? "✓ Enabled" : "✕ Disabled"}
                                                        </button>
                                                    </div>
                                                    <div className="bg-background-secondary/50 rounded-lg p-3 text-xs">
                                                        {renderDataContent(currentSectionData[activeSource])}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Regenerate Button */}
                                            <div className="mb-4">
                                                <button
                                                    onClick={handleGenerate}
                                                    disabled={isMerging || availableSources.length === 0}
                                                    className="btn-secondary w-full py-2 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
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

                                            {/* Generated Content */}
                                            {generatedContent[activeSection] && (
                                                <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-600">✓</span>
                                                            <h4 className="text-xs font-semibold text-green-600">Generated Content</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => setIsEditing(!isEditing)}
                                                            className={`text-xs px-2 py-1 rounded transition-all ${isEditing
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-background-secondary text-foreground-secondary hover:bg-primary/10"
                                                                }`}
                                                        >
                                                            {isEditing ? "✓ Done" : "✍️ Edit"}
                                                        </button>
                                                    </div>
                                                    <div className="text-xs overflow-y-auto">
                                                        {isEditing ? (
                                                            renderEditableContent(getCurrentContent())
                                                        ) : (
                                                            renderDataContent(getCurrentContent() || generatedContent[activeSection])
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Live Preview (62%) */}
                        <div className="w-full xl:w-[62%] h-full hidden xl:block overflow-hidden">
                            <div className="glass-card h-full flex flex-col p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider flex items-center gap-2">
                                        <span>📄</span> Live Resume Preview
                                    </h3>
                                    <span className="text-xs text-foreground-secondary bg-background-secondary px-2 py-1 rounded">
                                        Auto-updates as you edit
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow-inner flex items-start justify-center custom-scrollbar">
                                    <div className="origin-top py-4">
                                        {(() => {
                                            const getContent = (key: string) => {
                                                if (hasActualContent(editedContent[key])) return editedContent[key];
                                                if (hasActualContent(generatedContent[key])) return generatedContent[key];
                                                return null;
                                            };
                                            return (
                                                <ATSResumePreview
                                                    contact={getContent("contact")}
                                                    summary={getContent("summary")}
                                                    skills={getContent("skills")}
                                                    education={getContent("education")}
                                                    experience={getContent("experience")}
                                                    projects={getContent("projects")}
                                                    achievements={getContent("achievements")}
                                                    certifications={getContent("certifications")}
                                                    scale={0.55}
                                                />
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Preview FAB */}
                        <button
                            className="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                            onClick={() => setShowMobilePreview(true)}
                        >
                            📄
                        </button>

                    </div>
                </div>
            </main>

            {/* Mobile Preview Modal */}
            {showMobilePreview && (
                <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/100">
                        <h3 className="font-semibold flex items-center gap-2 text-foreground">
                            <span>📄</span> Resume Preview
                        </h3>
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-background-secondary hover:bg-primary/10 transition-colors text-foreground"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 pb-20">
                        <div className="mx-auto w-fit">
                            <ATSResumePreview
                                contact={editedContent.contact || generatedContent.contact || null}
                                summary={editedContent.summary || generatedContent.summary || null}
                                skills={editedContent.skills || generatedContent.skills || null}
                                education={editedContent.education || generatedContent.education || null}
                                experience={editedContent.experience || generatedContent.experience || null}
                                projects={editedContent.projects || generatedContent.projects || null}
                                achievements={editedContent.achievements || generatedContent.achievements || null}
                                certifications={editedContent.certifications || generatedContent.certifications || null}
                                scale={0.4} // Scale down for mobile
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-border/50 bg-background/100">
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="w-full btn-primary py-3 rounded-xl shadow-lg shadow-primary/20"
                        >
                            Back to Editor
                        </button>
                    </div>
                </div>
            )}

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

"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ATSResumePreview from "@/components/ATSResumePreview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Section keys with status tracking
type SectionStatus = "todo" | "edited" | "complete";
type SectionKey = "contact" | "summary" | "skills" | "education" | "experience" | "projects" | "achievements" | "certifications";

interface SectionDef {
    key: SectionKey;
    label: string;
    icon: string;
}

const SECTIONS: SectionDef[] = [
    { key: "contact", label: "Contact Info", icon: "👤" },
    { key: "summary", label: "Summary", icon: "📄" },
    { key: "skills", label: "Skills", icon: "🛠️" },
    { key: "education", label: "Education", icon: "🎓" },
    { key: "experience", label: "Experience", icon: "💼" },
    { key: "projects", label: "Projects", icon: "🚀" },
    { key: "achievements", label: "Achievements", icon: "🏆" },
    { key: "certifications", label: "Certifications", icon: "📜" },
];

function WorkspaceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading, accessToken } = useAuth();

    // View state
    const view = searchParams.get("view") || "edit";

    // State
    const [activeSection, setActiveSection] = useState<SectionKey>("contact");
    const [profileData, setProfileData] = useState<{ [key in SectionKey]?: any }>({});
    const [sectionStatuses, setSectionStatuses] = useState<{ [key in SectionKey]: SectionStatus }>({
        contact: "todo", summary: "todo", skills: "todo", education: "todo",
        experience: "todo", projects: "todo", achievements: "todo", certifications: "todo"
    });
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default to collapsed for more editor space

    // Auto-collapse section sidebar when main sidebar expands
    useEffect(() => {
        const checkMainSidebar = () => {
            const mainSidebarCollapsed = localStorage.getItem("resumify_sidebar_collapsed");
            // If main sidebar is expanded (not collapsed), collapse our section sidebar
            if (mainSidebarCollapsed === "false" || mainSidebarCollapsed === null) {
                setIsSidebarCollapsed(true);
            }
        };

        // Check on mount
        checkMainSidebar();

        // Listen for storage changes (when main sidebar toggles)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "resumify_sidebar_collapsed") {
                checkMainSidebar();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also poll periodically as storage events don't fire in same tab
        const interval = setInterval(checkMainSidebar, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Fetch initial profile data from ResumifyProfile (AI-generated resume)
    const fetchProfile = useCallback(async () => {
        if (!accessToken) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/profile/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                const initial: any = {};
                const statuses: any = { ...sectionStatuses };

                // Load sections from ResumifyProfile (AI-generated resume data)
                const sections = ['contact', 'summary', 'skills', 'education', 'experience', 'projects', 'achievements', 'certifications'];
                sections.forEach((key) => {
                    const content = data[key];
                    initial[key] = content;
                    if (content) statuses[key] = "edited";
                });
                setProfileData(initial);
                setSectionStatuses(statuses);
            } else if (response.status === 404) {
                setToast({ message: "Profile not found. Please generate one first.", type: "error" });
            }
        } catch (error) {
            setToast({ message: "Failed to load profile data", type: "error" });
        } finally {
            setIsDataLoading(false);
        }
    }, [accessToken]);


    useEffect(() => {
        if (accessToken) fetchProfile();
    }, [accessToken, fetchProfile]);

    // Handle authentication redirect
    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push("/login");
    }, [isLoading, isAuthenticated, router]);

    // Save Profile
    const handleSaveProfile = async () => {
        if (!accessToken) return;
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/save-profile/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sections: profileData }),
            });
            if (response.ok) {
                const data = await response.json();
                setToast({ message: `Profile saved as V${data.version}!`, type: "success" });
                // Mark current section as complete on save
                setSectionStatuses(prev => ({ ...prev, [activeSection]: "complete" }));
            }
        } catch {
            setToast({ message: "Save failed", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    // Generate Resume
    const handleGenerateResume = async () => {
        setIsGenerating(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            router.push("/profile/export");
        } catch {
            setToast({ message: "Generation failed", type: "error" });
        } finally {
            setIsGenerating(false);
        }
    };

    // Inline field update
    const updateField = (path: string[], value: any) => {
        setProfileData(prev => {
            const updated = JSON.parse(JSON.stringify(prev));

            // Handle empty path - replace entire section data (for add/remove array items)
            if (path.length === 0) {
                updated[activeSection] = value;
                return updated;
            }

            let current = updated[activeSection];
            if (!current) current = updated[activeSection] = {};

            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return updated;
        });

        // Mark section as edited when changed
        if (sectionStatuses[activeSection] !== "edited") {
            setSectionStatuses(prev => ({ ...prev, [activeSection]: "edited" }));
        }
    };

    // Helper for toasts
    useEffect(() => {
        if (toast.type) {
            const timer = setTimeout(() => setToast({ message: "", type: null }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.type]);

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative">
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar: Section Navigator + Progress */}
                <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} border-r border-white/5 bg-background-secondary/10 flex flex-col overflow-visible transition-all duration-300`}>
                    {/* Header with toggle button */}
                    {!isSidebarCollapsed ? (
                        <div className="p-4 pb-2 flex items-center justify-between">
                            <div>
                                <h3 className="text-[10px] font-black text-foreground-secondary tracking-[0.3em] uppercase opacity-40">Profile Sections</h3>
                                <p className="text-[9px] font-bold text-foreground-secondary mt-1 uppercase opacity-20">Edit & review</p>
                            </div>
                            <button
                                onClick={() => setIsSidebarCollapsed(true)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 group/collapseBtn"
                                title="Collapse Sections"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary group-hover/collapseBtn:text-primary transition-colors">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        /* Toggle Button when collapsed - hamburger menu icon */
                        <div className="relative group/menuBtn">
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="mx-auto mt-3 mb-2 w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-200"
                                title="Expand Sections"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                            </button>
                            {/* Tooltip for hamburger menu */}
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/menuBtn:opacity-100 translate-x-2 group-hover/menuBtn:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                Expand Sections
                            </div>
                        </div>
                    )}

                    <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'p-3'} space-y-1 overflow-y-auto no-scrollbar`}>
                        {SECTIONS.map((s) => {
                            const status = sectionStatuses[s.key];
                            const isActive = activeSection === s.key;
                            return (
                                <div key={s.key} className="relative group/sectionItem">
                                    <button
                                        onClick={() => setActiveSection(s.key)}
                                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-2xl transition-all ${isActive
                                            ? "bg-white/5 text-foreground shadow-sm"
                                            : "text-foreground-secondary hover:text-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-3'}`}>
                                            <span className={`text-xl transition-transform group-hover/sectionItem:scale-110 ${isActive ? "scale-110" : "opacity-40"}`}>{s.icon}</span>
                                            {!isSidebarCollapsed && <span className={`text-xs font-bold tracking-tight ${isActive ? "opacity-100" : "opacity-60"}`}>{s.label}</span>}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <div className="flex items-center">
                                                {status === "complete" && <span className="text-green-500 text-xs animate-in zoom-in duration-300">✅</span>}
                                                {status === "edited" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />}
                                                {status === "todo" && <span className="w-1.5 h-1.5 rounded-full border border-white/20" />}
                                            </div>
                                        )}
                                        {isSidebarCollapsed && status !== "todo" && (
                                            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${status === "complete" ? "bg-green-500" : "bg-amber-500"}`} />
                                        )}
                                    </button>

                                    {/* Styled Hover Tooltip - only when collapsed */}
                                    {isSidebarCollapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-4 py-2 bg-[#1a1a2e] backdrop-blur-md border border-white/20 rounded-lg opacity-0 group-hover/sectionItem:opacity-100 translate-x-2 group-hover/sectionItem:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-2xl whitespace-nowrap flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{s.label}</span>
                                            {status === "complete" && <span className="text-green-400 text-xs">✓</span>}
                                            {status === "edited" && <span className="text-amber-400 text-xs">●</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className={`${isSidebarCollapsed ? 'px-1 py-2' : 'p-4'} space-y-3 bg-white/[0.02] border-t border-white/5`}>
                        <div className="relative group/saveBtn">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                style={isSidebarCollapsed ? { padding: '12px 8px' } : undefined}
                                className={`btn-primary w-full ${isSidebarCollapsed ? '' : 'py-4'} text-[10px] font-black tracking-widest uppercase shadow-xl shadow-primary/20 flex items-center justify-center gap-2`}
                            >
                                {isSidebarCollapsed ? (
                                    isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                            <polyline points="7 3 7 8 15 8"></polyline>
                                        </svg>
                                    )
                                ) : (
                                    isSaving ? "SAVING..." : "SAVE PROFILE"
                                )}
                            </button>
                            {/* Tooltip for save button when collapsed */}
                            {isSidebarCollapsed && (
                                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/saveBtn:opacity-100 translate-x-2 group-hover/saveBtn:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Center: Editor Panel */}
                <main className="flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 p-12">
                    {isDataLoading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-sm font-bold animate-pulse">Initializing Workspace...</span>
                            </div>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto space-y-10">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{SECTIONS.find(s => s.key === activeSection)?.icon}</span>
                            <h2 className="text-5xl font-black tracking-tighter capitalize">{activeSection.replace(/_/g, " ")}</h2>
                        </div>

                        <div className="glass-card p-10 min-h-[600px] border-primary/10 shadow-2xl relative transition-all">
                            <div className="absolute -top-3 -left-3 px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/20 rounded-lg text-[10px] font-black text-primary shadow-xl tracking-[0.2em] uppercase">
                                AI Profile Editor
                            </div>
                            {renderEditor(profileData[activeSection], activeSection, updateField)}
                        </div>
                    </div>
                </main>

                {/* Right Panel: Live Preview */}
                <aside className="w-[500px] xl:w-[650px] border-l border-white/5 bg-background-secondary/30 flex flex-col overflow-hidden relative">
                    <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 shrink-0">
                        <span className="text-[9px] font-black tracking-[0.2em] text-foreground-secondary uppercase flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live Resume Preview
                            <span className="opacity-30 font-bold px-2 py-0.5 border border-white/20 rounded-full">Read-Only</span>
                        </span>
                        <div className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">A4 Standard Layout</div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-900/50 p-10 flex justify-center custom-scrollbar">
                        <div className="shadow-2xl h-fit transform scale-[0.8] xl:scale-[0.9] origin-top transition-transform duration-500 hover:scale-95 cursor-zoom-in">
                            <ATSResumePreview
                                contact={profileData.contact}
                                summary={profileData.summary}
                                skills={profileData.skills}
                                education={profileData.education}
                                experience={profileData.experience}
                                projects={profileData.projects}
                                achievements={profileData.achievements}
                                certifications={profileData.certifications}
                                scale={0.7}
                            />
                        </div>
                    </div>

                    {/* Preview Hover Label */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/5 rounded-full text-[10px] font-black text-white/40 tracking-widest uppercase pointer-events-none">
                        Automatic Real-Time Sync
                    </div>
                </aside>
            </div>

            {/* Toast Notifications */}
            {toast.type && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                        <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WorkspaceEditPage() {
    return (
        <Suspense fallback={<div className="flex-1 bg-background" />}>
            <WorkspaceContent />
        </Suspense>
    );
}

// Editor Router Component
function renderEditor(data: any, section: SectionKey, onUpdate: (path: string[], val: any) => void) {
    if (!data) return <div className="flex flex-col items-center justify-center py-40 text-foreground-secondary gap-4">
        <span className="text-5xl opacity-10">📭</span>
        <span className="text-[10px] font-black tracking-widest uppercase opacity-30">No generated content found.</span>
    </div>;

    const renderField = (label: string, value: string, path: string[]) => (
        <div key={path.join("-")} className="space-y-3 mb-8 group">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black tracking-[0.2em] text-foreground-secondary uppercase group-focus-within:text-primary transition-colors">
                    {label.replace(/_/g, " ")}
                </label>
                {/* {value?.length > 0 && <span className="text-[9px] font-bold opacity-10 uppercase tracking-widest">{value.length} Chars</span>} */}
            </div>
            <textarea
                value={value || ""}
                onChange={(e) => onUpdate(path, e.target.value)}
                rows={(() => {
                    const l = label.toLowerCase();
                    const largeFields = ["description", "summary", "professional summary", "professional_summary", "job_description", "job description", "skills", "technical skills"];
                    return largeFields.some(f => l.includes(f)) ? 10 : 1;
                })()}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm focus:border-primary/50 focus:bg-white/[0.05] outline-none transition-all resize-none shadow-inner leading-relaxed"
                placeholder={`Type ${label.replace(/_/g, " ")}...`}
            />
        </div>
    );

    const renderObject = (obj: any, path: string[]) => (
        <div key={path.join("-")} className="grid grid-cols-1 gap-y-2">
            {Object.entries(obj).filter(([k]) => k !== "id").map(([k, v]) => (
                typeof v === "object" && !Array.isArray(v) && v !== null
                    ? <div key={k} className="col-span-2 mt-6 border-l-2 border-primary/10 pl-8">{renderObject(v, [...path, k])}</div>
                    : renderField(k, String(v ?? ""), [...path, k])
            ))}
        </div>
    );

    // Handle summary - can be string or {text: string}
    if (section === "summary") {
        const summaryText = typeof data === 'string' ? data : (data?.text || '');
        return renderField("Professional Summary", summaryText, []);
    }

    // Handle skills - can be string or {skills: string}
    if (section === "skills") {
        const skillsText = typeof data === 'string' ? data : (data?.skills || '');
        return renderField("Technical Skills", skillsText, []);
    }

    if (Array.isArray(data)) {
        // Empty templates for each section type
        const emptyTemplates: { [key: string]: any } = {
            education: {
                degree_type: "",
                institution_name: "",
                city: "",
                state: "",
                country: "",
                start_date: "",
                end_date: "",
                is_pursuing: false,
                grade: ""
            },
            experience: {
                company_name: "",
                job_role: "",
                job_description: "",
                city: "",
                country: "",
                start_date: "",
                end_date: "",
                is_current: false
            },
            projects: {
                name: "",
                description: "",
                technologies: "",
                url: ""
            },
            achievements: {
                title: "",
                description: ""
            },
            certifications: {
                title: "",
                issued_by: "",
                issue_date: "",
                expiry_date: "",
                credential_url: ""
            }
        };

        const getEmptyTemplate = () => emptyTemplates[section] || {};

        return (
            <div className="space-y-16">
                {data.map((item, i) => (
                    <div key={i} className="relative pt-12 border-t-2 border-dashed border-white/5 first:border-0 first:pt-0 group/item">
                        <div className="absolute top-0 right-0 flex items-center gap-3">
                            <span className="text-[9px] font-black opacity-10 uppercase tracking-[0.4em] group-hover/item:opacity-30 transition-opacity">Entry {String(i + 1).padStart(2, '0')}</span>
                            <div className="h-4 w-px bg-white/5" />
                            <button
                                onClick={() => {
                                    const next = [...data];
                                    next.splice(i, 1);
                                    onUpdate([], next);
                                }}
                                className="text-[9px] font-black text-red-500/30 hover:text-red-500 tracking-widest transition-all uppercase"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="mt-8">
                            {renderObject(item, [String(i)])}
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => onUpdate([], [...data, getEmptyTemplate()])}
                    className="w-full py-8 rounded-3xl border-2 border-dashed border-white/5 text-foreground-secondary hover:text-primary hover:border-primary/20 hover:bg-primary/[0.02] text-[10px] font-black tracking-[0.3em] transition-all uppercase"
                >
                    + Add New {section.replace(/s$/, '').toUpperCase()}
                </button>
            </div>
        );
    }

    if (typeof data === "object" && data !== null) return renderObject(data, []);

    return renderField(section, String(data), []);
}

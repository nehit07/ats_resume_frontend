"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ATSResumePreview from "@/components/ATSResumePreview";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ATSCriterion {
    name: string;
    score: number;
    max_score: number;
    passed: boolean;
    feedback: string;
}

interface ATSResult {
    overall_score: number;
    grade: string;
    criteria: ATSCriterion[];
    overall_feedback: string;
    top_improvements: string[];
}

interface JobSuggestion {
    role: string;
    match_level: string;
    reasoning: string;
    key_matching_skills: string[];
}

interface JobResult {
    suggestions: JobSuggestion[];
    career_summary: string;
}

export default function ExportPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, accessToken } = useAuth();

    const [profileData, setProfileData] = useState<any>({});
    const [isDataLoading, setIsDataLoading] = useState(true);

    // AI Agent states
    const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsError, setAtsError] = useState<string | null>(null);

    const [jobResult, setJobResult] = useState<JobResult | null>(null);
    const [jobLoading, setJobLoading] = useState(false);
    const [jobError, setJobError] = useState<string | null>(null);

    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingDocx, setExportingDocx] = useState(false);

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        if (!accessToken) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/profile/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setIsDataLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) fetchProfile();
    }, [accessToken, fetchProfile]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/login");
    }, [isAuthenticated, isLoading, router]);

    // Auto-trigger ATS + Job agents once profile loads
    useEffect(() => {
        if (profileData?.contact && accessToken && !atsResult && !atsLoading) {
            runATSAgent();
        }
        if (profileData?.contact && accessToken && !jobResult && !jobLoading) {
            runJobAgent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileData]);

    // --- ATS Score Agent ---
    const runATSAgent = async () => {
        setAtsLoading(true);
        setAtsError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ingestion/ats-score/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "ATS scoring failed");
            }
            const data: ATSResult = await res.json();
            setAtsResult(data);
        } catch (err: any) {
            setAtsError(err.message || "Something went wrong");
            console.error("ATS Agent error:", err);
        } finally {
            setAtsLoading(false);
        }
    };

    // --- Job Suggestion Agent ---
    const runJobAgent = async () => {
        setJobLoading(true);
        setJobError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ingestion/job-suggestions/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Job suggestions failed");
            }
            const data: JobResult = await res.json();
            setJobResult(data);
        } catch (err: any) {
            setJobError(err.message || "Something went wrong");
            console.error("Job Agent error:", err);
        } finally {
            setJobLoading(false);
        }
    };

    // --- Export handlers ---
    const handleExport = async (format: "pdf" | "docx") => {
        const setLoading = format === "pdf" ? setExportingPdf : setExportingDocx;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ingestion/export/?file_format=${format}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
                const errorText = await res.text().catch(() => "No response body");
                console.error(`Export ${format} failed with status ${res.status}:`, errorText);
                throw new Error(`Export failed (${res.status})`);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Resume.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Export ${format} error:`, err);
            alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // --- Derived display values ---
    const score = atsResult?.overall_score ?? 0;
    const grade = atsResult?.grade ?? "—";
    const scoreColor = score >= 80 ? "text-green-400" : score >= 50 ? "text-amber-400" : "text-red-400";
    const scoreRingColor = score >= 80 ? "stroke-green-400" : score >= 50 ? "stroke-amber-400" : "stroke-red-400";
    const scoreBgColor = score >= 80 ? "bg-green-500/10 border-green-500/20" : score >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

    const matchIcons: Record<string, string> = {
        "High": "🎯",
        "Medium": "📊",
        "Emerging": "🌱",
    };

    return (
        <div className="flex-1 flex h-full bg-transparent overflow-hidden">
            {/* LEFT: Main Content Panels */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 xl:p-8">
                {isDataLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <span className="text-sm font-bold animate-pulse">Loading Export Data...</span>
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Page Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <span className="text-4xl">📥</span>
                        <div>
                            <h2 className="text-4xl xl:text-5xl font-black tracking-tighter">Export</h2>

                        </div>
                    </div>

                    {/* TOP CARD: ATS Scoring (AI Agent) */}
                    <div className="glass-card p-10 border-primary/10 shadow-2xl relative">
                        <div className="absolute -top-3 -left-3 px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/20 rounded-lg text-[10px] font-black text-primary shadow-xl tracking-[0.2em] uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            ATS Score Analysis
                        </div>

                        {atsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-xs font-bold text-foreground-secondary animate-pulse">AI is analyzing your resume...</span>
                                <span className="text-[10px] text-foreground-secondary opacity-40">This may take 10-20 seconds</span>
                            </div>
                        ) : atsError ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <span className="text-red-400 text-sm font-bold">{atsError}</span>
                                <button
                                    onClick={runATSAgent}
                                    className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
                                >
                                    Retry Analysis
                                </button>
                            </div>
                        ) : atsResult ? (
                            <div className="mt-2">
                                {/* Top row: Score Ring + Grade + Criteria Grid */}
                                <div className="flex items-start gap-6">
                                    {/* Score Ring - compact */}
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/5" />
                                                <circle
                                                    cx="60" cy="60" r="52" fill="none"
                                                    strokeWidth="10" strokeLinecap="round"
                                                    strokeDasharray={`${(score / 100) * 327} 327`}
                                                    className={`${scoreRingColor} transition-all duration-1000`}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
                                                <span className="text-[7px] font-bold text-foreground-secondary uppercase tracking-widest opacity-50">/ 100</span>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${scoreBgColor}`}>
                                            Grade: {grade}
                                        </div>
                                    </div>

                                    {/* Criteria - 2-column compact grid */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[9px] font-black text-foreground-secondary uppercase tracking-[0.2em] mb-2 opacity-40">
                                            Scoring Criteria
                                        </h3>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {atsResult.criteria.map((c, i) => {
                                                const isPassed = c.passed ?? (c.max_score > 0 ? (c.score / c.max_score) >= 0.6 : false);
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                                                        title={c.feedback}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-400/50'}`}>
                                                                {isPassed ? '✓' : '×'}
                                                            </span>
                                                            <span className={`text-[11px] font-bold truncate ${isPassed ? 'text-foreground' : 'text-foreground-secondary opacity-60'}`}>
                                                                {c.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-foreground-secondary opacity-30 uppercase tracking-wider shrink-0 ml-1">
                                                            {c.score}/{c.max_score}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Improvements - inline compact row */}
                                {atsResult.top_improvements && atsResult.top_improvements.length > 0 && (
                                    <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                        <span className="text-[8px] font-black text-amber-400 uppercase tracking-[0.1em] shrink-0 mt-0.5">Tips</span>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                                            {atsResult.top_improvements.map((tip, i) => (
                                                <span key={i} className="text-[10px] text-foreground-secondary opacity-70">
                                                    • {tip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-foreground-secondary opacity-40 text-sm">
                                No analysis available yet.
                            </div>
                        )}
                    </div>

                    {/* BOTTOM ROW: 2 Cards side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Bottom-Left: Job Role Suggestions (AI Agent) */}
                        <div className="glass-card p-5 border-primary/10 shadow-2xl relative">
                            <div className="absolute -top-2.5 -left-2.5 px-3 py-1 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/20 rounded-lg text-[9px] font-black text-indigo-400 shadow-xl tracking-[0.2em] uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                Job Suggestions
                            </div>

                            {jobLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3 mt-1">
                                    <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
                                    <span className="text-xs font-bold text-foreground-secondary animate-pulse">Analyzing your career path...</span>
                                </div>
                            ) : jobError ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-4 mt-2">
                                    <span className="text-red-400 text-sm font-bold">{jobError}</span>
                                    <button
                                        onClick={runJobAgent}
                                        className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : jobResult ? (
                                <div className="mt-1 space-y-1.5">
                                    <p className="text-[9px] font-bold text-foreground-secondary uppercase tracking-[0.15em] opacity-40 mb-1.5">
                                        AI-powered career analysis
                                    </p>
                                    {jobResult.suggestions.map((job, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all group cursor-default"
                                            title={job.reasoning}
                                        >
                                            <span className="text-base group-hover:scale-110 transition-transform">
                                                {matchIcons[job.match_level] || "💼"}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold text-foreground block truncate">{job.role}</span>
                                                <span className="text-[8px] text-foreground-secondary opacity-50 truncate block">
                                                    {job.key_matching_skills?.slice(0, 3).join(", ")}
                                                </span>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${job.match_level === "High"
                                                ? "text-green-400 bg-green-500/10 border-green-500/20"
                                                : job.match_level === "Medium"
                                                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                                    : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                                                }`}>
                                                {job.match_level}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Career summary */}
                                    {jobResult.career_summary && (
                                        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                            <p className="text-[9px] text-foreground-secondary opacity-60 leading-relaxed line-clamp-2">
                                                {jobResult.career_summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-foreground-secondary opacity-40 text-sm mt-2">
                                    No suggestions available yet.
                                </div>
                            )}
                        </div>

                        {/* Bottom-Right: Export & Download */}
                        <div className="glass-card p-5 border-primary/10 shadow-2xl relative">
                            <div className="absolute -top-2.5 -left-2.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 shadow-xl tracking-[0.2em] uppercase">
                                Export & Download
                            </div>

                            <div className="mt-1 space-y-3">
                                <p className="text-[9px] font-bold text-foreground-secondary uppercase tracking-[0.15em] opacity-40 mb-2">
                                    Choose format
                                </p>

                                {/* PDF Export */}
                                <button
                                    onClick={() => handleExport("pdf")}
                                    disabled={exportingPdf}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        {exportingPdf ? (
                                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-foreground block">
                                            {exportingPdf ? "Generating PDF..." : "Download as PDF"}
                                        </span>
                                        <span className="text-[9px] text-foreground-secondary opacity-60">ATS-optimized • Print-ready</span>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </button>

                                {/* DOCX Export */}
                                <button
                                    onClick={() => handleExport("docx")}
                                    disabled={exportingDocx}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                        {exportingDocx ? (
                                            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-foreground block">
                                            {exportingDocx ? "Generating DOCX..." : "Download as DOCX"}
                                        </span>
                                        <span className="text-[9px] text-foreground-secondary opacity-60">Editable • Microsoft Word</span>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-secondary opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* RIGHT: Live Resume Preview */}
            <aside className="w-[500px] xl:w-[650px] border-l border-white/5 bg-background-secondary/30 flex flex-col overflow-hidden relative">
                <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 shrink-0">
                    <span className="text-[9px] font-black tracking-[0.2em] text-foreground-secondary uppercase flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Resume Preview
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

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/5 rounded-full text-[10px] font-black text-white/40 tracking-widest uppercase pointer-events-none">
                    Your Final Resume
                </div>
            </aside>
        </div>
    );
}

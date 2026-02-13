"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Icons } from "@/components/Icons";

/* ─── Activity Icons Mapping ─── */
const ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
    profile_created: Icons.plus,
    profile_updated: Icons.edit,
    profile_normalized: Icons.merge,
    profile_approved: Icons.shield,
    resume_uploaded: Icons.upload,
    linkedin_imported: Icons.linkedin,
    ai_processed: Icons.bot,
};

interface SourceInfo { connected: boolean; count: number; latest: string | null; }
interface ActivityItem { type: string; label: string; icon: string; timestamp: string; }
interface ProfileStatus {
    exists: boolean; status: string; version: number; completeness: number; last_updated: string | null;
    sections: Record<string, boolean>;
    sources: { resume: SourceInfo; linkedin: SourceInfo; manual: SourceInfo; };
    stats: { resume_files: number; linkedin_files: number; profile_created: string | null; profile_updated: string | null; };
    recent_activity: ActivityItem[];
}

function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

export default function DashboardPage() {
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [ps, setPs] = useState<ProfileStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!isAuthenticated || !accessToken) {
            if (!isLoading) setLoading(false);
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingestion/profile-status/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setPs(d); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [accessToken, isAuthenticated, isLoading, router]);

    if (loading || isLoading) return (
        <div className="flex-1" />
    );

    if (!ps?.exists) return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-3xl w-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center p-3 mb-5 shadow-lg shadow-primary/10">
                        <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2.5">
                        Welcome to Resumify
                    </h1>
                    <p className="text-sm text-foreground-secondary/50 font-medium max-w-sm mx-auto leading-relaxed">
                        Build your AI-optimized professional profile in 3 simple steps and generate ATS-ready resumes
                    </p>
                </div>

                {/* Steps */}
                <div className="glass-card p-7 rounded-2xl mb-6">
                    <div className="grid grid-cols-3 gap-6 relative">



                        {[
                            {
                                step: 1,
                                title: "Upload Resume",
                                desc: "Import your existing resume or CV file to extract your experience and skills",
                                color: "text-primary",
                                bg: "bg-primary/10 border-primary/20",
                                badgeBg: "bg-primary",
                                icon: Icons.upload,
                            },
                            {
                                step: 2,
                                title: "Add LinkedIn",
                                desc: "Connect your LinkedIn profile data for a richer, more complete profile",
                                color: "text-indigo-600 dark:text-indigo-400",
                                bg: "bg-indigo-500/10 border-indigo-500/20",
                                badgeBg: "bg-indigo-500",
                                icon: Icons.linkedin,
                            },
                            {
                                step: 3,
                                title: "AI Generates",
                                desc: "Our AI merges all sources and creates your optimized professional profile",
                                color: "text-emerald-600 dark:text-emerald-400",
                                bg: "bg-emerald-500/10 border-emerald-500/20",
                                badgeBg: "bg-emerald-500",
                                icon: Icons.zap,
                            },
                        ].map((s) => (
                            <div key={s.step} className="relative z-10 flex flex-col items-center text-center px-1">
                                <div className={`w-16 h-16 rounded-xl ${s.bg} border flex items-center justify-center mb-3 relative`}>
                                    <s.icon className={`w-7 h-7 ${s.color}`} />
                                    <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 ${s.badgeBg} rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-lg`}>
                                        {s.step}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-foreground mb-1">{s.title}</p>
                                <p className="text-[11px] text-foreground-secondary/40 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <div className="text-center mb-6">
                    <Link
                        href="/profile/create"
                        className="btn-primary inline-flex items-center gap-2 px-10 py-3.5 text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-xl hover:shadow-primary/35 transition-all"
                    >
                        Get Started
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                    <p className="text-[10px] text-foreground-secondary/30 mt-2.5 font-medium">
                        Takes less than 2 minutes to set up
                    </p>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Icons.shield, title: "ATS Optimized", desc: "Beat applicant tracking systems", color: "text-primary" },
                        { icon: Icons.layers, title: "Smart Formatting", desc: "Professional resume templates", color: "text-indigo-600 dark:text-indigo-400" },
                        { icon: Icons.merge, title: "Multi-Source", desc: "Merge data from multiple inputs", color: "text-emerald-600 dark:text-emerald-400" },
                    ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-foreground/5 dark:border-white/5">
                            <div className={f.color}><f.icon className="w-3.5 h-3.5" /></div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">{f.title}</p>
                                <p className="text-[9px] text-foreground-secondary/35">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );

    // Safe defaults
    const sections = ps.sections || {};
    const sources = ps.sources || {
        resume: { connected: false, count: 0, latest: null },
        linkedin: { connected: false, count: 0, latest: null },
        manual: { connected: false, count: 0, latest: null },
    };
    const stats = ps.stats || { resume_files: 0, linkedin_files: 0, profile_created: null, profile_updated: null };
    const activity = ps.recent_activity || [];
    const filled = Object.values(sections).filter(Boolean).length;
    const total = Object.keys(sections).length || 8;

    const sectionLabels: Record<string, string> = {
        contact: "Contact", summary: "Summary", skills: "Skills", education: "Education",
        experience: "Experience", projects: "Projects", achievements: "Achievements", certifications: "Certs",
    };

    return (
        <div className="flex-1 flex items-center justify-center p-5 lg:p-6 overflow-hidden bg-transparent">
            {/* BG glow */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[15%] left-[30%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">

                {/* ── ROW 1: Header + Status ── */}
                <div className="flex items-center justify-between" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    <div>
                        <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-[0.25em] mb-1">Dashboard</p>
                        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-primary to-indigo-600 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
                            Career Command Center
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Completeness ring */}
                        <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="3" />
                                <circle cx="22" cy="22" r="18" fill="none" stroke="url(#progressGrad)" strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${(ps.completeness / 100) * 113} 113`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-primary">
                                {ps.completeness}%
                            </span>
                        </div>
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${ps.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-primary/15 text-primary border border-primary/25 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                            }`}>
                            {ps.status || 'Draft'}
                        </span>
                    </div>
                </div>

                {/* ── ROW 2: Shimmer Progress Bar ── */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-400 to-purple-500 transition-all duration-1000 relative overflow-hidden"
                        style={{ width: `${ps.completeness}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
                    </div>
                </div>

                {/* ── ROW 3: Quick Stats ── */}
                <div className="grid grid-cols-4 gap-3" style={{ animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>
                    {[
                        { label: "Resumes", val: String(stats.resume_files), icon: Icons.file, gradient: "from-rose-500/20 to-pink-500/10", color: "text-rose-400", borderColor: "border-rose-500/20", glowColor: "hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]" },
                        { label: "LinkedIn", val: String(stats.linkedin_files), icon: Icons.linkedin, gradient: "from-blue-500/20 to-cyan-500/10", color: "text-blue-400", borderColor: "border-blue-500/20", glowColor: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
                        { label: "Version", val: `v${ps.version || 1}`, icon: Icons.layers, gradient: "from-purple-500/20 to-violet-500/10", color: "text-purple-400", borderColor: "border-purple-500/20", glowColor: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
                        { label: "Updated", val: ps.last_updated ? timeAgo(ps.last_updated) : "—", icon: Icons.clock, gradient: "from-emerald-500/20 to-teal-500/10", color: "text-emerald-400", borderColor: "border-emerald-500/20", glowColor: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
                    ].map((s, i) => (
                        <div key={i} className={`glass-card px-4 py-3.5 flex items-center gap-3 border ${s.borderColor} hover:scale-[1.03] transition-all duration-300 cursor-default group ${s.glowColor}`}>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-300`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-base font-extrabold text-foreground leading-none">{s.val}</p>
                                <p className="text-[9px] text-foreground-secondary/40 font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── ROW 4: Main Content (3-col) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>

                    {/* COL 1: Data Sources (3/12) */}
                    <div className="lg:col-span-3 glass-card p-0 overflow-hidden relative">
                        {/* Accent top border */}
                        <div className="h-[2px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" style={{ animation: 'borderGlow 3s ease-in-out infinite' }} />
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Icons.layers className="w-3 h-3 text-primary" />
                                </span>
                                Sources
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Resume", icon: Icons.file, info: sources.resume, accent: "border-l-rose-400" },
                                    { label: "LinkedIn", icon: Icons.linkedin, info: sources.linkedin, accent: "border-l-blue-400" },
                                    { label: "Manual", icon: Icons.edit, info: sources.manual, accent: "border-l-emerald-400" },
                                ].map((src, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border-l-2 transition-all duration-200 ${src.info.connected
                                            ? `${src.accent} bg-white/[0.03] hover:bg-white/[0.06] hover:translate-x-0.5`
                                            : 'border-l-white/10 bg-white/[0.01] opacity-40'
                                            }`}
                                    >
                                        <div className={src.info.connected ? 'text-emerald-400' : 'text-foreground-secondary/30'}>
                                            <src.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-foreground leading-none">{src.label}</p>
                                            <p className="text-[9px] text-foreground-secondary/40 mt-0.5 truncate">
                                                {src.info.connected
                                                    ? `${src.info.count} file${src.info.count !== 1 ? 's' : ''}`
                                                    : 'Not connected'}
                                            </p>
                                        </div>
                                        {src.info.connected && (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                                <Icons.check className="w-2.5 h-2.5 text-emerald-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COL 2: Profile Sections (5/12) */}
                    <div className="lg:col-span-5 glass-card p-0 overflow-hidden relative">
                        {/* Accent top border */}
                        <div className="h-[2px] bg-gradient-to-r from-indigo-400/60 via-indigo-400 to-indigo-400/60" style={{ animation: 'borderGlow 3s ease-in-out infinite 0.5s' }} />
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center">
                                        <Icons.shield className="w-3 h-3 text-indigo-400" />
                                    </span>
                                    Profile Sections
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                                    {filled}/{total}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {Object.entries(sections).map(([key, ok]) => (
                                    <div
                                        key={key}
                                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${ok
                                            ? 'border-emerald-500/15 bg-emerald-500/5 text-foreground hover:bg-emerald-500/10'
                                            : 'border-amber-500/10 bg-amber-500/5 text-foreground/70 hover:bg-amber-500/10'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                            {ok
                                                ? <Icons.check className="w-2.5 h-2.5 text-emerald-400" />
                                                : <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />}
                                        </div>
                                        <span className="truncate">{sectionLabels[key] || key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COL 3: Recent Activity (4/12) */}
                    <div className="lg:col-span-4 glass-card p-0 overflow-hidden relative">
                        {/* Accent top border */}
                        <div className="h-[2px] bg-gradient-to-r from-blue-400/60 via-blue-400 to-blue-400/60" style={{ animation: 'borderGlow 3s ease-in-out infinite 1s' }} />
                        <div className="p-4">
                            <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                                    <Icons.activity className="w-3 h-3 text-blue-400" />
                                </span>
                                Recent Activity
                            </h3>
                            {activity.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 opacity-30">
                                    <div className="text-foreground-secondary/30 mb-1"><Icons.activity className="w-6 h-6" /></div>
                                    <p className="text-xs text-foreground-secondary/40">No activity yet</p>
                                </div>
                            ) : (
                                <div className="relative flex-1 overflow-y-auto">
                                    <div className="space-y-0.5">
                                        {activity.map((item, i) => {
                                            const IconComp = ACTIVITY_ICONS[item.type] || Icons.activity;
                                            return (
                                                <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/[0.03] transition-colors relative group"
                                                    style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both` }}
                                                >
                                                    {/* Timeline dot */}
                                                    <div className={`relative z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${i === 0
                                                        ? 'bg-primary/20 ring-2 ring-primary/30'
                                                        : 'bg-white/5'
                                                        }`}>
                                                        <IconComp className={`w-2.5 h-2.5 ${i === 0 ? 'text-primary' : 'text-foreground-secondary/40'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold text-foreground leading-tight truncate">{item.label}</p>
                                                        <p className="text-[9px] text-foreground-secondary/35 mt-0.5">{timeAgo(item.timestamp)}</p>
                                                    </div>
                                                    {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── ROW 5: Quick Actions ── */}
                <div className="grid grid-cols-4 gap-3" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
                    {[
                        { href: "/profile/edit", icon: Icons.edit, title: "Edit Profile", gradient: "from-primary/20 to-indigo-600/10", border: "border-primary/25 hover:border-primary/50", text: "text-primary", iconBg: "bg-primary/15", glow: "hover:shadow-[0_4px_25px_rgba(139,92,246,0.2)]" },
                        { href: "/profile/export", icon: Icons.zap, title: "Generate Resume", gradient: "from-indigo-500/20 to-blue-600/10", border: "border-indigo-500/25 hover:border-indigo-500/50", text: "text-indigo-400", iconBg: "bg-indigo-500/15", glow: "hover:shadow-[0_4px_25px_rgba(99,102,241,0.2)]" },
                        { href: "/profile/edit?view=split", icon: Icons.eye, title: "Split Preview", gradient: "from-purple-500/20 to-pink-600/10", border: "border-purple-500/25 hover:border-purple-500/50", text: "text-purple-400", iconBg: "bg-purple-500/15", glow: "hover:shadow-[0_4px_25px_rgba(168,85,247,0.2)]" },
                        { href: "/profile/create", icon: Icons.plus, title: "New Profile", gradient: "from-emerald-500/20 to-teal-600/10", border: "border-emerald-500/25 hover:border-emerald-500/50", text: "text-emerald-400", iconBg: "bg-emerald-500/15", glow: "hover:shadow-[0_4px_25px_rgba(16,185,129,0.2)]" },
                    ].map((a) => (
                        <Link
                            key={a.href}
                            href={a.href}
                            className={`bg-gradient-to-br ${a.gradient} ${a.border} border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:scale-[1.03] transition-all duration-300 group cursor-pointer ${a.glow} backdrop-blur-sm`}
                        >
                            <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center ${a.text} group-hover:scale-110 transition-transform duration-300 relative`}>
                                <a.icon className="w-4 h-4 relative z-10" />
                                {/* Icon glow */}
                                <div className="absolute inset-0 rounded-lg bg-current opacity-0 group-hover:opacity-10 blur-md transition-opacity duration-300" />
                            </div>
                            <span className={`text-xs font-bold ${a.text}`}>{a.title}</span>
                            <Icons.chevronRight className={`w-3.5 h-3.5 ml-auto ${a.text} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}

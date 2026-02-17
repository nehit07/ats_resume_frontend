"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/admin/StatsCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DashboardStats {
    users: {
        total: number;
        active: number;
        staff: number;
        new_30d: number;
        new_7d: number;
        auth_providers: Record<string, number>;
    };
    content: {
        resumes: number;
        linkedin_files: number;
        profiles: number;
        profile_statuses: Record<string, number>;
    };
    subscriptions: {
        free: number;
        beta: number;
        pro: number;
        expired: number;
        free_users: string[];
        beta_users: string[];
        pro_users: string[];
        expired_users: string[];
    };
    processing: {
        total_jobs: number;
        active: number;
        completed: number;
        failed: number;
    };
    sessions: {
        active: number;
    };
    recent_users: Array<{
        id: string;
        email: string;
        auth_provider: string;
        created_at: string;
    }>;
}

export default function AdminDashboardPage() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [tierPopup, setTierPopup] = useState<{ label: string; color: string; users: string[] } | null>(null);

    useEffect(() => {
        if (!accessToken) return;

        fetch(`${API_BASE_URL}/api/admin-panel/dashboard/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [accessToken]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-medium text-foreground-secondary/50">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-foreground-secondary/50">Failed to load dashboard data.</p>
            </div>
        );
    }

    const providerLabels: Record<string, string> = {
        email: "Email",
        github: "GitHub",
        google: "Google",
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                    Admin Dashboard
                </h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">
                    System overview and key metrics
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    label="Total Users"
                    value={stats.users.total}
                    icon="👥"
                    trend={{ value: stats.users.new_7d, label: "this week" }}
                    colorClass="from-blue-500/20 to-blue-500/5"
                />
                <StatsCard
                    label="Resume Files"
                    value={stats.content.resumes}
                    icon="📄"
                    colorClass="from-emerald-500/20 to-emerald-500/5"
                />
                <StatsCard
                    label="Profiles Created"
                    value={stats.content.profiles}
                    icon="🧑‍💻"
                    colorClass="from-purple-500/20 to-purple-500/5"
                />
                <StatsCard
                    label="Active Sessions"
                    value={stats.sessions.active}
                    icon="🔑"
                    colorClass="from-amber-500/20 to-amber-500/5"
                />
            </div>

            {/* Subscription Tiers */}
            <div className="mb-8">
                <h2 className="text-lg font-black tracking-tight text-foreground mb-4">
                    Subscription Tiers
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                        onClick={() => setTierPopup({ label: "Free Tier", color: "gray", users: stats.subscriptions?.free_users || [] })}
                        className="glass-card p-4 border-l-4 border-l-gray-500/50 text-left hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                        <div className="text-2xl font-black text-foreground">{stats.subscriptions?.free || 0}</div>
                        <div className="text-xs font-bold text-foreground-secondary/50 mt-1">Free Tier</div>
                    </button>
                    <button
                        onClick={() => setTierPopup({ label: "Beta Tier", color: "blue", users: stats.subscriptions?.beta_users || [] })}
                        className="glass-card p-4 border-l-4 border-l-blue-500/50 text-left hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                        <div className="text-2xl font-black text-blue-400">{stats.subscriptions?.beta || 0}</div>
                        <div className="text-xs font-bold text-foreground-secondary/50 mt-1">Beta Tier</div>
                    </button>
                    <button
                        onClick={() => setTierPopup({ label: "Pro Tier", color: "primary", users: stats.subscriptions?.pro_users || [] })}
                        className="glass-card p-4 border-l-4 border-l-primary/50 text-left hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                        <div className="text-2xl font-black text-primary">{stats.subscriptions?.pro || 0}</div>
                        <div className="text-xs font-bold text-foreground-secondary/50 mt-1">Pro Tier</div>
                    </button>
                    <button
                        onClick={() => setTierPopup({ label: "Expired", color: "red", users: stats.subscriptions?.expired_users || [] })}
                        className="glass-card p-4 border-l-4 border-l-red-500/50 text-left hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                        <div className="text-2xl font-black text-red-400">{stats.subscriptions?.expired || 0}</div>
                        <div className="text-xs font-bold text-foreground-secondary/50 mt-1">Expired</div>
                    </button>
                </div>
            </div>

            {/* Tier Users Popup */}
            {tierPopup && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTierPopup(null)}>
                    <div
                        className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${tierPopup.color === "blue" ? "bg-blue-500" :
                                        tierPopup.color === "primary" ? "bg-primary" :
                                            tierPopup.color === "red" ? "bg-red-500" :
                                                "bg-gray-500"
                                    }`} />
                                <h2 className="text-lg font-black text-foreground">{tierPopup.label}</h2>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-foreground-secondary">
                                    {tierPopup.users.length} users
                                </span>
                            </div>
                            <button
                                onClick={() => setTierPopup(null)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground-secondary hover:text-foreground transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* User List */}
                        <div className="px-6 py-4 max-h-80 overflow-y-auto no-scrollbar">
                            {tierPopup.users.length === 0 ? (
                                <p className="text-sm text-foreground-secondary/50 text-center py-6">No users in this tier.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {tierPopup.users.map((email, i) => (
                                        <li key={email} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                                            <span className="text-xs font-bold text-foreground-secondary/30 w-5 text-right">{i + 1}</span>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black uppercase ${tierPopup.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                                                    tierPopup.color === "primary" ? "bg-primary/20 text-primary" :
                                                        tierPopup.color === "red" ? "bg-red-500/20 text-red-400" :
                                                            "bg-white/10 text-foreground-secondary"
                                                }`}>
                                                {email[0]}
                                            </div>
                                            <span className="text-sm font-medium text-foreground/80 truncate">{email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Users Breakdown */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-black tracking-tight text-foreground mb-4">
                        User Breakdown
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Active Users</span>
                            <span className="text-sm font-bold text-foreground">{stats.users.active}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Staff / Admin</span>
                            <span className="text-sm font-bold text-foreground">{stats.users.staff}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">New (Last 30 days)</span>
                            <span className="text-sm font-bold text-emerald-400">{stats.users.new_30d}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">New (Last 7 days)</span>
                            <span className="text-sm font-bold text-emerald-400">{stats.users.new_7d}</span>
                        </div>
                        {/* Auth Provider breakdown */}
                        <div className="pt-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground-secondary/30 mb-3">
                                By Auth Provider
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.users.auth_providers).map(([provider, count]) => (
                                    <div key={provider} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                        <span className="text-xs font-bold text-foreground">
                                            {providerLabels[provider] || provider}
                                        </span>
                                        <span className="text-xs text-foreground-secondary/50 ml-1.5">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing Jobs */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-black tracking-tight text-foreground mb-4">
                        Processing Jobs
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Total Jobs</span>
                            <span className="text-sm font-bold text-foreground">{stats.processing.total_jobs}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Active / Running</span>
                            <span className="text-sm font-bold text-amber-400">{stats.processing.active}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Completed</span>
                            <span className="text-sm font-bold text-emerald-400">{stats.processing.completed}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <span className="text-sm text-foreground-secondary/60 font-medium">Failed</span>
                            <span className="text-sm font-bold text-red-400">{stats.processing.failed}</span>
                        </div>
                        {/* Profile Status Breakdown */}
                        <div className="pt-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground-secondary/30 mb-3">
                                Profile Statuses
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.content.profile_statuses).map(([pStatus, count]) => {
                                    const statusColors: Record<string, string> = {
                                        draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                                        processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                        ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                        approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                    };
                                    return (
                                        <div
                                            key={pStatus}
                                            className={`px-3 py-1.5 rounded-lg border ${statusColors[pStatus] || "bg-white/5 border-white/5 text-foreground-secondary"}`}
                                        >
                                            <span className="text-xs font-bold capitalize">{pStatus}</span>
                                            <span className="text-xs opacity-60 ml-1.5">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-black tracking-tight text-foreground mb-4">
                    Recent Signups
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-4 py-2 text-left text-[10px] font-black text-foreground-secondary/40 uppercase tracking-widest">Email</th>
                                <th className="px-4 py-2 text-left text-[10px] font-black text-foreground-secondary/40 uppercase tracking-widest">Provider</th>
                                <th className="px-4 py-2 text-left text-[10px] font-black text-foreground-secondary/40 uppercase tracking-widest">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent_users.map((user) => (
                                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground/80">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-bold text-foreground-secondary/60 uppercase">
                                            {user.auth_provider}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-foreground-secondary/50 text-xs font-medium">
                                        {new Date(user.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

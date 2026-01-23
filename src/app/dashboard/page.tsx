"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileStatus {
    exists: boolean;
    status: string;
    version: number;
    completeness: number;
    last_updated: string;
}

export default function DashboardPage() {
    const { user, accessToken, isAuthenticated } = useAuth();
    const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileStatus = async () => {
            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingestion/profile-status/`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileStatus(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfileStatus();
        }
    }, [accessToken, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-transparent">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs font-bold text-foreground-secondary uppercase tracking-widest animate-pulse">Initializing System...</span>
                </div>
            </div>
        );
    }

    const hasProfile = profileStatus?.exists || false;

    // --- RENDER HELPERS ---
    const renderEmptyState = () => (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
            <div className="relative">
                {/* Stylish Arrow Guide - Anchored to the card, pointing left */}
                <div className="absolute -left-[160px] md:-left-[220px] top-1/2 -translate-y-1/2 hidden md:block pointer-events-none z-0">
                    <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-100 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] rotate-12">
                        {/* Curved path pointing from button area towards sidebar */}
                        <path d="M220 80 C 150 80, 100 80, 30 40" stroke="url(#arrow-gradient)" strokeWidth="3" strokeDasharray="8 6" strokeLinecap="round" className="animate-[dash_20s_linear_infinite]" />

                        {/* Arrow head at the sidebar end */}
                        <path d="M30 40 L 45 35 M 30 40 L 40 55" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Glowing dots at the button end (start of arrow) */}
                        <circle cx="220" cy="80" r="4" fill="#8B5CF6" className="animate-ping" />
                        <circle cx="220" cy="80" r="2" fill="white" />

                        <defs>
                            <linearGradient id="arrow-gradient" x1="220" y1="80" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#8B5CF6" stopOpacity="0" />
                                <stop offset="0.5" stopColor="#8B5CF6" />
                                <stop offset="1" stopColor="#A78BFA" />
                            </linearGradient>
                        </defs>
                        <text x="50" y="20" className="fill-primary text-xs font-bold uppercase tracking-widest opacity-80" style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}>Start Here</text>
                    </svg>
                </div>

                <div className="max-w-3xl w-full text-center space-y-10 bg-white/[0.02] border border-white/5 p-12 rounded-[40px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group z-10 transition-all hover:scale-[1.01] duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Real Logo Box */}
                    <div className="relative inline-block mb-2">
                        <div className="w-20 h-20 bg-background/50 border-2 border-primary/20 rounded-3xl flex items-center justify-center shadow-xl mx-auto backdrop-blur-md p-3 group-hover:rotate-6 transition-transform duration-500">
                            <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] bg-gradient-to-r from-primary via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                            Start Your AI <br /> Professional Journey
                        </h1>
                        <p className="text-base text-foreground-secondary font-medium max-w-lg mx-auto leading-relaxed opacity-60">
                            Create an optimized foundation for your career. <br />
                            Unlock resume generation with one click.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-6 relative z-10 pt-2">
                        <Link
                            href="/profile/create"
                            className="btn-primary px-10 py-5 text-base font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform rounded-2xl animate-pulse ring-4 ring-primary/20 flex items-center gap-2 group/btn"
                        >
                            <span>Start from creating Professional Profile</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderActiveState = () => (
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 w-full max-w-3xl">
            {/* Header */}
            <div className="text-center mb-8">
                <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2 opacity-80">AI-Powered Optimization</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-primary via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    Career Command Center
                </h1>
            </div>

            {/* Main Profile Card */}
            <div className="w-full bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="flex items-center gap-6 relative z-10">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-background/50 border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md p-3 shrink-0">
                        <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-black text-foreground tracking-tight">Professional Profile</h2>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profileStatus?.status === 'approved'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-primary/20 text-primary border border-primary/30'
                                }`}>
                                {profileStatus?.status || 'Active'}
                            </span>
                        </div>
                        <p className="text-xs text-foreground-secondary opacity-60">
                            Version {profileStatus?.version || 1} • Updated {profileStatus?.last_updated ? new Date(profileStatus.last_updated).toLocaleDateString() : 'recently'}
                        </p>
                    </div>

                    {/* Completeness Badge */}
                    <div className="text-center shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center">
                            <span className="text-xl font-black text-primary">{profileStatus?.completeness || 0}%</span>
                        </div>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-foreground-secondary opacity-50 mt-1">Complete</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 relative z-10">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                            style={{ width: `${profileStatus?.completeness || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <Link
                    href="/profile/edit"
                    className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg group-hover:bg-primary/20 transition-colors">
                            ✏️
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">Edit Profile</h3>
                            <p className="text-[10px] text-foreground-secondary opacity-60">Update your details</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/profile/edit?view=export"
                    className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg group-hover:bg-indigo-500/20 transition-colors">
                            ⚡
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">Generate Resume</h3>
                            <p className="text-[10px] text-foreground-secondary opacity-60">AI-powered export</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/profile/edit?view=split"
                    className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg group-hover:bg-purple-500/20 transition-colors">
                            👁️
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">Split Preview</h3>
                            <p className="text-[10px] text-foreground-secondary opacity-60">Side-by-side view</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/profile/create"
                    className="group bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-lg group-hover:bg-green-500/20 transition-colors">
                            ➕
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">New Profile</h3>
                            <p className="text-[10px] text-foreground-secondary opacity-60">Start fresh</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Activity Footer */}
            <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-foreground-secondary opacity-40 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Auto-Sync Active</span>
                </div>
                <span>•</span>
                <span>Resumify</span>
            </div>
        </div>
    );


    return (
        <div className="flex-1 h-screen flex flex-col p-8 lg:p-10 relative overflow-hidden bg-transparent">
            {/* Background Glows (extreme subtle) */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-transparent">
                <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-primary/5 blur-[80px] rounded-full animate-pulse" />
            </div>

            <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
                {hasProfile ? renderActiveState() : renderEmptyState()}
            </div>
        </div>
    );
}

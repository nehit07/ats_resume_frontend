"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-foreground-secondary">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center" style={{ maxWidth: '1400px' }}>
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <Image src="/logo.png" alt="Resumify" width={32} height={32} className="rounded-lg md:w-10 md:h-10" />
                        <span className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                            Welcome back! 👋
                        </h2>
                        <p className="text-foreground-secondary">
                            Manage your resumes and profile from here
                        </p>
                    </div>

                    {/* Action Cards */}
                    <h3 className="text-lg font-medium text-foreground mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Resume Creation Card */}
                        <div className="glass-card p-6 opacity-60">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-primary"
                                    >
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="12" y1="18" x2="12" y2="12" />
                                        <line x1="9" y1="15" x2="15" y2="15" />
                                    </svg>
                                </div>
                                <span className="text-xs bg-foreground-secondary/20 text-foreground-secondary px-2 py-1 rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                            <h4 className="font-medium text-foreground mb-2">
                                Start Resume Creation
                            </h4>
                            <p className="text-sm text-foreground-secondary mb-4">
                                Create ATS-optimized resumes with AI assistance
                            </p>
                            <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                                Create Resume
                            </button>
                        </div>

                        {/* Profile Creation Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-primary"
                                    >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="font-medium text-foreground mb-2">
                                Create Your Profile
                            </h4>
                            <p className="text-sm text-foreground-secondary mb-4">
                                Build your professional profile for personalized resumes
                            </p>
                            <Link href="/profile/create" className="btn-primary w-full block text-center">
                                Create Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

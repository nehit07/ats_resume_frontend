"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

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
            <header className="flex justify-between items-center p-6 border-b border-border">
                <h1 className="text-xl font-semibold text-foreground">
                    AI Resume Generator
                </h1>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="btn-secondary text-sm py-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                            Welcome back! 👋
                        </h2>
                        <p className="text-foreground-secondary">
                            Manage your resumes and profile from here
                        </p>
                    </div>

                    {/* User Info Card */}
                    <div className="glass-card p-6 mb-8">
                        <h3 className="text-lg font-medium text-foreground mb-4">
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-foreground-secondary mb-1">Email</p>
                                <p className="text-foreground font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary mb-1">
                                    Auth Provider
                                </p>
                                <span className="inline-flex items-center gap-2">
                                    {user.auth_provider === "github" && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="text-foreground"
                                        >
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    )}
                                    {user.auth_provider === "google" && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                    )}
                                    {user.auth_provider === "email" && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-foreground"
                                        >
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    )}
                                    <span className="text-foreground font-medium capitalize">
                                        {user.auth_provider}
                                    </span>
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary mb-1">
                                    Account Status
                                </p>
                                <span className="inline-flex items-center gap-1.5 text-green-500 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Active
                                </span>
                            </div>
                        </div>
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

                        {/* Profile Ingestion Card */}
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
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <span className="text-xs bg-foreground-secondary/20 text-foreground-secondary px-2 py-1 rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                            <h4 className="font-medium text-foreground mb-2">
                                Go to Profile Ingestion
                            </h4>
                            <p className="text-sm text-foreground-secondary mb-4">
                                Import your LinkedIn or existing resume data
                            </p>
                            <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                                Import Profile
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

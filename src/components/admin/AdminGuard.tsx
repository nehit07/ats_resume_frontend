"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { accessToken, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "authorized" | "denied">("loading");
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !accessToken) {
            setStatus("denied");
            return;
        }

        // Verify admin status from the backend (database truth)
        fetch(`${API_BASE_URL}/api/admin-panel/verify/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((res) => {
                if (res.ok) {
                    setStatus("authorized");
                } else {
                    setStatus("denied");
                }
            })
            .catch(() => {
                setStatus("denied");
            });
    }, [accessToken, isAuthenticated, isLoading]);

    // Countdown effect
    useEffect(() => {
        if (status !== "denied") return;

        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    // Redirection effect
    useEffect(() => {
        if (status === "denied" && countdown === 0) {
            router.push("/login");
        }
    }, [status, countdown, router]);

    // Loading state
    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm font-medium text-foreground-secondary/50">
                        Verifying admin access...
                    </p>
                </div>
            </div>
        );
    }

    // Access denied
    if (status === "denied") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="glass-card max-w-md w-full mx-4 p-8 text-center">
                    {/* Shield icon */}
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
                        Access Denied
                    </h1>
                    <p className="text-sm text-foreground-secondary/60 mb-6 leading-relaxed">
                        You don&apos;t have admin privileges to access this page.
                        <br />
                        Please contact an administrator if you believe this is an error.
                    </p>

                    {/* Countdown */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                            <span className="text-sm font-black text-red-400">{countdown}</span>
                        </div>
                        <span className="text-xs text-foreground-secondary/40 font-medium">
                            Redirecting to login...
                        </span>
                    </div>

                    <button
                        onClick={() => router.push("/login")}
                        className="btn-primary px-6 py-2.5 text-sm font-bold rounded-xl"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Authorized
    return <>{children}</>;
}

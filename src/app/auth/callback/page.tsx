"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthFromOAuth } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // The backend OAuth callback sets the JWT as an HttpOnly cookie
                // and passes ONLY user data in the URL (no token).
                const userJson = searchParams.get("user");

                if (userJson) {
                    const user = JSON.parse(decodeURIComponent(userJson));

                    // Cookie is already set by the backend redirect.
                    // Just store user data in AuthContext.
                    setAuthFromOAuth(user);

                    // Redirect to dashboard
                    router.replace("/dashboard");
                } else {
                    // Check for error
                    const errorParam = searchParams.get("error");
                    if (errorParam) {
                        setError(decodeURIComponent(errorParam));
                    } else {
                        setError("Authentication failed. No user data received.");
                    }
                }
            } catch (err) {
                console.error("OAuth callback error:", err);
                setError("Failed to process authentication response");
            }
        };

        handleCallback();
    }, [searchParams, router, setAuthFromOAuth]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass-card p-8 max-w-md w-full text-center">
                    <div className="mb-4 text-red-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Authentication Failed
                    </h2>
                    <p className="text-foreground-secondary mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="btn-primary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
                <p className="text-foreground-secondary">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}

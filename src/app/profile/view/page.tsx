"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

export default function ProfileViewPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-border">
                <div className="mx-auto px-6 py-4 flex justify-between items-center" style={{ maxWidth: "1400px" }}>
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Resumify" width={40} height={40} className="rounded-lg" />
                        <span className="text-2xl font-semibold text-foreground">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Main Content - Placeholder */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-8">
                <div className="text-center glass-card p-12 max-w-lg">
                    <div className="text-6xl mb-6">🚧</div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Profile View Coming Soon
                    </h2>
                    <p className="text-foreground-secondary mb-8">
                        Your normalized profile will appear here once AI normalization is fully implemented.
                        This page will show your merged profile data with inline editing and version history.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/profile/create" className="btn-secondary px-6 py-2">
                            ← Create Profile
                        </Link>
                        <Link href="/dashboard" className="btn-primary px-6 py-2">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

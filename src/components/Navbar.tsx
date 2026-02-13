"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
    const { isAuthenticated } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/5 bg-background/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-lg shadow-primary/5">
                        <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                        Resumify
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">Features</Link>
                    <Link href="#how-it-works" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">How it Works</Link>
                    <Link href="#pricing" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <Link href="/dashboard" className="btn-primary px-5 py-2 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-bold text-foreground hover:text-primary transition-colors px-4">
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary px-5 py-2 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

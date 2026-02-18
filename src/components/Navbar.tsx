"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Icons } from "./Icons";

export const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when screen size increases
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/5 bg-background/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-lg shadow-primary/5">
                        <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                        Resumify
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">Features</Link>
                    <Link href="#how-it-works" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">How it Works</Link>
                    <Link href="#pricing" className="text-sm font-semibold text-foreground-secondary/60 hover:text-foreground transition-colors">Pricing</Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
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

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-foreground/5 text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <Icons.x className="w-6 h-6" /> : <Icons.menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-foreground/5 bg-background/95 backdrop-blur-xl absolute left-0 right-0 top-16 p-4 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <Link
                        href="#features"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-3 rounded-lg hover:bg-foreground/5 text-sm font-bold text-foreground transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="#how-it-works"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-3 rounded-lg hover:bg-foreground/5 text-sm font-bold text-foreground transition-colors"
                    >
                        How it Works
                    </Link>
                    <Link
                        href="#pricing"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-3 rounded-lg hover:bg-foreground/5 text-sm font-bold text-foreground transition-colors"
                    >
                        Pricing
                    </Link>

                    <div className="h-px bg-foreground/5 my-1" />

                    {isAuthenticated ? (
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn-primary w-full p-3 text-center text-sm font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full p-3 text-center text-sm font-bold text-foreground border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="btn-primary w-full p-3 text-center text-sm font-bold rounded-xl shadow-lg shadow-primary/20"
                            >
                                Sign Up Free
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export const Footer = () => {
    const { isAuthenticated } = useAuth();

    return (
        <footer className="bg-background/40 border-t border-foreground/5 py-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                            Resumify
                        </span>
                    </Link>
                    <p className="text-sm text-foreground-secondary/40 leading-relaxed max-w-xs">
                        Elevate your career with AI-powered, ATS-optimized resumes designed for the modern job market.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Product</h4>
                    <ul className="space-y-2 text-sm text-foreground-secondary/60 font-medium">
                        <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                        <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                        <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        <li><Link href={isAuthenticated ? "/dashboard" : "/login"} className="hover:text-primary transition-colors">Dashboard</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Company</h4>
                    <ul className="space-y-2 text-sm text-foreground-secondary/60 font-medium">
                        <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="#contact" className="hover:text-primary transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest">Connect</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground-secondary hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.61c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.71h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" /></svg>
                        </a>
                        <a href="#" className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground-secondary hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-foreground-secondary/20">
                    &copy; 2026 Resumify AI. Made with ❤️ for your career.
                </p>
                <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest text-foreground-secondary/20">
                    <Link href="#privacy" className="hover:text-foreground">Privacy</Link>
                    <Link href="#terms" className="hover:text-foreground">Terms</Link>
                    <Link href="#" className="hover:text-foreground">Cookies</Link>
                </div>
            </div>
        </footer>
    );
};

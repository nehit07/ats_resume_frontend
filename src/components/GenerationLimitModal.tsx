"use client";

import React from "react";
import { Icons } from "./Icons";
import Link from "next/link";

interface GenerationLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "generation" | "export";
    limit: number | string;
}

export default function GenerationLimitModal({ isOpen, onClose, type, limit }: GenerationLimitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md glass-card p-1 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* BG Glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />

                <div className="relative p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
                        <Icons.zap className="w-10 h-10 text-primary animate-pulse" />
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-black tracking-tight mb-2">
                        {type === "generation" ? "Generation Limit Reached" : "Export Limit Reached"}
                    </h2>
                    <p className="text-foreground-secondary/60 text-sm leading-relaxed mb-8">
                        You've reached your {type} limit of <span className="text-foreground font-bold">{limit}</span>.
                        Upgrade to a premium plan to unlock unlimited resume sets and advanced AI features.
                    </p>

                    {/* Actions */}
                    <div className="w-full flex flex-col gap-3">
                        <Link
                            href="/subscription"
                            className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
                            onClick={onClose}
                        >
                            View Premium Plans
                            <Icons.chevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-xs font-bold text-foreground-secondary/40 hover:text-foreground transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Benefit badges */}
                    <div className="mt-8 pt-8 border-t border-white/5 w-full grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Icons.check className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-bold text-foreground-secondary/50 text-left">Unlimited Exports</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Icons.check className="w-3 h-3 text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-bold text-foreground-secondary/50 text-left">Advanced AI Matching</span>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-foreground-secondary/20 hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                >
                    <Icons.x className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

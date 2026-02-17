"use client";

import React from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "warning";
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        primary: {
            button: "bg-primary text-white shadow-primary/25 hover:shadow-primary/40",
            icon: "💎",
            iconBg: "bg-primary/10 text-primary border-primary/20",
        },
        danger: {
            button: "bg-red-500 text-white shadow-red-500/25 hover:shadow-red-500/40",
            icon: "⚠️",
            iconBg: "bg-red-500/10 text-red-400 border-red-500/20",
        },
        warning: {
            button: "bg-amber-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40",
            icon: "🔔",
            iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
    };

    const currentVariant = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-background/95 backdrop-blur-2xl border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Decoration */}
                <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} />

                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl border ${currentVariant.iconBg}`}>
                            {currentVariant.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-foreground mb-1 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-sm text-foreground-secondary/70 leading-relaxed whitespace-pre-wrap">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-11 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground-secondary font-bold text-sm hover:bg-foreground/10 hover:text-foreground transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 h-11 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${currentVariant.button}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Message Area (Optional for error feedback) */}
                <div className="px-6 pb-4 empty:hidden" />
            </div>
        </div>
    );
}

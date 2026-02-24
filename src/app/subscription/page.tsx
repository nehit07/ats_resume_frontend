"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalSidebar } from "@/components/GlobalSidebar";
import { apiFetch } from "@/lib/apiClient";

interface Plan {
    name: string;
    display_name: string;
    description: string;
    generation_limit: number;
    export_limit: number;
    pricing: {
        monthly: number;
        quarterly: number;
        biannual: number;
        annual: number;
    };
}

interface Subscription {
    has_subscription: boolean;
    plan: {
        name: string;
        display_name: string;
        generation_limit: number;
        export_limit: number;
    };
    status: string;
    duration_months: number | null;
    start_date: string | null;
    end_date: string | null;
    is_expired: boolean;
    is_free_tier: boolean;
    usage: {
        generation_count: number;
        generation_limit: number;
        generations_remaining: number;
        export_count: number;
        export_limit: number;
        exports_remaining: number;
    };
}

export default function SubscriptionPage() {
    const { accessToken, user } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        if (!accessToken) return;

        const fetchData = async () => {
            try {
                const [plansRes, subRes] = await Promise.all([
                    apiFetch("/api/auth/plans/"),
                    apiFetch("/api/auth/subscription/"),
                ]);

                if (plansRes.ok) {
                    const plansData = await plansRes.json();
                    setPlans(plansData.plans || []);
                }

                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.has_subscription) {
                        setSubscription(subData);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch subscription data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accessToken]);

    // Sync usage counts with AuthContext for real-time updates
    useEffect(() => {
        const details = user?.subscription_details;
        if (details && subscription) {
            setSubscription(prev => {
                if (!prev) return null;

                // Only update if counts are actually different
                if (prev.usage.generation_count === details.generation_count &&
                    prev.usage.export_count === details.export_count) {
                    return prev;
                }

                return {
                    ...prev,
                    usage: {
                        ...prev.usage,
                        generation_count: details.generation_count,
                        export_count: details.export_count,
                        generations_remaining: details.generations_remaining,
                        exports_remaining: details.exports_remaining,
                    }
                };
            });
        }
    }, [user?.subscription_details, subscription === null]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getUsagePercent = (used: number, limit: number) => {
        if (limit === -1) return 0; // unlimited
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percent: number) => {
        if (percent >= 90) return "from-red-500 to-red-600";
        if (percent >= 70) return "from-amber-500 to-orange-500";
        return "from-primary to-indigo-500";
    };

    const getPlanGradient = (planName: string) => {
        switch (planName) {
            case "free":
                return "from-slate-500/20 to-gray-600/20 border-white/10";
            case "beta":
                return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
            case "pro":
                return "from-primary/20 to-indigo-500/20 border-primary/30";
            default:
                return "from-slate-500/20 to-gray-600/20 border-white/10";
        }
    };

    const getPlanBadgeColor = (planName: string) => {
        switch (planName) {
            case "free":
                return "bg-white/10 text-foreground-secondary";
            case "beta":
                return "bg-blue-500/20 text-blue-400";
            case "pro":
                return "bg-primary/20 text-primary";
            default:
                return "bg-white/10 text-foreground-secondary";
        }
    };

    if (loading) {
        return (
            <GlobalSidebar>
                <div className="flex-1 flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-foreground-secondary text-sm font-medium">
                            Loading subscription...
                        </p>
                    </div>
                </div>
            </GlobalSidebar>
        );
    }

    return (
        <GlobalSidebar>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                            Subscription & Usage
                        </h1>
                        <p className="text-foreground-secondary text-lg max-w-xl mx-auto">
                            Manage your plan and track your usage across resume generations and exports.
                        </p>
                    </div>

                    {/* Current Plan Card */}
                    {subscription && (
                        <div className="mb-12">
                            <div className={`relative rounded-2xl border p-8 bg-gradient-to-br ${getPlanGradient(subscription.plan.name)} backdrop-blur-xl overflow-hidden`}>
                                {/* Decorative glow */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    {/* Plan Info */}
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-primary/25">
                                            💎
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-2xl font-black text-foreground">
                                                    {subscription.plan.display_name}
                                                </h2>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${subscription.is_expired
                                                    ? "bg-red-500/20 text-red-400"
                                                    : subscription.status === "active"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-amber-500/20 text-amber-400"
                                                    }`}>
                                                    {subscription.is_expired ? "Expired" : subscription.status}
                                                </span>
                                            </div>
                                            <p className="text-foreground-secondary text-sm">
                                                {subscription.is_free_tier
                                                    ? "Free forever • No expiry"
                                                    : subscription.end_date
                                                        ? `Valid until ${formatDate(subscription.end_date)}`
                                                        : "Active subscription"
                                                }
                                                {subscription.duration_months && !subscription.is_free_tier && (
                                                    <span className="ml-2 text-foreground-secondary/60">
                                                        ({subscription.duration_months} month plan)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-foreground">
                                                {subscription.usage.generation_count}
                                                <span className="text-foreground-secondary/50 text-lg">
                                                    /{subscription.usage.generation_limit === -1 ? "∞" : subscription.usage.generation_limit}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary/60">
                                                Generations
                                            </div>
                                        </div>
                                        <div className="w-px bg-white/10" />
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-foreground">
                                                {subscription.usage.export_count}
                                                <span className="text-foreground-secondary/50 text-lg">
                                                    /{subscription.usage.export_limit === -1 ? "∞" : subscription.usage.export_limit}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary/60">
                                                Exports
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Bars */}
                                <div className="relative mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Generation Usage */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-foreground-secondary">Resume Generations</span>
                                            <span className="text-xs font-bold text-foreground-secondary/60">
                                                {subscription.usage.generation_limit === -1
                                                    ? "Unlimited"
                                                    : `${subscription.usage.generation_count} of ${subscription.usage.generation_limit} used`
                                                }
                                            </span>
                                        </div>
                                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                            {subscription.usage.generation_limit !== -1 ? (
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${getUsageColor(
                                                        getUsagePercent(subscription.usage.generation_count, subscription.usage.generation_limit)
                                                    )} transition-all duration-700 ease-out`}
                                                    style={{
                                                        width: `${getUsagePercent(subscription.usage.generation_count, subscription.usage.generation_limit)}%`,
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-full opacity-30" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Export Usage */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-foreground-secondary">Resume Exports</span>
                                            <span className="text-xs font-bold text-foreground-secondary/60">
                                                {subscription.usage.export_limit === -1
                                                    ? "Unlimited"
                                                    : `${subscription.usage.export_count} of ${subscription.usage.export_limit} used`
                                                }
                                            </span>
                                        </div>
                                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                            {subscription.usage.export_limit !== -1 ? (
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${getUsageColor(
                                                        getUsagePercent(subscription.usage.export_count, subscription.usage.export_limit)
                                                    )} transition-all duration-700 ease-out`}
                                                    style={{
                                                        width: `${getUsagePercent(subscription.usage.export_count, subscription.usage.export_limit)}%`,
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-full opacity-30" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plans Grid */}
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-foreground mb-6 text-center">Available Plans</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => {
                                const isCurrentPlan = subscription?.plan.name === plan.name;
                                return (
                                    <div
                                        key={plan.name}
                                        className={`
                                            relative rounded-2xl border p-6 bg-gradient-to-br backdrop-blur-xl
                                            transition-all duration-500 hover:scale-[1.02] hover:shadow-xl
                                            ${getPlanGradient(plan.name)}
                                            ${isCurrentPlan ? "ring-2 ring-primary/50 shadow-lg shadow-primary/10" : ""}
                                        `}
                                    >
                                        {/* Current Plan Badge */}
                                        {isCurrentPlan && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/30">
                                                Current Plan
                                            </div>
                                        )}

                                        {/* Plan Header */}
                                        <div className="text-center mb-6 pt-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 ${getPlanBadgeColor(plan.name)}`}>
                                                {plan.display_name}
                                            </span>
                                            <div className="text-3xl font-black text-foreground">
                                                {plan.pricing.monthly === 0 ? (
                                                    "Free"
                                                ) : (
                                                    <>
                                                        ₹{plan.pricing.monthly}
                                                        <span className="text-lg text-foreground-secondary/60">/mo</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                                                <span className="text-emerald-400">✓</span>
                                                {plan.generation_limit === -1 ? "Unlimited" : plan.generation_limit} Resume Generations
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                                                <span className="text-emerald-400">✓</span>
                                                {plan.export_limit === -1 ? "Unlimited" : plan.export_limit} Exports (PDF & DOCX)
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                                                <span className="text-emerald-400">✓</span>
                                                ATS Score Analysis
                                            </li>
                                            <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                                                <span className="text-emerald-400">✓</span>
                                                Job Suggestions
                                            </li>
                                            {plan.name === "free" && (
                                                <li className="flex items-center gap-2 text-sm text-foreground-secondary/50">
                                                    <span className="text-emerald-400">✓</span>
                                                    Lifetime access
                                                </li>
                                            )}
                                            {plan.name !== "free" && (
                                                <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                                                    <span className="text-emerald-400">✓</span>
                                                    1/3/6/12 month durations
                                                </li>
                                            )}
                                        </ul>

                                        {/* Action */}
                                        <div className="text-center">
                                            {isCurrentPlan ? (
                                                <div className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground-secondary text-sm font-bold">
                                                    Your current plan
                                                </div>
                                            ) : (
                                                <div className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-foreground-secondary/60 text-sm font-bold">
                                                    Contact admin to upgrade
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="text-center mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-foreground-secondary/60 text-sm">
                            💡 Subscriptions are managed by administrators. Contact your admin to upgrade, renew, or reset your usage limits.
                        </p>
                    </div>
                </div>
            </div>
        </GlobalSidebar>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AdminUser {
    id: string;
    email: string;
    auth_provider: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    total_resume_uploads: number;
    total_linkedin_uploads: number;
    created_at: string;
    updated_at: string;
    sessions_count: number;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

// Subscription management modal state
interface SubModalState {
    userId: string;
    email: string;
    subscription: any;
}

export default function AdminUsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string, email: string } | null>(null);

    // Subscription modal
    const [subModal, setSubModal] = useState<SubModalState | null>(null);
    const [subLoading, setSubLoading] = useState(false);
    const [subMsg, setSubMsg] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("1");

    const fetchUsers = useCallback(async (page = 1, searchQuery = search, provider = providerFilter) => {
        if (!accessToken) return;
        setLoading(true);

        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);
        if (provider) params.set("provider", provider);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/?${params}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setUsers(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search, providerFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const toggleField = async (userId: string, field: "is_active" | "is_staff", currentValue: boolean) => {
        if (!accessToken) return;
        setTogglingId(userId);
        try {
            await fetch(`${API_BASE_URL}/api/admin-panel/users/${userId}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [field]: !currentValue }),
            });
            fetchUsers(pagination.page);
        } catch { /* ignore */ }
        setTogglingId(null);
    };

    // Delete user permanently
    const deleteUser = async () => {
        if (!deleteConfirmUser || !accessToken) return;
        const { id: userId, email } = deleteConfirmUser;

        setDeletingId(userId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/${userId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                fetchUsers(pagination.page);
                setDeleteConfirmUser(null);
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to delete user.");
            }
        } catch {
            alert("Network error. Please try again.");
        }
        setDeletingId(null);
    };

    // Open subscription modal for a user
    const openSubModal = async (userId: string, email: string) => {
        if (!accessToken) return;
        setSubLoading(true);
        setSubMsg("");
        setSubModal({ userId, email, subscription: null });

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/${userId}/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setSubModal({ userId, email, subscription: data.subscription });
            setSelectedPlan(data.subscription?.plan_name || "free");
        } catch {
            setSubMsg("Failed to load subscription data.");
        }
        setSubLoading(false);
    };

    // Change plan
    const handleChangePlan = async () => {
        if (!subModal || !accessToken) return;
        setSubLoading(true);
        setSubMsg("");

        try {
            const body: any = { plan: selectedPlan };
            if (selectedPlan !== "free") {
                body.duration_months = parseInt(selectedDuration);
            }

            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/${subModal.userId}/subscription/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.ok) {
                setSubMsg(`✅ ${data.message}`);
                // Refresh modal data
                openSubModal(subModal.userId, subModal.email);
            } else {
                setSubMsg(`❌ ${data.detail || "Failed to change plan."}`);
            }
        } catch {
            setSubMsg("❌ Network error.");
        }
        setSubLoading(false);
    };

    // Renew subscription
    const handleRenew = async () => {
        if (!subModal || !accessToken) return;
        setSubLoading(true);
        setSubMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/${subModal.userId}/subscription/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "renew", duration_months: parseInt(selectedDuration) }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubMsg(`✅ ${data.message}`);
                openSubModal(subModal.userId, subModal.email);
            } else {
                setSubMsg(`❌ ${data.detail || "Failed to renew."}`);
            }
        } catch {
            setSubMsg("❌ Network error.");
        }
        setSubLoading(false);
    };

    // Reset usage
    const handleResetUsage = async () => {
        if (!subModal || !accessToken) return;
        setSubLoading(true);
        setSubMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/users/${subModal.userId}/subscription/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "reset_usage" }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubMsg(`✅ ${data.message}`);
                openSubModal(subModal.userId, subModal.email);
            } else {
                setSubMsg(`❌ ${data.detail || "Failed to reset."}`);
            }
        } catch {
            setSubMsg("❌ Network error.");
        }
        setSubLoading(false);
    };

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchUsers(1, query), 400);
    };

    const columns: Column<AdminUser>[] = [
        { key: "email", label: "Email", sortable: true },
        {
            key: "auth_provider", label: "Provider", sortable: true,
            render: (item) => (
                <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-bold uppercase">
                    {item.auth_provider}
                </span>
            ),
        },
        {
            key: "is_active", label: "Active", sortable: true,
            render: (item) => (
                <button
                    onClick={() => toggleField(item.id, "is_active", item.is_active)}
                    disabled={togglingId === item.id}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${item.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                        : "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25"
                        } ${togglingId === item.id ? "opacity-50" : ""}`}
                >
                    {item.is_active ? "Active" : "Inactive"}
                </button>
            ),
        },
        {
            key: "is_staff", label: "Staff", sortable: true,
            render: (item) => (
                <button
                    onClick={() => toggleField(item.id, "is_staff", item.is_staff)}
                    disabled={togglingId === item.id}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${item.is_staff
                        ? "bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25"
                        : "bg-white/5 text-foreground-secondary/40 border border-white/5 hover:bg-white/10"
                        } ${togglingId === item.id ? "opacity-50" : ""}`}
                >
                    {item.is_staff ? "Admin" : "User"}
                </button>
            ),
        },
        { key: "total_resume_uploads", label: "Resumes", sortable: true },
        { key: "sessions_count", label: "Sessions", sortable: true },
        {
            key: "subscription" as any, label: "Subscription",
            render: (item) => (
                <button
                    onClick={() => openSubModal(item.id, item.email)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200"
                >
                    💎 Manage
                </button>
            ),
        },
        {
            key: "created_at", label: "Joined", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            ),
        },
        {
            key: "actions" as any, label: "Actions",
            render: (item) => (
                <button
                    onClick={() => setDeleteConfirmUser({ id: item.id, email: item.email })}
                    disabled={deletingId === item.id}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20 hover:border-red-500/30 ${deletingId === item.id ? "opacity-50" : ""}`}
                    title="Permanently delete this user"
                >
                    {deletingId === item.id ? "..." : "🗑️ Delete"}
                </button>
            ),
        },
    ];

    const planBadgeColor = (name: string) => {
        switch (name) {
            case "free": return "bg-white/10 text-foreground-secondary";
            case "beta": return "bg-blue-500/20 text-blue-400";
            case "pro": return "bg-primary/20 text-primary";
            default: return "bg-white/10 text-foreground-secondary";
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Users</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">Manage all registered users</p>
            </div>

            <DataTable
                columns={columns}
                data={users}
                pagination={pagination}
                onPageChange={(page) => fetchUsers(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email..."
                isLoading={loading}
                filters={
                    <FilterSelect
                        value={providerFilter}
                        onChange={(val) => {
                            setProviderFilter(val);
                            fetchUsers(1, search, val);
                        }}
                        options={[
                            { value: "", label: "All Providers" },
                            { value: "email", label: "Email" },
                            { value: "github", label: "GitHub" },
                            { value: "google", label: "Google" },
                        ]}
                        placeholder="All Providers"
                    />
                }
            />

            {/* Subscription Management Modal */}
            {subModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSubModal(null)}>
                    <div
                        className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div>
                                <h2 className="text-lg font-black text-foreground">Subscription Management</h2>
                                <p className="text-xs text-foreground-secondary/60 mt-0.5">{subModal.email}</p>
                            </div>
                            <button
                                onClick={() => setSubModal(null)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground-secondary hover:text-foreground transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-5">
                            {subLoading && !subModal.subscription ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : subModal.subscription ? (
                                <>
                                    {/* Current Plan Info */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-xl shadow-lg">
                                            💎
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${planBadgeColor(subModal.subscription.plan_name)}`}>
                                                    {subModal.subscription.plan_display_name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${subModal.subscription.is_expired
                                                    ? "bg-red-500/20 text-red-400"
                                                    : subModal.subscription.status === "active"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-amber-500/20 text-amber-400"
                                                    }`}>
                                                    {subModal.subscription.is_expired ? "Expired" : subModal.subscription.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-foreground-secondary/60">
                                                <span>Generations: <b className="text-foreground">{subModal.subscription.generation_count}</b>/{subModal.subscription.generation_limit === -1 ? "∞" : subModal.subscription.generation_limit}</span>
                                                <span>Exports: <b className="text-foreground">{subModal.subscription.export_count}</b>/{subModal.subscription.export_limit === -1 ? "∞" : subModal.subscription.export_limit}</span>
                                            </div>
                                            {subModal.subscription.end_date && (
                                                <div className="text-[10px] text-foreground-secondary/40 mt-1">
                                                    Expires: {new Date(subModal.subscription.end_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Change Plan */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-wider text-foreground-secondary/60">Change Plan</label>
                                        <div className="flex gap-2">
                                            {["free", "beta", "pro"].map((plan) => (
                                                <button
                                                    key={plan}
                                                    onClick={() => setSelectedPlan(plan)}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${selectedPlan === plan
                                                        ? plan === "pro"
                                                            ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                                            : plan === "beta"
                                                                ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                                                : "bg-white/10 border-white/20 text-foreground"
                                                        : "bg-white/[0.03] border-white/5 text-foreground-secondary/50 hover:bg-white/5 hover:border-white/10"
                                                        }`}
                                                >
                                                    {plan === "free" ? "Free" : plan === "beta" ? "Beta" : "Pro"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Duration (for paid plans) */}
                                    {selectedPlan !== "free" && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-wider text-foreground-secondary/60">Duration</label>
                                            <div className="flex gap-2">
                                                {["1", "3", "6", "12"].map((d) => (
                                                    <button
                                                        key={d}
                                                        onClick={() => setSelectedDuration(d)}
                                                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${selectedDuration === d
                                                            ? "bg-primary/15 border-primary/30 text-primary"
                                                            : "bg-white/[0.03] border-white/5 text-foreground-secondary/50 hover:bg-white/5"
                                                            }`}
                                                    >
                                                        {d}mo
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <button
                                            onClick={handleChangePlan}
                                            disabled={subLoading}
                                            className="py-2.5 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 hover:border-primary/40 transition-all disabled:opacity-50"
                                        >
                                            {subLoading ? "..." : "Change Plan"}
                                        </button>
                                        <button
                                            onClick={handleRenew}
                                            disabled={subLoading}
                                            className="py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 hover:border-emerald-500/40 transition-all disabled:opacity-50"
                                        >
                                            {subLoading ? "..." : "Renew"}
                                        </button>
                                        <button
                                            onClick={handleResetUsage}
                                            disabled={subLoading}
                                            className="py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 hover:border-amber-500/40 transition-all disabled:opacity-50"
                                        >
                                            {subLoading ? "..." : "Reset Usage"}
                                        </button>
                                    </div>

                                    {/* Status Message */}
                                    {subMsg && (
                                        <div className={`text-sm font-medium p-3 rounded-xl ${subMsg.startsWith("✅")
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                            {subMsg}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-foreground-secondary/50 text-sm">
                                    No subscription data found for this user.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirmUser}
                onClose={() => setDeleteConfirmUser(null)}
                onConfirm={deleteUser}
                title="Delete User Account"
                message={`Are you sure you want to permanently delete ${deleteConfirmUser?.email}?\n\nThis action cannot be undone. All their data (profiles, resumes, and subscriptions) will be permanently removed from the system.`}
                confirmText="Delete User"
                variant="danger"
                isLoading={!!deletingId}
            />
        </div>
    );
}

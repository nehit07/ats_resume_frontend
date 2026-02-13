"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";

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

export default function AdminUsersPage() {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    const [togglingId, setTogglingId] = useState<string | null>(null);

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
        { key: "total_linkedin_uploads", label: "LinkedIn", sortable: true },
        { key: "sessions_count", label: "Sessions", sortable: true },
        {
            key: "created_at", label: "Joined", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            ),
        },
    ];

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
        </div>
    );
}

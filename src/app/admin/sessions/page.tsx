"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { apiFetch } from "@/lib/apiClient";

interface UserSession {
    id: string;
    user_email: string;
    created_at: string;
    expires_at: string;
    revoked: boolean;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export default function AdminSessionsPage() {
    const { accessToken } = useAuth();
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [revokedFilter, setRevokedFilter] = useState("");

    const fetchSessions = useCallback(async (page = 1, searchQuery = search, revoked = revokedFilter) => {
        if (!accessToken) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);
        if (revoked) params.set("revoked", revoked);

        try {
            const res = await apiFetch(`/api/admin-panel/sessions/?${params}`);
            const data = await res.json();
            setSessions(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search, revokedFilter]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchSessions(1, query), 400);
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const columns: Column<UserSession>[] = [
        { key: "user_email", label: "User", sortable: true },
        {
            key: "revoked", label: "Status",
            render: (item) => {
                if (item.revoked) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20">Revoked</span>;
                if (isExpired(item.expires_at)) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/15 text-gray-400 border border-gray-500/20">Expired</span>;
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Active</span>;
            },
        },
        {
            key: "created_at", label: "Created", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            ),
        },
        {
            key: "expires_at", label: "Expires", sortable: true,
            render: (item) => (
                <span className={`text-xs font-medium ${isExpired(item.expires_at) ? "text-red-400/50" : "text-foreground-secondary/50"}`}>
                    {new Date(item.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Sessions</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">All user authentication sessions</p>
            </div>
            <DataTable
                columns={columns}
                data={sessions}
                pagination={pagination}
                onPageChange={(page) => fetchSessions(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email..."
                isLoading={loading}
                filters={
                    <FilterSelect
                        value={revokedFilter}
                        onChange={(val) => { setRevokedFilter(val); fetchSessions(1, search, val); }}
                        options={[
                            { value: "", label: "All Sessions" },
                            { value: "false", label: "Active" },
                            { value: "true", label: "Revoked" },
                        ]}
                        placeholder="All Sessions"
                    />
                }
            />
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Profile {
    id: string;
    user_email: string;
    status: string;
    current_version: number;
    sources_used: Record<string, boolean>;
    normalized_at: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export default function AdminProfilesPage() {
    const { accessToken } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchProfiles = useCallback(async (page = 1, searchQuery = search, profileStatus = statusFilter) => {
        if (!accessToken) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);
        if (profileStatus) params.set("status", profileStatus);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/profiles/?${params}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setProfiles(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search, statusFilter]);

    useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchProfiles(1, query), 400);
    };

    const statusColors: Record<string, string> = {
        draft: "bg-gray-500/15 text-gray-400 border-gray-500/20",
        processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        ready: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    };

    const columns: Column<Profile>[] = [
        { key: "user_email", label: "User", sortable: true },
        {
            key: "status", label: "Status", sortable: true,
            render: (item) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${statusColors[item.status] || "bg-white/5 text-foreground-secondary border-white/5"}`}>
                    {item.status}
                </span>
            ),
        },
        { key: "current_version", label: "Version", sortable: true },
        {
            key: "sources_used", label: "Sources",
            render: (item) => (
                <div className="flex gap-1.5">
                    {Object.entries(item.sources_used || {}).map(([source, used]) => (
                        <span key={source} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${used ? "bg-primary/10 text-primary" : "bg-white/5 text-foreground-secondary/30"}`}>
                            {source}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: "updated_at", label: "Updated", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Profiles</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">All ResumifyProfile records</p>
            </div>
            <DataTable
                columns={columns}
                data={profiles}
                pagination={pagination}
                onPageChange={(page) => fetchProfiles(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email..."
                isLoading={loading}
                filters={
                    <FilterSelect
                        value={statusFilter}
                        onChange={(val) => { setStatusFilter(val); fetchProfiles(1, search, val); }}
                        options={[
                            { value: "", label: "All Statuses" },
                            { value: "draft", label: "Draft" },
                            { value: "processing", label: "Processing" },
                            { value: "ready", label: "Ready" },
                            { value: "approved", label: "Approved" },
                        ]}
                        placeholder="All Statuses"
                    />
                }
            />
        </div>
    );
}

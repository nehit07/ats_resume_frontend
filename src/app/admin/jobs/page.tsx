"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProcessingJob {
    id: string;
    user_email: string;
    status: string;
    current_step: number;
    total_steps: number;
    step_message: string;
    progress_percent: number;
    has_resume: boolean;
    has_linkedin: boolean;
    has_manual: boolean;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    error_message: string;
    retry_count: number;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export default function AdminJobsPage() {
    const { accessToken } = useAuth();
    const [jobs, setJobs] = useState<ProcessingJob[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchJobs = useCallback(async (page = 1, searchQuery = search, jobStatus = statusFilter) => {
        if (!accessToken) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);
        if (jobStatus) params.set("status", jobStatus);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin-panel/processing-jobs/?${params}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            setJobs(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search, statusFilter]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchJobs(1, query), 400);
    };

    const statusColors: Record<string, string> = {
        pending: "bg-gray-500/15 text-gray-400 border-gray-500/20",
        processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        failed: "bg-red-500/15 text-red-400 border-red-500/20",
    };

    const columns: Column<ProcessingJob>[] = [
        { key: "user_email", label: "User", sortable: true },
        {
            key: "status", label: "Status", sortable: true,
            render: (item) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${statusColors[item.status] || "bg-white/5 text-foreground-secondary border-white/5"}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: "progress_percent", label: "Progress",
            render: (item) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${item.status === "failed" ? "bg-red-400" : item.status === "completed" ? "bg-emerald-400" : "bg-primary"}`}
                            style={{ width: `${item.progress_percent}%` }}
                        />
                    </div>
                    <span className="text-xs text-foreground-secondary/50 font-medium w-8 text-right">{item.progress_percent}%</span>
                </div>
            ),
        },
        {
            key: "step_message", label: "Current Step",
            render: (item) => (
                <span className="text-xs text-foreground-secondary/60 truncate max-w-[200px] block">{item.step_message || "—"}</span>
            ),
        },
        {
            key: "has_resume", label: "Sources",
            render: (item) => (
                <div className="flex gap-1">
                    {item.has_resume && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400">Resume</span>}
                    {item.has_linkedin && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400">LinkedIn</span>}
                    {item.has_manual && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400">Manual</span>}
                </div>
            ),
        },
        { key: "retry_count", label: "Retries", sortable: true },
        {
            key: "created_at", label: "Created", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Processing Jobs</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">All data processing pipeline jobs</p>
            </div>
            <DataTable
                columns={columns}
                data={jobs}
                pagination={pagination}
                onPageChange={(page) => fetchJobs(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email..."
                isLoading={loading}
                filters={
                    <FilterSelect
                        value={statusFilter}
                        onChange={(val) => { setStatusFilter(val); fetchJobs(1, search, val); }}
                        options={[
                            { value: "", label: "All Statuses" },
                            { value: "pending", label: "Pending" },
                            { value: "processing", label: "Processing" },
                            { value: "completed", label: "Completed" },
                            { value: "failed", label: "Failed" },
                        ]}
                        placeholder="All Statuses"
                    />
                }
            />
        </div>
    );
}

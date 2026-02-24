"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { apiFetch } from "@/lib/apiClient";

interface ResumeFile {
    id: string;
    user_email: string;
    file_name: string;
    file_type: string;
    file_url: string;
    order: number;
    uploaded_at: string;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export default function AdminResumesPage() {
    const { accessToken } = useAuth();
    const [resumes, setResumes] = useState<ResumeFile[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [fileTypeFilter, setFileTypeFilter] = useState("");

    const fetchResumes = useCallback(async (page = 1, searchQuery = search, fileType = fileTypeFilter) => {
        if (!accessToken) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);
        if (fileType) params.set("file_type", fileType);

        try {
            const res = await apiFetch(`/api/admin-panel/resume-files/?${params}`);
            const data = await res.json();
            setResumes(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search, fileTypeFilter]);

    useEffect(() => { fetchResumes(); }, [fetchResumes]);

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchResumes(1, query), 400);
    };

    const columns: Column<ResumeFile>[] = [
        { key: "user_email", label: "User", sortable: true },
        { key: "file_name", label: "File Name", sortable: true },
        {
            key: "file_type", label: "Type", sortable: true,
            render: (item) => (
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${item.file_type === "pdf" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                    {item.file_type}
                </span>
            ),
        },
        { key: "order", label: "Order", sortable: true },
        {
            key: "uploaded_at", label: "Uploaded", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Resume Files</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">All uploaded resume files</p>
            </div>
            <DataTable
                columns={columns}
                data={resumes}
                pagination={pagination}
                onPageChange={(page) => fetchResumes(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email or file name..."
                isLoading={loading}
                filters={
                    <FilterSelect
                        value={fileTypeFilter}
                        onChange={(val) => { setFileTypeFilter(val); fetchResumes(1, search, val); }}
                        options={[
                            { value: "", label: "All Types" },
                            { value: "pdf", label: "PDF" },
                            { value: "docx", label: "DOCX" },
                        ]}
                        placeholder="All Types"
                    />
                }
            />
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, Column } from "@/components/admin/DataTable";
import { apiFetch } from "@/lib/apiClient";

interface LinkedInFile {
    id: string;
    user_email: string;
    file_name: string;
    file_url: string;
    order: number;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export default function AdminLinkedInPage() {
    const { accessToken } = useAuth();
    const [files, setFiles] = useState<LinkedInFile[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchFiles = useCallback(async (page = 1, searchQuery = search) => {
        if (!accessToken) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), page_size: "20" });
        if (searchQuery) params.set("search", searchQuery);

        try {
            const res = await apiFetch(`/api/admin-panel/linkedin-files/?${params}`);
            const data = await res.json();
            setFiles(data.data || []);
            setPagination({ page: data.page, page_size: data.page_size, total: data.total, total_pages: data.total_pages });
        } catch { /* ignore */ }
        setLoading(false);
    }, [accessToken, search]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (query: string) => {
        setSearch(query);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fetchFiles(1, query), 400);
    };

    const columns: Column<LinkedInFile>[] = [
        { key: "user_email", label: "User", sortable: true },
        { key: "file_name", label: "File Name", sortable: true },
        { key: "order", label: "Order", sortable: true },
        {
            key: "created_at", label: "Created", sortable: true,
            render: (item) => (
                <span className="text-xs text-foreground-secondary/50">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-foreground">LinkedIn Files</h1>
                <p className="text-sm text-foreground-secondary/50 mt-1">All uploaded LinkedIn data files</p>
            </div>
            <DataTable
                columns={columns}
                data={files}
                pagination={pagination}
                onPageChange={(page) => fetchFiles(page)}
                onSearch={handleSearch}
                searchPlaceholder="Search by email or file name..."
                isLoading={loading}
            />
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";

// ─────────────────── Types ───────────────────

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
    onPageChange: (page: number) => void;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    isLoading?: boolean;
    filters?: React.ReactNode;
}

// ─────────────────── Table Component ───────────────────

export function DataTable<T extends object>({
    columns,
    data,
    pagination,
    onPageChange,
    onSearch,
    searchPlaceholder = "Search...",
    isLoading = false,
    filters,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortKey];
            const bVal = (b as Record<string, unknown>)[sortKey];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDir === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortDir === "asc"
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });
    }, [data, sortKey, sortDir]);

    const { page, total, total_pages } = pagination;

    return (
        <div className="glass-card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-foreground/5">
                {onSearch && (
                    <div className="relative flex-1 min-w-[200px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder={searchPlaceholder}
                            style={{ paddingLeft: "2.5rem" }}
                            className="input-field py-2.5 text-sm w-full"
                        />
                    </div>
                )}
                {filters && (
                    <div className="flex-shrink-0" style={{ minWidth: 140 }}>
                        {filters}
                    </div>
                )}
                <div className="text-xs font-medium text-foreground-secondary/40 ml-auto">
                    {total} total result{total !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-foreground/5">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-left text-[10px] font-black text-foreground-secondary/40 uppercase tracking-widest ${col.sortable ? "cursor-pointer hover:text-foreground-secondary/70 select-none" : ""
                                        }`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            <span className="text-primary text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        <span className="text-xs text-foreground-secondary/40 font-medium">Loading data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl">🔍</span>
                                        <span className="text-sm text-foreground-secondary/50 font-medium">No results found</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item, i) => (
                                <tr
                                    key={i}
                                    className={`hover:bg-foreground/[0.03] transition-colors duration-150 ${i < sortedData.length - 1 ? "border-b border-foreground/[0.03]" : ""}`}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3 text-foreground/80 font-medium">
                                            {col.render
                                                ? col.render(item)
                                                : String((item as Record<string, unknown>)[col.key] ?? "—")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="h-2" />
            </div>

            {/* Pagination */}
            {total_pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/5">
                    <span className="text-xs font-medium text-foreground-secondary/40">
                        Page {page} of {total_pages}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-foreground/5 hover:bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← Prev
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                            let pageNum: number;
                            if (total_pages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= total_pages - 2) {
                                pageNum = total_pages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pageNum === page
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "bg-foreground/5 hover:bg-foreground/10 text-foreground-secondary/60"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= total_pages}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-foreground/5 hover:bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

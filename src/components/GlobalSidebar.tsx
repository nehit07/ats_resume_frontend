"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    path: string;
}

const NAV_ITEMS: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: "🏠", path: "/dashboard" },
    { id: "create", label: "Create Profile", icon: "✨", path: "/profile/create" },
    { id: "edit", label: "Edit Profile", icon: "👤", path: "/profile/edit" },
    { id: "subscription", label: "Subscription", icon: "💳", path: "/subscription" },
    { id: "admin", label: "Admin Panel", icon: "🛡️", path: "/admin" },
    { id: "export", label: "Export", icon: "📥", path: "/profile/export" },
];

export function GlobalSidebar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const { user, logout, hasProfile } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('resumify_auth_token');
        localStorage.removeItem('resumify_auth_user');
        sessionStorage.removeItem('temp_token');
        sessionStorage.removeItem('temp_user');
        window.location.href = '/login';
    };

    useEffect(() => {
        // Restore state from local storage on mount
        const savedState = localStorage.getItem("resumify_sidebar_collapsed");
        if (savedState === "true") {
            setIsCollapsed(true);
        }
        setIsMounted(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("resumify_sidebar_collapsed", String(newState));
    };

    if (!isMounted) return null;

    const isItemActive = (item: SidebarItem) => {
        if (item.path.includes('?')) {
            const [basePath, query] = item.path.split('?');
            const [key, value] = query.split('=');
            return pathname === basePath && searchParams?.get(key) === value;
        }
        return pathname === item.path;
    };

    return (
        <div className="flex h-screen w-full bg-transparent overflow-hidden selection:bg-primary/20">
            {/* Sidebar */}
            <aside
                className={`sidebar-animate flex flex-col border-r border-white/5 bg-background/40 backdrop-blur-3xl z-50 relative group/sidebar ${isCollapsed ? "w-20" : "w-72"
                    }`}
            >
                {/* Collapse Toggle - Stylish Chevron */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:scale-110 active:scale-95 transition-all z-[60] border border-white/10"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`sidebar-icon-rotate w-3 h-3 ${isCollapsed ? "rotate-0" : "rotate-180"}`}
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {/* Logo Section */}
                <div className="h-24 flex items-center px-5 gap-4 shrink-0 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                        <img src="/logo.png" alt="Resumify" className="w-full h-full object-contain" />
                    </div>
                    <div className={`sidebar-content-animate flex flex-col origin-left ${isCollapsed ? "opacity-0 w-0 scale-90" : "opacity-100 w-auto scale-100"
                        }`}>
                        <span className="text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-primary via-purple-400 to-indigo-500 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-sm">
                            Resumify
                        </span>
                        <span className="text-[9px] font-bold text-foreground-secondary/60 uppercase tracking-[0.25em] mt-0.5">
                            AI Resume Builder
                        </span>
                    </div>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 px-3 space-y-2 overflow-y-auto no-scrollbar py-4">
                    {NAV_ITEMS.map((item) => {
                        // Hide admin panel if user is not a superuser
                        if (item.id === 'admin' && !user?.is_superuser) return null;

                        const isActive = isItemActive(item);
                        const isDisabled = !hasProfile && item.id !== 'overview' && item.id !== 'create' && item.id !== 'subscription' && item.id !== 'admin';

                        return (
                            <Link
                                key={item.id}
                                href={isDisabled ? "#" : item.path}
                                onClick={(e) => isDisabled && e.preventDefault()}
                                aria-label={isCollapsed ? item.label : undefined}
                                className={`
                                    relative flex items-center h-12 rounded-xl transition-all duration-300 group/item overflow-hidden
                                    ${isDisabled
                                        ? "opacity-30 cursor-not-allowed grayscale"
                                        : isCollapsed
                                            ? "text-foreground-secondary hover:text-foreground"
                                            : isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                : "hover:bg-white/5 text-foreground-secondary hover:text-foreground"
                                    }
                                    ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"}
                                `}
                            >
                                {/* Active indicator (Collapsed only) */}
                                {isCollapsed && isActive && (
                                    <span
                                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.55)]"
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Icon */}
                                <span
                                    className={`
                                        shrink-0 flex items-center justify-center rounded-xl border
                                        sidebar-content-animate
                                        ${isCollapsed
                                            ? "w-11 h-11 border-white/5 bg-white/[0.02]"
                                            : "w-auto h-auto border-transparent bg-transparent"
                                        }
                                        ${isCollapsed
                                            ? isActive
                                                ? "bg-primary/15 border-primary/30 shadow-[0_0_18px_rgba(139,92,246,0.20)]"
                                                : isDisabled
                                                    ? ""
                                                    : "group-hover/item:bg-primary/10 group-hover/item:border-primary/20"
                                            : ""
                                        }
                                    `}
                                >
                                    <span className={`text-xl transition-transform duration-200 ${isCollapsed && isActive ? "scale-[1.05]" : "group-hover/item:scale-110"}`}>
                                        {item.icon}
                                    </span>
                                </span>

                                {/* Label (Transitions opacity/width instead of unmounting) */}
                                <span className={`
                                    sidebar-content-animate font-bold tracking-tight text-sm whitespace-nowrap
                                    ${isCollapsed
                                        ? "w-0 opacity-0 translate-x-4"
                                        : "w-auto opacity-100 translate-x-0"
                                    }
                                `}>
                                    {item.label}
                                </span>

                                {/* Lock Icon */}
                                {isDisabled && !isCollapsed && (
                                    <span className="text-[10px] ml-auto opacity-50">🔒</span>
                                )}

                                {/* Hover Tooltip for Collapsed State */}
                                {isCollapsed && (
                                    <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/item:opacity-100 translate-x-2 group-hover/item:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                        {isDisabled ? `${item.label} (Locked)` : item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 space-y-3 border-t border-white/5 bg-white/[0.01]">

                    {/* Appearance Toggle - Medium priority */}
                    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest text-foreground-secondary opacity-40 whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-40"
                            }`}>
                            Appearance
                        </span>
                        <div className={`relative ${isCollapsed ? "scale-100" : "scale-90"} origin-right group/themeTooltip`}>
                            <div className={`${isCollapsed ? "p-2 rounded-lg hover:bg-white/5 transition-colors duration-200" : ""}`}>
                                <ThemeToggle />
                            </div>
                            {isCollapsed && (
                                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/themeTooltip:opacity-100 translate-x-2 group-hover/themeTooltip:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                    Toggle Theme
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Card - Highest priority (largest in collapsed mode) */}
                    <div className={`
                        flex items-center rounded-xl transition-all duration-300 relative group/profileTooltip
                        ${isCollapsed
                            ? "justify-center p-0 bg-transparent border-0"
                            : "p-3 bg-white/5 border border-white/5 gap-3 hover:bg-white/[0.08] hover:border-white/10"
                        }
                    `}>
                        {/* Avatar - Larger in collapsed mode to show priority */}
                        <div className={`
                            ${isCollapsed ? "w-11 h-11" : "w-9 h-9"} 
                            rounded-full bg-gradient-to-br from-primary via-purple-500 to-indigo-600 
                            flex items-center justify-center text-white font-black shrink-0
                            ${isCollapsed ? "text-sm shadow-lg shadow-primary/30 ring-2 ring-primary/20" : "text-[11px] shadow-md"}
                            transition-all duration-300
                        `}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                user?.email?.charAt(0).toUpperCase() || "U"
                            )}
                        </div>

                        <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${isCollapsed ? "hidden" : "block"}`}>
                            <span className="text-sm font-bold truncate text-foreground">{user?.email?.split('@')[0]}</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-wider">{user?.subscription_plan || "Free Plan"}</span>
                        </div>

                        {isCollapsed && (
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover/profileTooltip:opacity-100 translate-x-2 group-hover/profileTooltip:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                {user?.email ? `Signed in as ${user.email}` : "Account"}
                            </div>
                        )}
                    </div>

                    {/* Logout Button - Lowest priority (smaller, danger color) */}
                    <div className="relative group/logoutTooltip">
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 transition-all duration-300
                                ${isCollapsed
                                    ? "h-8 w-8 mx-auto bg-red-500/5 hover:bg-red-500/15"
                                    : "h-9 gap-2 bg-red-500/5 hover:bg-red-500/15"
                                }
                            `}
                            aria-label={isCollapsed ? "Logout" : undefined}
                        >
                            <svg width={isCollapsed ? "14" : "15"} height={isCollapsed ? "14" : "15"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className={`font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                                }`}>
                                Sign Out
                            </span>
                        </button>

                        {isCollapsed && (
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-red-400 opacity-0 group-hover/logoutTooltip:opacity-100 translate-x-2 group-hover/logoutTooltip:translate-x-0 transition-all duration-200 pointer-events-none z-[100] shadow-xl whitespace-nowrap">
                                Sign Out
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
                {children}
            </main>
        </div>
    );
}

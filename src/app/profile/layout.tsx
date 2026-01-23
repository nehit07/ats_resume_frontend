"use client";

import { GlobalSidebar } from "@/components/GlobalSidebar";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ensuring the sidebar remains persistent on all profile pages as requested
    return <GlobalSidebar>{children}</GlobalSidebar>;
}

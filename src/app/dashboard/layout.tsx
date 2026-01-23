import { GlobalSidebar } from "@/components/GlobalSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <GlobalSidebar>{children}</GlobalSidebar>;
}

"use client";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center" style={{ maxWidth: '1400px' }}>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-foreground/10" />
                        <div className="h-6 w-24 rounded bg-foreground/10" />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-8 h-8 rounded-full bg-foreground/10" />
                        <div className="w-8 h-8 rounded-full bg-foreground/10" />
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    {/* Welcome Section Skeleton */}
                    <div className="mb-6">
                        <div className="h-8 w-64 rounded bg-foreground/10 mb-2" />
                        <div className="h-5 w-80 rounded bg-foreground/5" />
                    </div>

                    {/* Quick Actions Title */}
                    <div className="h-6 w-32 rounded bg-foreground/10 mb-4" />

                    {/* Action Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-11 h-11 rounded-lg bg-foreground/10" />
                                    {i === 1 && <div className="w-20 h-6 rounded-full bg-foreground/5" />}
                                </div>
                                <div className="h-5 w-40 rounded bg-foreground/10 mb-2" />
                                <div className="h-4 w-full rounded bg-foreground/5 mb-1" />
                                <div className="h-4 w-3/4 rounded bg-foreground/5 mb-3" />
                                <div className="h-10 w-full rounded-lg bg-primary/20" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

export default function ProfileViewLoading() {
    return (
        <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden animate-pulse">
            {/* Header Bar Skeleton */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-4 w-32 rounded bg-foreground/10" />
                    <div className="h-6 w-20 rounded-full bg-foreground/5" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-24 rounded-lg bg-foreground/5" />
                    <div className="h-9 w-28 rounded-lg bg-primary/20" />
                </div>
            </div>

            {/* Main Preview Area Skeleton */}
            <main className="flex-1 overflow-y-auto bg-slate-900/30 p-8 flex justify-center">
                <div className="space-y-8">
                    {/* A4 Page Preview Skeleton */}
                    <div className="w-[210mm] bg-white/5 rounded-lg shadow-2xl" style={{ aspectRatio: '210/297' }}>
                        <div className="p-8 space-y-6">
                            {/* Header Section */}
                            <div className="text-center space-y-2 pb-4 border-b border-foreground/5">
                                <div className="h-8 w-48 mx-auto rounded bg-foreground/10" />
                                <div className="h-4 w-64 mx-auto rounded bg-foreground/5" />
                                <div className="flex justify-center gap-4 mt-3">
                                    <div className="h-3 w-28 rounded bg-foreground/5" />
                                    <div className="h-3 w-28 rounded bg-foreground/5" />
                                    <div className="h-3 w-28 rounded bg-foreground/5" />
                                </div>
                            </div>

                            {/* Summary Section */}
                            <div className="space-y-3">
                                <div className="h-4 w-24 rounded bg-foreground/10" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full rounded bg-foreground/5" />
                                    <div className="h-3 w-full rounded bg-foreground/5" />
                                    <div className="h-3 w-3/4 rounded bg-foreground/5" />
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div className="space-y-3">
                                <div className="h-4 w-28 rounded bg-foreground/10" />
                                {[1, 2].map((i) => (
                                    <div key={i} className="space-y-2 pb-4 border-b border-foreground/5 last:border-0">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-40 rounded bg-foreground/10" />
                                            <div className="h-3 w-24 rounded bg-foreground/5" />
                                        </div>
                                        <div className="h-3 w-32 rounded bg-foreground/5" />
                                        <div className="space-y-1 pl-4">
                                            <div className="h-2 w-full rounded bg-foreground/5" />
                                            <div className="h-2 w-11/12 rounded bg-foreground/5" />
                                            <div className="h-2 w-4/5 rounded bg-foreground/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills Section */}
                            <div className="space-y-3">
                                <div className="h-4 w-16 rounded bg-foreground/10" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="h-5 rounded-full bg-foreground/5" style={{ width: `${40 + i * 8}px` }} />
                                    ))}
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="space-y-3">
                                <div className="h-4 w-24 rounded bg-foreground/10" />
                                <div className="flex justify-between">
                                    <div className="h-4 w-48 rounded bg-foreground/10" />
                                    <div className="h-3 w-20 rounded bg-foreground/5" />
                                </div>
                                <div className="h-3 w-36 rounded bg-foreground/5" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

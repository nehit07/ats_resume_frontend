"use client";

export default function ProfileEditLoading() {
    return (
        <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden animate-pulse">
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar Skeleton */}
                <aside className="w-64 border-r border-white/5 bg-background-secondary/10 flex flex-col overflow-hidden">
                    <div className="p-6 pb-2">
                        <div className="h-3 w-28 rounded bg-foreground/10 mb-2" />
                        <div className="h-2 w-40 rounded bg-foreground/5" />
                    </div>
                    <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${i === 1 ? 'bg-white/5' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-foreground/10" />
                                    <div className="h-3 w-20 rounded bg-foreground/10" />
                                </div>
                                <div className="w-2 h-2 rounded-full bg-foreground/10" />
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 space-y-3 bg-white/[0.02] border-t border-white/5">
                        <div className="h-12 w-full rounded-xl bg-primary/20" />
                        <div className="h-11 w-full rounded-xl bg-foreground/5" />
                    </div>
                </aside>

                {/* Center Editor Panel Skeleton */}
                <main className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {/* Section Title */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-foreground/10" />
                            <div className="h-12 w-48 rounded bg-foreground/10" />
                        </div>

                        {/* Editor Card */}
                        <div className="glass-card p-10 min-h-[600px] border-primary/10 shadow-2xl relative">
                            <div className="absolute -top-3 -left-3 px-4 py-1.5 bg-primary/20 rounded-lg">
                                <div className="h-3 w-24 rounded bg-primary/30" />
                            </div>

                            {/* Form Fields Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 pt-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-3 w-24 rounded bg-foreground/10" />
                                        <div className="h-12 w-full rounded-2xl bg-white/[0.03]" />
                                    </div>
                                ))}
                            </div>

                            {/* Large Text Area Skeleton */}
                            <div className="mt-8 space-y-3">
                                <div className="h-3 w-32 rounded bg-foreground/10" />
                                <div className="h-40 w-full rounded-2xl bg-white/[0.03]" />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Preview Panel Skeleton */}
                <aside className="w-[500px] xl:w-[650px] border-l border-white/5 bg-background-secondary/30 flex flex-col overflow-hidden">
                    <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            <div className="h-3 w-32 rounded bg-foreground/10" />
                        </div>
                        <div className="h-3 w-28 rounded bg-foreground/5" />
                    </div>

                    <div className="flex-1 bg-slate-900/50 p-10 flex justify-center">
                        {/* A4 Preview Skeleton */}
                        <div className="w-[180px] h-[254px] bg-white/5 rounded-lg shadow-2xl">
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-24 mx-auto rounded bg-foreground/10" />
                                <div className="h-2 w-32 mx-auto rounded bg-foreground/5" />
                                <div className="h-px w-full bg-foreground/5 my-3" />
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-2 w-full rounded bg-foreground/5" style={{ width: `${100 - i * 10}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

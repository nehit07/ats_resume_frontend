"use client";

export default function LoginLoading() {
    return (
        <div className="min-h-screen flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <header className="sticky border-b border-border bg-background/50 backdrop-blur-md top-0 z-30">
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center" style={{ maxWidth: '1400px' }}>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-foreground/10" />
                        <div className="h-6 w-24 rounded bg-foreground/10" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-foreground/10" />
                </div>
            </header>

            {/* Main Content - Auth Form Skeleton */}
            <main className="flex-1 flex items-center justify-center px-4 py-4">
                <div className="w-full max-w-md">
                    <div className="glass-card p-5 space-y-6">
                        {/* Title Skeleton */}
                        <div className="text-center space-y-2">
                            <div className="h-8 w-40 mx-auto rounded bg-foreground/10" />
                            <div className="h-4 w-56 mx-auto rounded bg-foreground/5" />
                        </div>

                        {/* Form Fields Skeleton */}
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <div className="h-4 w-16 rounded bg-foreground/10" />
                                <div className="h-12 w-full rounded-lg bg-foreground/5" />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="h-4 w-20 rounded bg-foreground/10" />
                                <div className="h-12 w-full rounded-lg bg-foreground/5" />
                                <div className="h-3 w-40 rounded bg-foreground/5" />
                            </div>
                        </div>

                        {/* Submit Button Skeleton */}
                        <div className="h-12 w-full rounded-xl bg-primary/20" />

                        {/* Divider Skeleton */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <div className="h-4 w-32 rounded bg-foreground/5" />
                            </div>
                        </div>

                        {/* OAuth Buttons Skeleton */}
                        <div className="space-y-3">
                            <div className="h-12 w-full rounded-lg bg-foreground/5" />
                            <div className="h-12 w-full rounded-lg bg-foreground/5" />
                        </div>

                        {/* Register Link Skeleton */}
                        <div className="h-4 w-48 mx-auto rounded bg-foreground/5" />
                    </div>
                </div>
            </main>
        </div>
    );
}

"use client";

export default function ProfileCreateLoading() {
    return (
        <div className="min-h-screen flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <header className="shrink-0 border-b border-white/10 bg-background/50 backdrop-blur-md h-16 z-30">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
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

            {/* Main Content Skeleton - Compact Layout */}
            <main className="flex-1 flex flex-col items-center p-6 pt-12">
                <div className="max-w-md w-full flex flex-col items-center">
                    {/* Title Section - Compact */}
                    <div className="text-center mb-6 w-full">
                        <div className="h-8 w-72 mx-auto rounded bg-foreground/10 mb-2" />
                        <div className="h-4 w-80 mx-auto rounded bg-foreground/5" />
                    </div>

                    {/* Action Buttons Skeleton - Compact */}
                    <div className="flex flex-col items-center gap-3 w-full mb-5">
                        <div className="w-full h-12 rounded-xl bg-foreground/10" />
                        <div className="h-4 w-8 rounded bg-foreground/5" />
                        <div className="w-full h-12 rounded-xl bg-foreground/10" />
                    </div>

                    {/* Manual Entry Section - Compact */}
                    <div className="text-center mb-4">
                        <div className="h-4 w-24 mx-auto rounded bg-foreground/5 mb-1" />
                        <div className="h-3 w-48 mx-auto rounded bg-foreground/5 mb-2" />
                        <div className="h-8 w-28 mx-auto rounded-lg bg-foreground/10" />
                    </div>

                    {/* Continue Button Skeleton */}
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <div className="h-6 w-32 rounded-full bg-green-500/10" />
                        <div className="h-10 w-36 rounded-full bg-primary/20" />
                    </div>
                </div>
            </main>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { apiFetch } from '@/lib/apiClient';

interface Version {
    id: string;
    version_number: number;
    change_type: string;
    change_notes: string;
    status_snapshot: string;
    created_at: string;
}

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestoreSuccess: (newVersion: number) => void;
}

export function VersionHistoryModal({ isOpen, onClose, onRestoreSuccess }: VersionHistoryModalProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        setIsLoading(true);
        setError(null);
        apiFetch("/api/ingestion/profile/versions/")
            .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch"))
            .then(data => setVersions(data.versions || []))
            .catch(err => {
                console.error(err);
                setError("Could not load version history.");
            })
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    const handleRestore = async (version: Version) => {
        if (!confirm(`Are you sure you want to restore Version ${version.version_number}? Your current draft will be overwritten.`)) {
            return;
        }

        setRestoringId(version.id);
        try {
            const res = await apiFetch(`/api/ingestion/profile/versions/${version.id}/restore/`, {
                method: "POST"
            });

            if (!res.ok) throw new Error("Failed to restore");

            const data = await res.json();
            onRestoreSuccess(data.new_version);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to restore version.");
        } finally {
            setRestoringId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-card shadow-2xl rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-primary/20 bg-background/95 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Icons.layers className="w-5 h-5 text-purple-400" />
                            Version History
                        </h2>
                        <p className="text-xs text-foreground-secondary/60 mt-1">View and restore previous versions of your profile</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-foreground-secondary/70 hover:text-white">
                        <Icons.x className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-r-2 border-primary animate-spin" />
                            <p className="text-sm text-foreground-secondary/50 mt-4">Loading history...</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-12">
                            <Icons.layers className="w-12 h-12 text-foreground-secondary/20 mx-auto mb-3" />
                            <p className="text-sm font-medium text-foreground-secondary/60">No history available</p>
                            <p className="text-xs text-foreground-secondary/40">Versions are created when you save or generate a resume.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((v, i) => (
                                <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                            v{v.version_number}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold capitalize text-foreground flex items-center gap-2">
                                                {v.change_type}
                                                {i === 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-foreground-secondary/50 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Icons.clock className="w-3 h-3" />
                                                    {new Date(v.created_at).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                    })}
                                                </span>
                                                {v.change_notes && (
                                                    <span className="truncate max-w-[200px] text-xs opacity-70 border-l border-white/10 pl-3">
                                                        {v.change_notes}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {i !== 0 && (
                                        <button
                                            onClick={() => handleRestore(v)}
                                            disabled={restoringId === v.id}
                                            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 font-medium tracking-wide disabled:opacity-50"
                                        >
                                            {restoringId === v.id ? (
                                                <div className="w-3 h-3 rounded-full border-r-2 border-white animate-spin" />
                                            ) : (
                                                <Icons.refresh className="w-3 h-3" />
                                            )}
                                            Restore
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

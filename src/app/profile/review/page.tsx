"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface ReviewData {
    resumes: Array<{
        id: string;
        file_name: string;
        file_url: string;
        file_type: string;
        extracted_text: string;
        uploaded_at: string;
    }>;
    linkedin: Array<{
        id: string;
        file_name: string;
        file_url: string;
        extracted_text: string;
        uploaded_at: string;
    }>;
    manual: Record<string, unknown>;
    has_data: boolean;
}

export default function ReviewPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, accessToken } = useAuth();
    const [data, setData] = useState<ReviewData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isNormalizing, setIsNormalizing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Fetch review data
    useEffect(() => {
        const fetchData = async () => {
            if (!accessToken) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/ingestion/review-data/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch review data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (accessToken) {
            fetchData();
        }
    }, [accessToken]);

    const handleNormalize = async () => {
        setIsNormalizing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/normalize/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
                router.push("/profile/view");
            } else {
                const error = await response.json();
                alert(error.error || "Failed to create profile. Please try again.");
            }
        } catch (error) {
            console.error("Normalization failed:", error);
            alert("Failed to create profile. Please try again.");
        } finally {
            setIsNormalizing(false);
        }
    };

    if (isLoading || isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground-secondary">Loading your data...</p>
                </div>
            </div>
        );
    }

    if (!data?.has_data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center glass-card p-8">
                    <h2 className="text-xl font-semibold mb-4">No Data Found</h2>
                    <p className="text-foreground-secondary mb-6">
                        Please add your data first before reviewing.
                    </p>
                    <Link href="/profile/create" className="btn-primary px-6 py-2">
                        ← Go to Create Page
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky border-b border-border bg-background/50 backdrop-blur-md top-0 h-16 z-30">
                <div className="mx-auto px-6 py-4 flex justify-between items-center" style={{ maxWidth: "1400px" }}>
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Resumify" width={40} height={40} className="rounded-lg" />
                        <span className="text-2xl font-semibold text-foreground">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Sticky Action Bar */}
            <div className="sticky top-16 z-20 bg-background/50 backdrop-blur-xl border-b border-primary/0 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">📋 Review Your Data</h2>
                        <p className="text-xs text-foreground-secondary/80">
                            Final check before generating your AI profile
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
                        <Link href="/profile/create" className="flex-1 sm:flex-none btn-secondary px-5 py-2 flex items-center justify-center gap-2 hover:bg-background-secondary border border-border/50 text-sm font-medium">
                            ✏️ Edit Data
                        </Link>
                        <button
                            onClick={handleNormalize}
                            disabled={isNormalizing}
                            className="flex-1 sm:flex-none btn-primary px-4 py-2 flex items-center justify-center gap-2"
                        >
                            {isNormalizing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>✨ Create My Profile</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Resume Section - Always Show */}
                        <div className="glass-card p-4 md:p-6 w-full flex flex-col">
                            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                <span className="text-xl">📄</span> Resume
                                {data.resumes.length > 0 && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                        {data.resumes.length} file(s)
                                    </span>
                                )}
                            </h3>
                            {data.resumes.length > 0 ? (
                                data.resumes.map((resume) => (
                                    <div key={resume.id} className="mb-4">
                                        <p className="text-sm font-medium mb-2">{resume.file_name}</p>
                                        {/* PDF Viewer */}
                                        {resume.file_type === "pdf" ? (
                                            <iframe
                                                src={`${API_BASE_URL}/media/${resume.file_url}#toolbar=0&navpanes=0`}
                                                className="w-full h-[600px] rounded-lg border border-border"
                                                title={resume.file_name}
                                            />
                                        ) : (
                                            <div className="bg-background-secondary rounded-lg p-4">
                                                <p className="text-xs text-foreground-secondary mb-2">
                                                    📄 DOCX file - Preview not available
                                                </p>
                                                <a
                                                    href={`${API_BASE_URL}/media/${resume.file_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-sm hover:underline"
                                                >
                                                    Download file →
                                                </a>
                                            </div>
                                        )}
                                        {/* Extracted Text (Collapsible) */}
                                        <details className="mt-3">
                                            <summary className="text-xs text-foreground-secondary cursor-pointer hover:text-foreground">
                                                View Extracted Text
                                            </summary>
                                            <div className="bg-background-secondary rounded-lg p-3 mt-2 max-h-[200px] overflow-y-auto">
                                                <p className="text-xs text-foreground-secondary whitespace-pre-wrap">
                                                    {resume.extracted_text}
                                                </p>
                                            </div>
                                        </details>
                                        <p className="text-xs text-foreground-secondary mt-2">
                                            Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                /* Placeholder when no resume uploaded */
                                <div className="h-[600px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-background-secondary/30">
                                    <div className="text-center">
                                        <svg className="w-24 h-24 mx-auto mb-4 text-foreground-secondary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14,2 14,8 20,8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10,9 9,9 8,9" />
                                        </svg>
                                        <p className="text-foreground-secondary font-medium mb-1">No Resume Uploaded</p>
                                        <p className="text-xs text-foreground-secondary/70">Upload your resume on the Create page</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LinkedIn Section - Always Show */}
                        <div className="glass-card p-4 md:p-6 w-full flex flex-col">
                            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                <span className="text-xl">💼</span> LinkedIn Profile
                                {data.linkedin.length > 0 && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                        {data.linkedin.length} file(s)
                                    </span>
                                )}
                            </h3>
                            {data.linkedin.length > 0 ? (
                                data.linkedin.map((linkedin) => (
                                    <div key={linkedin.id} className="mb-4">
                                        <p className="text-sm font-medium mb-2">{linkedin.file_name}</p>
                                        {/* PDF Viewer */}
                                        <iframe
                                            src={`${API_BASE_URL}/media/${linkedin.file_url}#toolbar=0&navpanes=0`}
                                            className="w-full h-[600px] rounded-lg border border-border"
                                            title={linkedin.file_name}
                                        />
                                        {/* Extracted Text (Collapsible) */}
                                        <details className="mt-3">
                                            <summary className="text-xs text-foreground-secondary cursor-pointer hover:text-foreground">
                                                View Extracted Text
                                            </summary>
                                            <div className="bg-background-secondary rounded-lg p-3 mt-2 max-h-[200px] overflow-y-auto">
                                                <p className="text-xs text-foreground-secondary whitespace-pre-wrap">
                                                    {linkedin.extracted_text}
                                                </p>
                                            </div>
                                        </details>
                                        <p className="text-xs text-foreground-secondary mt-2">
                                            Uploaded: {new Date(linkedin.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                /* Placeholder when no LinkedIn uploaded */
                                <div className="h-[600px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-background-secondary/30">
                                    <div className="text-center">
                                        <svg className="w-24 h-24 mx-auto mb-4 text-[#0A66C2]/40" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                        <p className="text-foreground-secondary font-medium mb-1">No LinkedIn PDF Uploaded</p>
                                        <p className="text-xs text-foreground-secondary/70">Upload your LinkedIn profile PDF</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Manual Entry Section - Always Show */}
                        {((): React.ReactNode => {
                            const m = data.manual || {};
                            const manualSections = [
                                {
                                    id: 'contact',
                                    hasData: m.contact && typeof m.contact === 'object' && Object.values(m.contact as object).some(v => v && String(v).trim())
                                },
                                {
                                    id: 'summary',
                                    hasData: !!m.summary && (typeof m.summary === 'string' ? m.summary.trim() : (m.summary as any).text?.trim())
                                },
                                {
                                    id: 'skills',
                                    hasData: !!m.skills && (typeof m.skills === 'string' ? m.skills.trim() : (m.skills as any).skills?.trim())
                                },
                                {
                                    id: 'education',
                                    hasData: Array.isArray(m.education) && m.education.length > 0
                                },
                                {
                                    id: 'experience',
                                    hasData: Array.isArray(m.experience) && m.experience.length > 0
                                },
                                {
                                    id: 'projects',
                                    hasData: Array.isArray(m.projects) && m.projects.length > 0
                                },
                                {
                                    id: 'achievements',
                                    hasData: Array.isArray(m.achievements) && m.achievements.length > 0
                                }
                            ];
                            const manualSectionsCount = manualSections.filter(s => s.hasData).length;

                            if (manualSectionsCount > 0) {
                                return (
                                    <div className="glass-card p-4 md:p-6 w-full lg:col-span-2 xl:col-span-1 max-h-[800px] overflow-y-auto">
                                        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                            <span className="text-xl">✍️</span> Manual Entry
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                {manualSectionsCount} section(s)
                                            </span>
                                        </h3>
                                        <div className="space-y-5">
                                            {/* Contact Section */}
                                            {!!m.contact && Object.values(m.contact as object).some(v => v) && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        📇 Contact Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                                        {(m.contact as Record<string, string>).full_name && (
                                                            <p><span className="text-foreground-secondary">Name:</span> <span className="text-foreground">{(m.contact as Record<string, string>).full_name}</span></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).email && (
                                                            <p><span className="text-foreground-secondary">Email:</span> <span className="text-foreground">{(m.contact as Record<string, string>).email}</span></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).phone && (
                                                            <p><span className="text-foreground-secondary">Phone:</span> <span className="text-foreground">{(m.contact as Record<string, string>).phone}</span></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).location && (
                                                            <p><span className="text-foreground-secondary">Location:</span> <span className="text-foreground">{(m.contact as Record<string, string>).location}</span></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).linkedin_url && (
                                                            <p><span className="text-foreground-secondary">LinkedIn:</span> <a href={(m.contact as Record<string, string>).linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{(m.contact as Record<string, string>).linkedin_url}</a></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).github && (
                                                            <p><span className="text-foreground-secondary">GitHub:</span> <a href={(m.contact as Record<string, string>).github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{(m.contact as Record<string, string>).github}</a></p>
                                                        )}
                                                        {(m.contact as Record<string, string>).portfolio && (
                                                            <p><span className="text-foreground-secondary">Portfolio:</span> <a href={(m.contact as Record<string, string>).portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{(m.contact as Record<string, string>).portfolio}</a></p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary Section */}
                                            {!!m.summary && (typeof m.summary === 'string' ? m.summary.trim() : (m.summary as any).text?.trim()) && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                        📝 Professional Summary
                                                    </h4>
                                                    <p className="text-sm text-foreground-secondary leading-relaxed">
                                                        {(m.summary as Record<string, string>).text || String(m.summary)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Skills Section */}
                                            {!!m.skills && (typeof m.skills === 'string' ? m.skills.trim() : (m.skills as any).skills?.trim()) && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        🛠️ Skills
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {((m.skills as Record<string, string>).skills || String(m.skills))
                                                            .split(',')
                                                            .map((skill: string, idx: number) => (
                                                                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                                    {skill.trim()}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education Section */}
                                            {!!m.education && Array.isArray(m.education) && m.education.length > 0 && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        🎓 Education
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {(m.education as Array<Record<string, string>>).map((edu, idx) => (
                                                            <div key={idx} className="border-l-2 border-primary/30 pl-3">
                                                                <p className="font-medium text-sm text-foreground">{edu.institution_name}</p>
                                                                <p className="text-xs text-foreground-secondary">{edu.degree_type}</p>
                                                                <p className="text-xs text-foreground-secondary">
                                                                    {[edu.city, edu.state, edu.country].filter(Boolean).join(", ")}
                                                                </p>
                                                                <p className="text-xs text-foreground-secondary">{edu.start_date} - {edu.is_pursuing ? 'Present' : edu.end_date}</p>
                                                                {edu.grade && <p className="text-xs text-foreground-secondary">Grade: {edu.grade}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Experience Section */}
                                            {!!m.experience && Array.isArray(m.experience) && m.experience.length > 0 && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        💼 Work Experience
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {(m.experience as Array<Record<string, string>>).map((exp, idx) => (
                                                            <div key={idx} className="border-l-2 border-primary/30 pl-3">
                                                                <p className="font-medium text-sm text-foreground">{exp.job_role}</p>
                                                                <p className="text-xs text-primary">{exp.company_name}</p>
                                                                <p className="text-xs text-foreground-secondary">
                                                                    {[exp.city, exp.country].filter(Boolean).join(", ")}
                                                                </p>
                                                                <p className="text-xs text-foreground-secondary">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</p>
                                                                {exp.job_description && <p className="text-xs text-foreground-secondary mt-1">{exp.job_description}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Projects Section */}
                                            {!!m.projects && Array.isArray(m.projects) && m.projects.length > 0 && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        🚀 Projects
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {(m.projects as Array<Record<string, string>>).map((proj, idx) => (
                                                            <div key={idx} className="border-l-2 border-primary/30 pl-3">
                                                                <p className="font-medium text-sm text-foreground">{proj.name}</p>
                                                                {proj.description && <p className="text-xs text-foreground-secondary">{proj.description}</p>}
                                                                {proj.technologies && <p className="text-xs text-primary mt-1">{proj.technologies}</p>}
                                                                {proj.url && <p className="text-xs mt-1"><a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{proj.url}</a></p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Achievements Section */}
                                            {!!m.achievements && Array.isArray(m.achievements) && m.achievements.length > 0 && (
                                                <div className="bg-background-secondary rounded-lg p-4">
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        🏆 Achievements
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {(m.achievements as Array<Record<string, string>>).map((ach, idx) => (
                                                            <div key={idx} className="flex items-start gap-2">
                                                                <span className="text-primary">•</span>
                                                                <div>
                                                                    <p className="text-sm text-foreground">{ach.title}</p>
                                                                    {ach.description && <p className="text-xs text-foreground-secondary">{ach.description}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    /* Placeholder when no manual entry */
                                    <div className="glass-card p-4 md:p-6 w-full lg:col-span-2 xl:col-span-1">
                                        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                            <span className="text-xl">✍️</span> Manual Entry
                                        </h3>
                                        <div className="h-[600px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-background-secondary/30">
                                            <div className="text-center">
                                                <svg className="w-24 h-24 mx-auto mb-4 text-foreground-secondary/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                                <p className="text-foreground-secondary font-medium mb-1">No Manual Data Entered</p>
                                                <p className="text-xs text-foreground-secondary/70">Enter your details on the Create page</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            </main>
        </div>
    );
}

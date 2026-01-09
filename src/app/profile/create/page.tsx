"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type SectionType = "contact" | "summary" | "skills" | "projects" | "experience" | "education" | "achievements";

// Type definitions for dynamic entries
interface EducationEntry {
    id: string;
    degree_type: string;
    institution_name: string;
    city: string;
    state: string;
    country: string;
    start_date: string;
    end_date: string;
    is_pursuing: boolean;
}

interface ExperienceEntry {
    id: string;
    company_name: string;
    job_role: string;
    job_description: string;
    city: string;
    country: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    technologies: string;
    url: string;
}

interface AchievementEntry {
    id: string;
    title: string;
    description: string;
}

interface UploadStatus {
    resume: "idle" | "uploading" | "success" | "error";
    linkedin: "idle" | "uploading" | "success" | "error";
}

interface RawFile {
    id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    is_selected: boolean;
    order: number;
    uploaded_at: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyEducation = (): EducationEntry => ({
    id: generateId(),
    degree_type: "",
    institution_name: "",
    city: "",
    state: "",
    country: "",
    start_date: "",
    end_date: "",
    is_pursuing: false,
});

const createEmptyExperience = (): ExperienceEntry => ({
    id: generateId(),
    company_name: "",
    job_role: "",
    job_description: "",
    city: "",
    country: "",
    start_date: "",
    end_date: "",
    is_current: false,
});

const createEmptyProject = (): ProjectEntry => ({
    id: generateId(),
    name: "",
    description: "",
    technologies: "",
    url: "",
});

const createEmptyAchievement = (): AchievementEntry => ({
    id: generateId(),
    title: "",
    description: "",
});

export default function ProfileCreatePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState<SectionType>("contact");
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        resume: "idle",
        linkedin: "idle",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Simple section states
    const [contact, setContact] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        linkedin_url: "",
    });
    const [summary, setSummary] = useState({ text: "" });
    const [skills, setSkills] = useState({ skills: "" });

    // Dynamic array states
    const [education, setEducation] = useState<EducationEntry[]>([createEmptyEducation()]);
    const [experience, setExperience] = useState<ExperienceEntry[]>([createEmptyExperience()]);
    const [projects, setProjects] = useState<ProjectEntry[]>([createEmptyProject()]);
    const [achievements, setAchievements] = useState<AchievementEntry[]>([createEmptyAchievement()]);

    // File lists
    const [resumes, setResumes] = useState<RawFile[]>([]);
    const [linkedinFiles, setLinkedinFiles] = useState<RawFile[]>([]);

    // New states for UI improvements
    const [hasAnyData, setHasAnyData] = useState(false);
    const [isUploading, setIsUploading] = useState<"resume" | "linkedin" | null>(null);
    const isResumeSelected = resumes.some((r) => r.is_selected);
    const isLinkedInSelected = linkedinFiles.some((l) => l.is_selected);

    // Check if user has any data (for enabling Review button)
    useEffect(() => {
        const hasData = Boolean(
            resumes.length > 0 ||
            linkedinFiles.length > 0 ||
            Object.values(contact).some((v) => Boolean(v)) ||
            summary.text ||
            skills.skills ||
            education.some((e) => e.institution_name) ||
            experience.some((e) => e.company_name) ||
            projects.some((p) => p.name) ||
            achievements.some((a) => a.title)
        );
        setHasAnyData(hasData);
    }, [resumes, linkedinFiles, contact, summary, skills, education, experience, projects, achievements]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setIsInitialLoading(false);
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Fetch saved data on mount
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;

        const fetchData = async () => {
            try {
                // Fetch manual and overview data
                const reviewRes = await fetch(`${API_BASE_URL}/api/ingestion/review-data/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (reviewRes.ok) {
                    const data = await reviewRes.json();
                    if (data.manual) {
                        if (data.manual.contact) setContact(data.manual.contact);
                        if (data.manual.summary) setSummary(data.manual.summary);
                        if (data.manual.skills) setSkills(data.manual.skills);
                        if (data.manual.education?.length > 0) setEducation(data.manual.education);
                        if (data.manual.experience?.length > 0) setExperience(data.manual.experience);
                        if (data.manual.projects?.length > 0) setProjects(data.manual.projects);
                        if (data.manual.achievements?.length > 0) setAchievements(data.manual.achievements);
                    }
                }

                // Fetch full file lists
                const filesRes = await fetch(`${API_BASE_URL}/api/ingestion/files/`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (filesRes.ok) {
                    const filesData = await filesRes.json();
                    setResumes(filesData.resumes || []);
                    setLinkedinFiles(filesData.linkedin || []);
                    setUploadStatus({
                        resume: filesData.resumes?.length > 0 ? "success" : "idle",
                        linkedin: filesData.linkedin?.length > 0 ? "success" : "idle",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch saved data:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, accessToken]);

    const fetchFiles = async () => {
        if (!accessToken) return null;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setResumes(data.resumes || []);
                setLinkedinFiles(data.linkedin || []);
                return data;
            }
        } catch (error) {
            console.error("Failed to fetch files:", error);
        }
        return null;
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading("resume"); // Lock other sections
        setUploadStatus((prev) => ({ ...prev, resume: "uploading" }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/resume/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                setUploadStatus((prev) => ({ ...prev, resume: "success" }));
                await fetchFiles();
            } else {
                setUploadStatus((prev) => ({ ...prev, resume: "error" }));
            }
        } catch {
            setUploadStatus((prev) => ({ ...prev, resume: "error" }));
        } finally {
            setIsUploading(null); // Unlock sections
        }
    };

    const handleLinkedInUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading("linkedin"); // Lock other sections
        setUploadStatus((prev) => ({ ...prev, linkedin: "uploading" }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/linkedin/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                setUploadStatus((prev) => ({ ...prev, linkedin: "success" }));
                await fetchFiles();
            } else {
                setUploadStatus((prev) => ({ ...prev, linkedin: "error" }));
            }
        } catch {
            setUploadStatus((prev) => ({ ...prev, linkedin: "error" }));
        } finally {
            setIsUploading(null); // Unlock sections
        }
    };

    const handleRemoveFile = async (type: "resume" | "linkedin", id: string) => {
        if (!confirm("Are you sure you want to remove this file?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/${type}/${id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const newData = await fetchFiles();
                if (newData) {
                    if (type === "resume" && newData.resumes.length === 0) {
                        setUploadStatus(prev => ({ ...prev, resume: "idle" }));
                    } else if (type === "linkedin" && newData.linkedin.length === 0) {
                        setUploadStatus(prev => ({ ...prev, linkedin: "idle" }));
                    }
                }
            } else {
                alert("Failed to delete file.");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Error deleting file.");
        }
    };

    const handleToggleSelect = async (type: "resume" | "linkedin", id: string, currentlySelected: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/${type}/${id}/toggle-selection/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_selected: !currentlySelected }),
            });

            if (response.ok) {
                await fetchFiles();
            } else {
                alert("Failed to update selection.");
            }
        } catch (error) {
            console.error("Toggle failed:", error);
            alert("Error updating selection.");
        }
    };

    const getCurrentSectionData = () => {
        switch (activeTab) {
            case "contact":
                return contact;
            case "summary":
                return summary;
            case "skills":
                return skills;
            case "education":
                return education;
            case "experience":
                return experience;
            case "projects":
                return projects;
            case "achievements":
                return achievements;
            default:
                return {};
        }
    };

    const handleManualSave = async () => {
        setIsSaving(true);
        const content = getCurrentSectionData();

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/manual/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    section_type: activeTab,
                    content: content,
                }),
            });

            if (response.ok) {
                alert(`${activeTab} saved successfully!`);
            } else {
                alert("Failed to save. Please try again.");
            }
        } catch {
            alert("Error saving data.");
        } finally {
            setIsSaving(false);
        }
    };

    // Education handlers
    const addEducation = () => setEducation([...education, createEmptyEducation()]);
    const removeEducation = (id: string) => {
        if (education.length > 1) {
            setEducation(education.filter((e) => e.id !== id));
        }
    };
    const updateEducation = (id: string, field: keyof EducationEntry, value: string | boolean) => {
        setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // Experience handlers
    const addExperience = () => setExperience([...experience, createEmptyExperience()]);
    const removeExperience = (id: string) => {
        if (experience.length > 1) {
            setExperience(experience.filter((e) => e.id !== id));
        }
    };
    const updateExperience = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
        setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // Project handlers
    const addProject = () => setProjects([...projects, createEmptyProject()]);
    const removeProject = (id: string) => {
        if (projects.length > 1) {
            setProjects(projects.filter((p) => p.id !== id));
        }
    };
    const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
        setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };

    // Achievement handlers
    const addAchievement = () => setAchievements([...achievements, createEmptyAchievement()]);
    const removeAchievement = (id: string) => {
        if (achievements.length > 1) {
            setAchievements(achievements.filter((a) => a.id !== id));
        }
    };
    const updateAchievement = (id: string, field: keyof AchievementEntry, value: string) => {
        setAchievements(achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    };

    if (isLoading || isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-foreground-secondary">Loading profile data...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const tabs: { key: SectionType; label: string }[] = [
        { key: "contact", label: "Contact Info" },
        { key: "summary", label: "Summary" },
        { key: "skills", label: "Skills" },
        { key: "education", label: "Education" },
        { key: "experience", label: "Experience" },
        { key: "projects", label: "Projects" },
        { key: "achievements", label: "Achievements" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky border-b border-primary/0 bg-background/50 backdrop-blur-md top-0 h-16 z-30">
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center" style={{ maxWidth: '1400px' }}>
                    <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
                        <Image src="/logo.png" alt="Resumify" width={32} height={32} className="rounded-lg md:w-10 md:h-10" />
                        <span className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Sticky Action Bar */}
            <div className="sticky top-16 z-20 bg-background/50 backdrop-blur-xl border-b border-primary/0 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        {!hasAnyData ? (
                            <div className="flex items-center gap-3 py-1">
                                <div className="p-1.5 bg-primary/10 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-foreground-secondary leading-tight">
                                    Start building your profile by uploading a resume or entering details manually.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 py-1 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="p-1.5 bg-green-500/10 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 leading-tight">
                                    Your data is ready! Click review to finalize your profile.
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => router.push("/profile/review")}
                        disabled={!hasAnyData}
                        className={`btn-primary px-8 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all ${!hasAnyData ? "opacity-40 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95"
                            }`}
                    >
                        <span>📋 Review My Data</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                            Welcome Back! 👋
                        </h2>
                        <p className="text-foreground-secondary">
                            Upload your resume or LinkedIn profile, or enter your details manually
                        </p>
                    </div>

                    {/* Upload Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Resume Upload Card */}
                        <div className={`glass-card p-6 transition-opacity ${isUploading && isUploading !== "resume" ? "opacity-50 pointer-events-none" : ""
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-foreground">Upload Resume</h3>
                                {resumes.length > 0 && (
                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">
                                        {resumes.length}/5 Uploaded
                                    </span>
                                )}
                            </div>

                            {/* Uploaded Resumes List */}
                            {resumes.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    {resumes.map((file) => (
                                        <div key={file.id}
                                            onClick={() => handleToggleSelect("resume", file.id, file.is_selected)}
                                            className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer group ${file.is_selected
                                                ? "bg-primary/5 border-primary/30"
                                                : "bg-background-secondary border-border opacity-60 grayscale"
                                                }`}>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${file.is_selected ? "bg-primary border-primary" : "border-border"
                                                    }`}>
                                                    {file.is_selected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-xs">📄</span>
                                                <span className="text-xs font-medium text-foreground truncate max-w-[150px]" title={file.file_name}>
                                                    {file.file_name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile("resume", file.id);
                                                }}
                                                className="text-red-500 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove file"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-foreground-secondary mb-4">
                                Upload your existing resume (PDF or DOCX)
                            </p>
                            {resumes.length < 5 ? (
                                <label className={`block border-2 border-dashed border-border rounded-lg p-8 text-center transition-all relative overflow-hidden ${uploadStatus.resume === "uploading" || isResumeSelected ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
                                    }`}>
                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        className="hidden"
                                        onChange={handleResumeUpload}
                                        disabled={uploadStatus.resume === "uploading" || isResumeSelected}
                                    />
                                    <div className={`transition-all ${isResumeSelected ? "blur-[2px]" : ""}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-foreground-secondary">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span className="text-sm text-foreground-secondary">
                                            {uploadStatus.resume === "uploading" ? "Uploading..." : "Drop file here or click to browse"}
                                        </span>
                                    </div>
                                    {isResumeSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                                            <p className="text-xs font-medium text-primary bg-background/80 px-3 py-1.5 rounded-full shadow-sm border border-primary/20">
                                                Deselect current file to upload more
                                            </p>
                                        </div>
                                    )}
                                </label>
                            ) : (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                                    <p className="text-xs text-yellow-500">Maximum limit of 5 files reached.</p>
                                </div>
                            )}
                        </div>

                        {/* LinkedIn Upload Card */}
                        <div className={`glass-card p-6 transition-opacity ${isUploading && isUploading !== "linkedin" ? "opacity-50 pointer-events-none" : ""
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-foreground">Upload LinkedIn Profile</h3>
                                {linkedinFiles.length > 0 && (
                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">
                                        {linkedinFiles.length}/5 Uploaded
                                    </span>
                                )}
                            </div>

                            {/* Uploaded LinkedIn Files List */}
                            {linkedinFiles.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    {linkedinFiles.map((file) => (
                                        <div key={file.id}
                                            onClick={() => handleToggleSelect("linkedin", file.id, file.is_selected)}
                                            className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer group ${file.is_selected
                                                ? "bg-primary/5 border-primary/30"
                                                : "bg-background-secondary border-border opacity-60 grayscale"
                                                }`}>
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${file.is_selected ? "bg-primary border-primary" : "border-border"
                                                    }`}>
                                                    {file.is_selected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-xs">💼</span>
                                                <span className="text-xs font-medium text-foreground truncate max-w-[150px]" title={file.file_name}>
                                                    {file.file_name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile("linkedin", file.id);
                                                }}
                                                className="text-red-500 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove file"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-foreground-secondary mb-2">
                                Download your LinkedIn profile as PDF and upload here
                            </p>
                            <p className="text-xs text-foreground-secondary/70 mb-4">
                                Go to your LinkedIn profile → Click &quot;More&quot; → &quot;Save to PDF&quot;
                            </p>
                            {linkedinFiles.length < 5 ? (
                                <label className={`block border-2 border-dashed border-border rounded-lg p-8 text-center transition-all relative overflow-hidden ${uploadStatus.linkedin === "uploading" || isLinkedInSelected ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
                                    }`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleLinkedInUpload}
                                        disabled={uploadStatus.linkedin === "uploading" || isLinkedInSelected}
                                    />
                                    <div className={`transition-all ${isLinkedInSelected ? "blur-[2px]" : ""}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-foreground-secondary">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        <span className="text-sm text-foreground-secondary">
                                            {uploadStatus.linkedin === "uploading" ? "Uploading..." : "Drop LinkedIn PDF here"}
                                        </span>
                                    </div>
                                    {isLinkedInSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                                            <p className="text-xs font-medium text-primary bg-background/80 px-3 py-1.5 rounded-full shadow-sm border border-primary/20">
                                                Deselect current file to upload more
                                            </p>
                                        </div>
                                    )}
                                </label>
                            ) : (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                                    <p className="text-xs text-yellow-500">Maximum limit of 5 files reached.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Entry Section */}
                    <div className={`glass-card p-6 mb-8 transition-opacity ${isUploading ? "opacity-50 pointer-events-none" : ""
                        }`}>
                        <h3 className="font-medium text-foreground mb-4">Enter Data Manually</h3>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Tabs */}
                            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible md:min-w-[160px]">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                                            ? "bg-primary text-white"
                                            : "bg-background-secondary text-foreground-secondary hover:bg-border"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1">
                                {/* Contact Form */}
                                {activeTab === "contact" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="John Doe"
                                                value={contact.full_name}
                                                onChange={(e) => setContact({ ...contact, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                placeholder="john@example.com"
                                                value={contact.email}
                                                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                placeholder="+1 234 567 8900"
                                                value={contact.phone}
                                                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Location</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="New York, USA"
                                                value={contact.location}
                                                onChange={(e) => setContact({ ...contact, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-foreground-secondary mb-1">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                className="input-field"
                                                placeholder="https://linkedin.com/in/yourprofile"
                                                value={contact.linkedin_url}
                                                onChange={(e) => setContact({ ...contact, linkedin_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Summary Form */}
                                {activeTab === "summary" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Professional Summary</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Write a brief summary of your professional background..."
                                            value={summary.text}
                                            onChange={(e) => setSummary({ text: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Skills Form */}
                                {activeTab === "skills" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Skills (comma separated)</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Python, JavaScript, React, Node.js, AWS, Docker..."
                                            value={skills.skills}
                                            onChange={(e) => setSkills({ skills: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Education Form - Multiple Entries */}
                                {activeTab === "education" && (
                                    <div className="space-y-6">
                                        {education.map((edu, index) => (
                                            <div key={edu.id} className="p-4 border border-border rounded-lg relative">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-foreground">Education {index + 1}</h4>
                                                    {education.length > 1 && (
                                                        <button
                                                            onClick={() => removeEducation(edu.id)}
                                                            className="text-red-500 hover:text-red-600 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                    <div className="md:col-span-6">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Degree / Qualification</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="B.Tech in Computer Science"
                                                            value={edu.degree_type}
                                                            onChange={(e) => updateEducation(edu.id, "degree_type", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-6">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Institution Name</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Indian Institute of Technology"
                                                            value={edu.institution_name}
                                                            onChange={(e) => updateEducation(edu.id, "institution_name", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Mumbai"
                                                            value={edu.city}
                                                            onChange={(e) => updateEducation(edu.id, "city", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">State</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Maharashtra"
                                                            value={edu.state}
                                                            onChange={(e) => updateEducation(edu.id, "state", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Country</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="India"
                                                            value={edu.country}
                                                            onChange={(e) => updateEducation(edu.id, "country", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Start Date</label>
                                                        <input
                                                            type="month"
                                                            className="input-field"
                                                            value={edu.start_date}
                                                            onChange={(e) => updateEducation(edu.id, "start_date", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <div className="flex flex-col h-full">
                                                            <label className="block text-sm text-foreground-secondary mb-1">End Date</label>
                                                            {!edu.is_pursuing && (
                                                                <div className="mt-auto">
                                                                    <input
                                                                        type="month"
                                                                        className="input-field"
                                                                        value={edu.end_date}
                                                                        onChange={(e) => updateEducation(edu.id, "end_date", e.target.value)}
                                                                    />
                                                                </div>
                                                            )}
                                                            <label className="flex items-center gap-2 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={edu.is_pursuing}
                                                                    onChange={(e) => updateEducation(edu.id, "is_pursuing", e.target.checked)}
                                                                    className="rounded"
                                                                />
                                                                <span className="text-sm text-foreground-secondary">Currently Pursuing</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addEducation}
                                            className="btn-secondary w-full"
                                        >
                                            + Add Another Education
                                        </button>
                                    </div>
                                )}

                                {/* Experience Form - Multiple Entries */}
                                {activeTab === "experience" && (
                                    <div className="space-y-6">
                                        {experience.map((exp, index) => (
                                            <div key={exp.id} className="p-4 border border-border rounded-lg relative">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-foreground">Experience {index + 1}</h4>
                                                    {experience.length > 1 && (
                                                        <button
                                                            onClick={() => removeExperience(exp.id)}
                                                            className="text-red-500 hover:text-red-600 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Company Name</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Google"
                                                            value={exp.company_name}
                                                            onChange={(e) => updateExperience(exp.id, "company_name", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Job Role</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Software Engineer"
                                                            value={exp.job_role}
                                                            onChange={(e) => updateExperience(exp.id, "job_role", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Bangalore"
                                                            value={exp.city}
                                                            onChange={(e) => updateExperience(exp.id, "city", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Country</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="India"
                                                            value={exp.country}
                                                            onChange={(e) => updateExperience(exp.id, "country", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Start Date</label>
                                                        <input
                                                            type="month"
                                                            className="input-field"
                                                            value={exp.start_date}
                                                            onChange={(e) => updateExperience(exp.id, "start_date", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        {!exp.is_current && (
                                                            <>
                                                                <label className="block text-sm text-foreground-secondary mb-1">End Date</label>
                                                                <input
                                                                    type="month"
                                                                    className="input-field"
                                                                    value={exp.end_date}
                                                                    onChange={(e) => updateExperience(exp.id, "end_date", e.target.value)}
                                                                />
                                                            </>
                                                        )}
                                                        <label className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.is_current}
                                                                onChange={(e) => updateExperience(exp.id, "is_current", e.target.checked)}
                                                                className="rounded"
                                                            />
                                                            <span className="text-sm text-foreground-secondary">Currently Working Here</span>
                                                        </label>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Job Description</label>
                                                        <textarea
                                                            className="input-field min-h-[100px]"
                                                            placeholder="Describe your responsibilities and achievements..."
                                                            value={exp.job_description}
                                                            onChange={(e) => updateExperience(exp.id, "job_description", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addExperience}
                                            className="btn-secondary w-full"
                                        >
                                            + Add Another Experience
                                        </button>
                                    </div>
                                )}

                                {/* Projects Form - Multiple Entries */}
                                {activeTab === "projects" && (
                                    <div className="space-y-6">
                                        {projects.map((proj, index) => (
                                            <div key={proj.id} className="p-4 border border-border rounded-lg relative">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-foreground">Project {index + 1}</h4>
                                                    {projects.length > 1 && (
                                                        <button
                                                            onClick={() => removeProject(proj.id)}
                                                            className="text-red-500 hover:text-red-600 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Project Name</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="E-commerce Platform"
                                                            value={proj.name}
                                                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">Description</label>
                                                        <textarea
                                                            className="input-field min-h-[100px]"
                                                            placeholder="Describe the project and your contribution..."
                                                            value={proj.description}
                                                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Technologies Used</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="React, Node.js, MongoDB"
                                                            value={proj.technologies}
                                                            onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Project URL (optional)</label>
                                                        <input
                                                            type="url"
                                                            className="input-field"
                                                            placeholder="https://github.com/..."
                                                            value={proj.url}
                                                            onChange={(e) => updateProject(proj.id, "url", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addProject}
                                            className="btn-secondary w-full"
                                        >
                                            + Add Another Project
                                        </button>
                                    </div>
                                )}

                                {/* Achievements Form - Multiple Entries */}
                                {activeTab === "achievements" && (
                                    <div className="space-y-6">
                                        {achievements.map((achv, index) => (
                                            <div key={achv.id} className="p-4 border border-border rounded-lg relative">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium text-foreground">Achievement {index + 1}</h4>
                                                    {achievements.length > 1 && (
                                                        <button
                                                            onClick={() => removeAchievement(achv.id)}
                                                            className="text-red-500 hover:text-red-600 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Achievement Title</label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Won First Place in Hackathon 2023"
                                                            value={achv.title}
                                                            onChange={(e) => updateAchievement(achv.id, "title", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">Description (optional)</label>
                                                        <textarea
                                                            className="input-field min-h-[80px]"
                                                            placeholder="Brief description of the achievement..."
                                                            value={achv.description}
                                                            onChange={(e) => updateAchievement(achv.id, "description", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={addAchievement}
                                            className="btn-secondary w-full"
                                        >
                                            + Add Another Achievement
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleManualSave}
                                        disabled={isSaving}
                                        className="btn-secondary"
                                    >
                                        {isSaving ? "Saving..." : `Save ${tabs.find((t) => t.key === activeTab)?.label}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

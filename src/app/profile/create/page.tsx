"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";
import LocationSelector from "@/components/LocationSelector";
import PhoneInput from "@/components/PhoneInput";
import DateInput from "@/components/DateInput";

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
    country_iso: string;
    state_iso: string;
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
    state: string;
    country: string;
    country_iso: string;
    state_iso: string;
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
    country_iso: "",
    state_iso: "",
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
    state: "",
    country: "",
    country_iso: "",
    state_iso: "",
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

    // State for toast notification
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });

    useEffect(() => {
        if (toast.type) {
            const timer = setTimeout(() => setToast({ message: "", type: null }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.type]);
    const [education, setEducation] = useState<EducationEntry[]>([]);
    const [experience, setExperience] = useState<ExperienceEntry[]>([]);
    const [projects, setProjects] = useState<ProjectEntry[]>([]);
    const [achievements, setAchievements] = useState<AchievementEntry[]>([]);

    // Adaptive Flow states & refs
    const resumeSectionRef = useRef<HTMLDivElement>(null);
    const linkedinSectionRef = useRef<HTMLDivElement>(null);
    const manualSectionRef = useRef<HTMLDivElement>(null);
    const [showNudge, setShowNudge] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState("");

    // File lists
    const [resumes, setResumes] = useState<RawFile[]>([]);
    const [linkedinFiles, setLinkedinFiles] = useState<RawFile[]>([]);

    // State for UI improvements
    const [hasSavedManual, setHasSavedManual] = useState(false);
    const [isUploading, setIsUploading] = useState<"resume" | "linkedin" | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>("");
    const [uploadLimits, setUploadLimits] = useState<{
        max_resumes: number;
        max_linkedin: number;
        lifetime_resume_uploads: number;
        lifetime_linkedin_uploads: number;
        can_upload_resume: boolean;
        can_upload_linkedin: boolean;
    }>({
        max_resumes: 5,
        max_linkedin: 5,
        lifetime_resume_uploads: 0,
        lifetime_linkedin_uploads: 0,
        can_upload_resume: true,
        can_upload_linkedin: true,
    });
    const isResumeSelected = resumes.some((r) => r.is_selected);
    const isLinkedInSelected = linkedinFiles.some((l) => l.is_selected);

    // Derived hasAnyData - only true if a file is SELECTED OR manual save has happened
    const hasAnyData = isResumeSelected || isLinkedInSelected || hasSavedManual;

    // Helper to check if any manual state has content
    const checkManualStateHasContent = (updatedSection?: SectionType, updatedContent?: any) => {
        const getVal = (section: SectionType, currentVal: any) =>
            updatedSection === section ? updatedContent : currentVal;

        const c = getVal("contact", contact);
        const s = getVal("summary", summary);
        const sk = getVal("skills", skills);
        const edu = getVal("education", education) || [];
        const exp = getVal("experience", experience) || [];
        const proj = getVal("projects", projects) || [];
        const ach = getVal("achievements", achievements) || [];

        return Boolean(
            Object.values(c || {}).some((v) => v && (v as string).trim?.()) ||
            (s?.text?.trim?.()) ||
            (sk?.skills?.trim?.()) ||
            (Array.isArray(edu) && edu.some(e => e.degree_type?.trim() || e.institution_name?.trim())) ||
            (Array.isArray(exp) && exp.some(e => e.company_name?.trim() || e.job_role?.trim())) ||
            (Array.isArray(proj) && proj.some(p => p.name?.trim())) ||
            (Array.isArray(ach) && ach.some(a => a.title?.trim()))
        );
    };

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
                        else setEducation([]);

                        if (data.manual.experience?.length > 0) setExperience(data.manual.experience);
                        else setExperience([]);

                        if (data.manual.projects?.length > 0) setProjects(data.manual.projects);
                        else setProjects([]);

                        if (data.manual.achievements?.length > 0) setAchievements(data.manual.achievements);
                        else setAchievements([]);

                        // Update saved manual status based on fetched data
                        const hasContent = Boolean(
                            Object.values(data.manual.contact || {}).some(v => v) ||
                            data.manual.summary?.text ||
                            data.manual.skills?.skills ||
                            data.manual.education?.length > 0 ||
                            data.manual.experience?.length > 0 ||
                            data.manual.projects?.length > 0 ||
                            data.manual.achievements?.length > 0
                        );
                        setHasSavedManual(hasContent);
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
                if (data.limits) {
                    setUploadLimits(data.limits);
                }
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

        if (!uploadLimits.can_upload_resume) {
            setToast({ message: "You have reached your lifetime limit of 5 resume uploads.", type: "error" });
            return;
        }

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
                setUploadStatus(prev => ({ ...prev, resume: "success" }));
                setToast({ message: "Resume uploaded successfully!", type: "success" });
                setNudgeMessage("Resume imported! 🚀 Refine your details manually to ensure everything is perfect for ATS.");
                setShowNudge(true);
                await fetchFiles();
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.error || "Failed to upload resume", type: "error" });
                setUploadStatus((prev) => ({ ...prev, resume: "error" }));
            }
        } catch {
            setToast({ message: "Network error occurred", type: "error" });
            setUploadStatus((prev) => ({ ...prev, resume: "error" }));
        } finally {
            setIsUploading(null); // Unlock sections
        }
    };

    const handleLinkedInUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!uploadLimits.can_upload_linkedin) {
            setToast({ message: "You have reached your lifetime limit of 5 LinkedIn uploads.", type: "error" });
            return;
        }

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
                setUploadStatus(prev => ({ ...prev, linkedin: "success" }));
                setToast({ message: "LinkedIn profile uploaded successfully!", type: "success" });
                setNudgeMessage("LinkedIn profile imported! 🚀 Refine your details manually to ensure everything is perfect for ATS.");
                setShowNudge(true);
                await fetchFiles();
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.error || "Failed to upload LinkedIn profile", type: "error" });
                setUploadStatus((prev) => ({ ...prev, linkedin: "error" }));
            }
        } catch {
            setToast({ message: "Network error occurred", type: "error" });
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
        let content = getCurrentSectionData();

        // Sanitize arrays to remove empty entries
        if (activeTab === "education" && Array.isArray(content)) {
            content = content.filter(edu => edu.degree_type.trim() || edu.institution_name.trim());
        } else if (activeTab === "experience" && Array.isArray(content)) {
            content = content.filter(exp => exp.company_name.trim() || exp.job_role.trim());
        } else if (activeTab === "projects" && Array.isArray(content)) {
            content = content.filter(proj => proj.name.trim());
        } else if (activeTab === "achievements" && Array.isArray(content)) {
            content = content.filter(achv => achv.title.trim());
        }

        // Context-Aware Validation
        if (activeTab === "contact") {
            const { full_name, email, linkedin_url } = contact;
            // Only mandatory if NO files are selected
            if (!isResumeSelected && !isLinkedInSelected) {
                if (!full_name.trim() || !email.trim() || !linkedin_url.trim()) {
                    setToast({ message: "Name, Email, and LinkedIn URL are mandatory.", type: "error" });
                    setIsSaving(false);
                    return;
                }
            }
        } else if (activeTab === "summary") {
            if (!isResumeSelected && !isLinkedInSelected && !summary.text.trim()) {
                setToast({ message: "Summary is mandatory when no files are selected.", type: "error" });
                setIsSaving(false);
                return;
            }
        } else if (activeTab === "skills") {
            if (!isResumeSelected && !isLinkedInSelected && !skills.skills.trim()) {
                setToast({ message: "Skills are mandatory when no files are selected.", type: "error" });
                setIsSaving(false);
                return;
            }
        } else if (activeTab === "education" && Array.isArray(content) && content.length > 0) {
            const incomplete = content.some(edu =>
                !edu.degree_type.trim() || !edu.institution_name.trim() ||
                !edu.city.trim() || !edu.state.trim() || !edu.country.trim() || !edu.start_date.trim() ||
                (!edu.is_pursuing && !edu.end_date.trim())
            );
            if (incomplete) {
                setToast({ message: "Please fill all fields for all education entries.", type: "error" });
                setIsSaving(false);
                return;
            }
        } else if (activeTab === "experience" && Array.isArray(content) && content.length > 0) {
            const incomplete = content.some(exp =>
                !exp.company_name.trim() || !exp.job_role.trim() ||
                !exp.city.trim() || !exp.country.trim() || !exp.start_date.trim() ||
                (!exp.is_current && !exp.end_date.trim()) || !exp.job_description.trim()
            );
            if (incomplete) {
                setToast({ message: "Please fill all fields for all experience entries.", type: "error" });
                setIsSaving(false);
                return;
            }
        } else if (activeTab === "projects" && Array.isArray(content) && content.length > 0) {
            const incomplete = content.some(proj =>
                !proj.name.trim() || !proj.description.trim() || !proj.technologies.trim()
            );
            if (incomplete) {
                setToast({ message: "Please fill Name, Description, and Technologies for all projects.", type: "error" });
                setIsSaving(false);
                return;
            }
        } else if (activeTab === "achievements" && Array.isArray(content) && content.length > 0) {
            const incomplete = content.some(ach => !ach.title.trim() || !ach.description.trim());
            if (incomplete) {
                setToast({ message: "Please fill all fields for all achievements.", type: "error" });
                setIsSaving(false);
                return;
            }
        }

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
                // Sync local state with sanitized content to reflect removed empty cards
                if (activeTab === "education") setEducation(content as EducationEntry[]);
                else if (activeTab === "experience") setExperience(content as ExperienceEntry[]);
                else if (activeTab === "projects") setProjects(content as ProjectEntry[]);
                else if (activeTab === "achievements") setAchievements(content as AchievementEntry[]);

                setToast({ message: `${tabs.find(t => t.key === activeTab)?.label} saved!`, type: "success" });
                // Use the sanitized content to accurately check if any manual data remains
                setHasSavedManual(checkManualStateHasContent(activeTab, content));
            } else {
                setToast({ message: "Failed to save. Please try again.", type: "error" });
            }
        } catch {
            setToast({ message: "Error saving data.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    // Save all sections at once
    const handleSaveAllSections = async () => {
        setIsSaving(true);

        // Prepare all section data with sanitization
        const sections = [
            { section_type: "contact", content: contact },
            { section_type: "summary", content: summary },
            { section_type: "skills", content: skills },
            {
                section_type: "education",
                content: education.filter(edu => edu.degree_type.trim() || edu.institution_name.trim())
            },
            {
                section_type: "experience",
                content: experience.filter(exp => exp.company_name.trim() || exp.job_role.trim())
            },
            {
                section_type: "projects",
                content: projects.filter(proj => proj.name.trim())
            },
            {
                section_type: "achievements",
                content: achievements.filter(achv => achv.title.trim())
            },
        ];

        // Basic validation for mandatory fields when no files are selected
        if (!isResumeSelected && !isLinkedInSelected) {
            const { full_name, email, linkedin_url } = contact;
            if (!full_name.trim() || !email.trim() || !linkedin_url.trim()) {
                setToast({ message: "Name, Email, and LinkedIn URL are mandatory.", type: "error" });
                setIsSaving(false);
                return;
            }
            if (!summary.text.trim()) {
                setToast({ message: "Summary is mandatory when no files are selected.", type: "error" });
                setIsSaving(false);
                return;
            }
            if (!skills.skills.trim()) {
                setToast({ message: "Skills are mandatory when no files are selected.", type: "error" });
                setIsSaving(false);
                return;
            }
        }

        try {
            // Save all sections in parallel
            const results = await Promise.all(
                sections.map(section =>
                    fetch(`${API_BASE_URL}/api/ingestion/manual/`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(section),
                    })
                )
            );

            const allSuccessful = results.every(res => res.ok);

            if (allSuccessful) {
                // Sync local state with sanitized arrays
                setEducation(sections[3].content as EducationEntry[]);
                setExperience(sections[4].content as ExperienceEntry[]);
                setProjects(sections[5].content as ProjectEntry[]);
                setAchievements(sections[6].content as AchievementEntry[]);

                setToast({ message: "All sections saved successfully!", type: "success" });
                setHasSavedManual(true);
            } else {
                setToast({ message: "Some sections failed to save. Please try again.", type: "error" });
            }
        } catch {
            setToast({ message: "Error saving data.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    // Education handlers
    const addEducation = () => setEducation([...education, createEmptyEducation()]);
    const removeEducation = (id: string) => setEducation(education.filter((e) => e.id !== id));
    const updateEducation = (id: string, field: keyof EducationEntry, value: string | boolean) => {
        setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // Experience handlers
    const addExperience = () => setExperience([...experience, createEmptyExperience()]);
    const removeExperience = (id: string) => setExperience(experience.filter((e) => e.id !== id));
    const updateExperience = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
        setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // Project handlers
    const addProject = () => setProjects([...projects, createEmptyProject()]);
    const removeProject = (id: string) => setProjects(projects.filter((p) => p.id !== id));
    const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
        setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };

    // Achievement handlers
    const addAchievement = () => setAchievements([...achievements, createEmptyAchievement()]);
    const removeAchievement = (id: string) => setAchievements(achievements.filter((a) => a.id !== id));
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
            {/* Processing Overlay */}
            {isExtracting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="glass-card p-8 max-w-md w-full mx-4 text-center shadow-2xl">
                        {/* Animated Logo/Icon */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center animate-pulse">
                                    <span className="text-4xl">✨</span>
                                </div>
                            </div>
                            {/* Spinning ring */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Processing Your Data
                        </h2>

                        {/* Current Step */}
                        <div className="text-lg text-primary font-medium mb-4 min-h-[28px] transition-all duration-300">
                            {processingStep}
                        </div>

                        {/* Progress indicator */}
                        <div className="w-full bg-background-secondary rounded-full h-2 mb-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse rounded-full" style={{ width: '60%' }} />
                        </div>

                        <p className="text-sm text-foreground-secondary">
                            Please wait while we extract and organize your information...
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky border-b border-primary/0 bg-background/50 backdrop-blur-md top-0 z-30">
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

            {/* Main Content with Sidebar */}
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row-reverse gap-6">
                        {/* Right Sidebar - Navigation & Actions */}
                        <aside className="w-full lg:w-64 shrink-0">
                            <div className="glass-card p-4 lg:sticky lg:top-24 space-y-4">
                                {/* Navigation Title */}
                                <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider px-2">
                                    Import Sources
                                </h3>

                                {/* Navigation Buttons */}
                                <nav className="flex lg:flex-col gap-2">
                                    <button
                                        onClick={() => resumeSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                                        className="flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-background-secondary text-foreground group"
                                    >
                                        <span className="text-xl">📄</span>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm">Resume</span>
                                            {isResumeSelected && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    <span className="text-[10px] text-green-500">Selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => linkedinSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                                        className="flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-background-secondary text-foreground group"
                                    >
                                        <span className="text-xl">💼</span>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm">LinkedIn</span>
                                            {isLinkedInSelected && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    <span className="text-[10px] text-green-500">Selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => manualSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                                        className="flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-background-secondary text-foreground group"
                                    >
                                        <span className="text-xl">✍️</span>
                                        <div className="flex-1">
                                            <span className="font-medium text-sm">Manual Entry</span>
                                            {hasSavedManual && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    <span className="text-[10px] text-green-500">Saved</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </nav>

                                {/* Divider */}
                                <div className="border-t border-border/50 my-2" />

                                {/* Status */}
                                {!hasAnyData ? (
                                    <div className="px-2 py-2 text-center">
                                        <p className="text-xs text-foreground-secondary">
                                            Start by importing a file or entering details manually.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="px-2 py-2 flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                                            Data ready!
                                        </p>
                                    </div>
                                )}

                                {/* Get My Data Button */}
                                <button
                                    onClick={async () => {
                                        setIsExtracting(true);
                                        try {
                                            if (isResumeSelected) {
                                                setProcessingStep("📄 Extracting your Resume PDF...");
                                                await new Promise(r => setTimeout(r, 800));
                                            }
                                            if (isLinkedInSelected) {
                                                setProcessingStep("💼 Processing LinkedIn data...");
                                                await new Promise(r => setTimeout(r, 800));
                                            }
                                            if (hasSavedManual) {
                                                setProcessingStep("✍️ Processing manual entries...");
                                                await new Promise(r => setTimeout(r, 600));
                                            }
                                            setProcessingStep("🤖 AI is analyzing your data...");

                                            const response = await fetch(`${API_BASE_URL}/api/ingestion/extract/`, {
                                                method: "POST",
                                                headers: {
                                                    Authorization: `Bearer ${accessToken}`,
                                                    "Content-Type": "application/json",
                                                },
                                            });

                                            if (response.ok) {
                                                setProcessingStep("✅ Done! Redirecting...");
                                                await new Promise(r => setTimeout(r, 500));
                                                router.push("/profile/normalize");
                                            } else {
                                                setToast({ message: "Failed to process data", type: "error" });
                                                setIsExtracting(false);
                                                setProcessingStep("");
                                            }
                                        } catch (error) {
                                            console.error("Extraction error:", error);
                                            setToast({ message: "Failed to process data", type: "error" });
                                            setIsExtracting(false);
                                            setProcessingStep("");
                                        }
                                    }}
                                    disabled={!hasAnyData || isExtracting}
                                    className={`w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all ${!hasAnyData || isExtracting ? "opacity-40 grayscale cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                                        }`}
                                >
                                    {isExtracting ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>✨ Get My Data</span>
                                    )}
                                </button>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* Header with Background Accent */}
                            <div className="text-center mb-10 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                                    Build Your <span className="text-primary italic">Professional</span> Profile
                                </h1>
                                <p className="text-base text-foreground-secondary max-w-2xl mx-auto">
                                    Import your background or enter it manually to create an ATS-optimized foundation for your resume.
                                </p>
                            </div>

                            {/* Step 1: Smart Import */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">1</span>
                                    <h2 className="text-xl font-semibold text-foreground">Smart Import (Highly Recommended)</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                                    {/* Resume Upload Card */}
                                    <div
                                        id="resume-section"
                                        ref={resumeSectionRef}
                                        className={`glass-card p-6 transition-opacity scroll-mt-32 ${isUploading && isUploading !== "resume" ? "opacity-50 pointer-events-none" : ""
                                            }`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                </svg>
                                            </div>
                                            <h3 className="font-medium text-foreground">Upload Resume</h3>
                                            {uploadLimits.lifetime_resume_uploads > 0 && (
                                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">
                                                    {uploadLimits.lifetime_resume_uploads}/{uploadLimits.max_resumes} Lifetime Uploaded
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
                                        {uploadLimits.can_upload_resume ? (
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
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                                                <p className="text-xs text-red-500 font-medium">Lifetime limit of {uploadLimits.max_resumes} files reached.</p>
                                                <p className="text-[10px] text-foreground-secondary mt-1">Please upgrade for unlimited uploads.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* LinkedIn Upload Card */}
                                    <div
                                        id="linkedin-section"
                                        ref={linkedinSectionRef}
                                        className={`glass-card p-6 transition-opacity scroll-mt-32 ${isUploading && isUploading !== "linkedin" ? "opacity-50 pointer-events-none" : ""
                                            }`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-medium text-foreground">Upload LinkedIn Profile</h3>
                                            {uploadLimits.lifetime_linkedin_uploads > 0 && (
                                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">
                                                    {uploadLimits.lifetime_linkedin_uploads}/{uploadLimits.max_linkedin} Lifetime Uploaded
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
                                        {uploadLimits.can_upload_linkedin ? (
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
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                                                <p className="text-xs text-red-500 font-medium">Lifetime limit of {uploadLimits.max_linkedin} files reached.</p>
                                                <p className="text-[10px] text-foreground-secondary mt-1">Please upgrade for unlimited uploads.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Manual Refinement */}
                            <div id="manual-section" ref={manualSectionRef} className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">2</span>
                                    <h2 className="text-xl font-semibold text-foreground">Manual Refinement (Better for ATS)</h2>
                                </div>
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
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                            Full Name {(!isResumeSelected && !isLinkedInSelected) ? <span className="text-red-500">*</span> : <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="John Doe"
                                                            value={contact.full_name}
                                                            onChange={(e) => setContact({ ...contact, full_name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                            Email Address {(!isResumeSelected && !isLinkedInSelected) ? <span className="text-red-500">*</span> : <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>}
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="input-field"
                                                            placeholder="john@example.com"
                                                            value={contact.email}
                                                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                            Phone Number <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>
                                                        </label>
                                                        <PhoneInput
                                                            value={contact.phone}
                                                            onChange={(phone) => setContact({ ...contact, phone })}
                                                            placeholder="98765 43210"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                            LinkedIn Profile URL {(!isResumeSelected && !isLinkedInSelected) ? <span className="text-red-500">*</span> : <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>}
                                                        </label>
                                                        <input
                                                            type="url"
                                                            className="input-field"
                                                            placeholder="https://linkedin.com/in/johndoe"
                                                            value={contact.linkedin_url}
                                                            onChange={(e) => setContact({ ...contact, linkedin_url: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                            Location <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="input-field"
                                                            placeholder="Mumbai, India"
                                                            value={contact.location}
                                                            onChange={(e) => setContact({ ...contact, location: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary Form */}
                                            {activeTab === "summary" && (
                                                <div className="space-y-4">
                                                    <label className="block text-sm text-foreground-secondary mb-1">
                                                        Professional Summary {(uploadStatus.resume !== "success" && uploadStatus.linkedin !== "success") && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <textarea
                                                        className="input-field min-h-[150px]"
                                                        placeholder="Write a brief summary of your professional background and key achievements..."
                                                        value={summary.text}
                                                        onChange={(e) => setSummary({ text: e.target.value })}
                                                    />
                                                    <p className="text-xs text-foreground-secondary italic">
                                                        Tip: Highlight your most relevant skills and experiences.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Skills Form */}
                                            {activeTab === "skills" && (
                                                <div className="space-y-4">
                                                    <label className="block text-sm text-foreground-secondary mb-1">
                                                        Skills (Comma separated) {(uploadStatus.resume !== "success" && uploadStatus.linkedin !== "success") && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <textarea
                                                        className="input-field min-h-[100px]"
                                                        placeholder="React, Node.js, Python, Project Management, Agile..."
                                                        value={skills.skills}
                                                        onChange={(e) => setSkills({ skills: e.target.value })}
                                                    />
                                                    <p className="text-xs text-foreground-secondary">
                                                        Separate skills with commas for better ATS parsing.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Education Form - Multiple Entries */}
                                            {activeTab === "education" && (
                                                <div className="space-y-6">
                                                    {education.length === 0 ? (
                                                        <div className="p-8 border border-dashed border-border rounded-lg text-center bg-background/30">
                                                            <p className="text-sm text-foreground-secondary mb-4">No education history added yet.</p>
                                                            <button onClick={addEducation} className="btn-secondary px-6">+ Add Education</button>
                                                        </div>
                                                    ) : (
                                                        education.map((edu, index) => (
                                                            <div key={edu.id} className="p-4 border border-border rounded-lg relative">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="font-medium text-foreground">Education {index + 1}</h4>
                                                                    <button
                                                                        onClick={() => removeEducation(edu.id)}
                                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                                    <div className="md:col-span-6">
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Degree / Qualification <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="B.Tech in Computer Science"
                                                                            value={edu.degree_type}
                                                                            onChange={(e) => updateEducation(edu.id, "degree_type", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-6">
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Institution Name <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="Indian Institute of Technology"
                                                                            value={edu.institution_name}
                                                                            onChange={(e) => updateEducation(edu.id, "institution_name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    {/* Location Selector */}
                                                                    <div className="md:col-span-6">
                                                                        <label className="block text-sm text-foreground-secondary mb-2">
                                                                            Location <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <LocationSelector
                                                                            country={edu.country}
                                                                            state={edu.state}
                                                                            city={edu.city}
                                                                            onCountryChange={(value, isoCode) => {
                                                                                updateEducation(edu.id, "country", value);
                                                                                updateEducation(edu.id, "country_iso", isoCode);
                                                                            }}
                                                                            onStateChange={(value, isoCode) => {
                                                                                updateEducation(edu.id, "state", value);
                                                                                updateEducation(edu.id, "state_iso", isoCode);
                                                                            }}
                                                                            onCityChange={(value) => updateEducation(edu.id, "city", value)}
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-3">
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Start Date <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <DateInput
                                                                            value={edu.start_date}
                                                                            onChange={(value) => updateEducation(edu.id, "start_date", value)}
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-3">
                                                                        <div className="flex flex-col h-full">
                                                                            <label className="block text-sm text-foreground-secondary mb-1">
                                                                                End Date {!edu.is_pursuing && <span className="text-red-500">*</span>}
                                                                            </label>
                                                                            {!edu.is_pursuing && (
                                                                                <div className="mt-auto">
                                                                                    <DateInput
                                                                                        value={edu.end_date}
                                                                                        onChange={(value) => updateEducation(edu.id, "end_date", value)}
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
                                                        ))
                                                    )}
                                                    {education.length > 0 && (
                                                        <button
                                                            onClick={addEducation}
                                                            className="btn-secondary w-full"
                                                        >
                                                            + Add Another Education
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Experience Form - Multiple Entries */}
                                            {activeTab === "experience" && (
                                                <div className="space-y-6">
                                                    {experience.length === 0 ? (
                                                        <div className="p-8 border border-dashed border-border rounded-lg text-center bg-background/30">
                                                            <p className="text-sm text-foreground-secondary mb-4">No experience history added yet.</p>
                                                            <button onClick={addExperience} className="btn-secondary px-6">+ Add Experience</button>
                                                        </div>
                                                    ) : (
                                                        experience.map((exp, index) => (
                                                            <div key={exp.id} className="p-4 border border-border rounded-lg relative">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="font-medium text-foreground">Experience {index + 1}</h4>
                                                                    <button
                                                                        onClick={() => removeExperience(exp.id)}
                                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Company Name <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="Google"
                                                                            value={exp.company_name}
                                                                            onChange={(e) => updateExperience(exp.id, "company_name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Job Role <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="Software Engineer"
                                                                            value={exp.job_role}
                                                                            onChange={(e) => updateExperience(exp.id, "job_role", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    {/* Location Selector */}
                                                                    <div className="md:col-span-2">
                                                                        <label className="block text-sm text-foreground-secondary mb-2">
                                                                            Location <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <LocationSelector
                                                                            country={exp.country}
                                                                            state={exp.state}
                                                                            city={exp.city}
                                                                            onCountryChange={(value, isoCode) => {
                                                                                updateExperience(exp.id, "country", value);
                                                                                updateExperience(exp.id, "country_iso", isoCode);
                                                                            }}
                                                                            onStateChange={(value, isoCode) => {
                                                                                updateExperience(exp.id, "state", value);
                                                                                updateExperience(exp.id, "state_iso", isoCode);
                                                                            }}
                                                                            onCityChange={(value) => updateExperience(exp.id, "city", value)}
                                                                            layout="horizontal"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Start Date <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <DateInput
                                                                            value={exp.start_date}
                                                                            onChange={(value) => updateExperience(exp.id, "start_date", value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        {!exp.is_current && (
                                                                            <>
                                                                                <label className="block text-sm text-foreground-secondary mb-1">
                                                                                    End Date <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <DateInput
                                                                                    value={exp.end_date}
                                                                                    onChange={(value) => updateExperience(exp.id, "end_date", value)}
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
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Job Description <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <textarea
                                                                            className="input-field min-h-[100px]"
                                                                            placeholder="Describe your responsibilities and achievements..."
                                                                            value={exp.job_description}
                                                                            onChange={(e) => updateExperience(exp.id, "job_description", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                    {experience.length > 0 && (
                                                        <button
                                                            onClick={addExperience}
                                                            className="btn-secondary w-full"
                                                        >
                                                            + Add Another Experience
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Projects Form - Multiple Entries */}
                                            {activeTab === "projects" && (
                                                <div className="space-y-6">
                                                    {projects.length === 0 ? (
                                                        <div className="p-8 border border-dashed border-border rounded-lg text-center bg-background/30">
                                                            <p className="text-sm text-foreground-secondary mb-4">No projects added yet.</p>
                                                            <button onClick={addProject} className="btn-secondary px-6">+ Add Project</button>
                                                        </div>
                                                    ) : (
                                                        projects.map((proj, index) => (
                                                            <div key={proj.id} className="p-4 border border-border rounded-lg relative">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="font-medium text-foreground">Project {index + 1}</h4>
                                                                    <button
                                                                        onClick={() => removeProject(proj.id)}
                                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="md:col-span-2">
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Project Name <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="E-commerce Platform"
                                                                            value={proj.name}
                                                                            onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-2">
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Description <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <textarea
                                                                            className="input-field min-h-[100px]"
                                                                            placeholder="Describe the project and your contribution..."
                                                                            value={proj.description}
                                                                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Technologies Used <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="React, Node.js, MongoDB"
                                                                            value={proj.technologies}
                                                                            onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Project URL <span className="text-xs text-foreground-secondary/60 ml-1 font-normal">(Optional)</span>
                                                                        </label>
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
                                                        ))
                                                    )}
                                                    {projects.length > 0 && (
                                                        <button
                                                            onClick={addProject}
                                                            className="btn-secondary w-full"
                                                        >
                                                            + Add Another Project
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Achievements Form - Multiple Entries */}
                                            {activeTab === "achievements" && (
                                                <div className="space-y-6">
                                                    {achievements.length === 0 ? (
                                                        <div className="p-8 border border-dashed border-border rounded-lg text-center bg-background/30">
                                                            <p className="text-sm text-foreground-secondary mb-4">No achievements added yet.</p>
                                                            <button onClick={addAchievement} className="btn-secondary px-6">+ Add Achievement</button>
                                                        </div>
                                                    ) : (
                                                        achievements.map((achv, index) => (
                                                            <div key={achv.id} className="p-4 border border-border rounded-lg relative">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="font-medium text-foreground">Achievement {index + 1}</h4>
                                                                    <button
                                                                        onClick={() => removeAchievement(achv.id)}
                                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Achievement Title <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="input-field"
                                                                            placeholder="Won First Place in Hackathon 2023"
                                                                            value={achv.title}
                                                                            onChange={(e) => updateAchievement(achv.id, "title", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm text-foreground-secondary mb-1">
                                                                            Description <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <textarea
                                                                            className="input-field min-h-[80px]"
                                                                            placeholder="Brief description of the achievement..."
                                                                            value={achv.description}
                                                                            onChange={(e) => updateAchievement(achv.id, "description", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                    {achievements.length > 0 && (
                                                        <button
                                                            onClick={addAchievement}
                                                            className="btn-secondary w-full"
                                                        >
                                                            + Add Another Achievement
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={handleSaveAllSections}
                                                    disabled={isSaving}
                                                    className="btn-primary"
                                                >
                                                    {isSaving ? "Saving..." : "💾 Save All Sections"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Nudge Overlay */}
            {showNudge && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card max-w-md w-full p-8 text-center shadow-2xl scale-in-center border-primary/20">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Successfully Imported!</h3>
                        <p className="text-foreground-secondary mb-8 leading-relaxed">
                            {nudgeMessage || "Your data has been processed. Would you like to refine it manually for even better ATS organization?"}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowNudge(false);
                                    manualSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="btn-primary w-full py-3"
                            >
                                Yes, Refine Now
                            </button>
                            <button
                                onClick={() => setShowNudge(false)}
                                className="btn-secondary w-full py-3 border-none bg-transparent hover:bg-background-secondary"
                            >
                                I&apos;ll do it later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.type && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${toast.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

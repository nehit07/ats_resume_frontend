"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import InstitutionSelector from "@/components/InstitutionSelector";
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

// --- SVG Icons ---
const IconResume = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const IconLinkedIn = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const IconManual = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconBack = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const IconUpload = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const IconSparkles = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 1" /><path d="m2 6 1 1" /><path d="m9 3-1 1" /><path d="m11 6-1 1" />
    </svg>
);

const IconEducation = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
);

const IconExperience = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const IconProjects = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
);

const IconAchievements = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

export default function ProfileCreatePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, accessToken } = useAuth();

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [currentView, setCurrentView] = useState<"menu" | "resume" | "linkedin" | "manual">(
        (searchParams.get("view") as any) || "menu"
    );
    const [activeTab, setActiveTab] = useState<SectionType>(
        (searchParams.get("tab") as SectionType) || "contact"
    );

    // Navigation helper
    const updateNavigation = (view?: string, tab?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (view) params.set("view", view);
        if (tab) params.set("tab", tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Sync state with URL changes (handle back/forward)
    useEffect(() => {
        const urlView = searchParams.get("view") as any;
        const urlTab = searchParams.get("tab") as SectionType;

        if (urlView && urlView !== currentView) setCurrentView(urlView);
        if (urlTab && urlTab !== activeTab) setActiveTab(urlTab);
        if (!urlView && currentView !== "menu") setCurrentView("menu");
    }, [searchParams]);

    // UI states
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        resume: "idle",
        linkedin: "idle",
    });
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
    const [showNudge, setShowNudge] = useState(false);
    const [nudgeType, setNudgeType] = useState<"resume" | "linkedin" | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [showSourceWarning, setShowSourceWarning] = useState(false);
    const [sourceWarningType, setSourceWarningType] = useState<"resume" | "linkedin" | null>(null);

    // Profile data states
    const [contact, setContact] = useState({
        full_name: "",
        email: "",
        phone: "",
        location: "",
        linkedin_url: "",
    });
    const [summary, setSummary] = useState({ text: "" });
    const [skills, setSkills] = useState({ skills: "" });
    const [education, setEducation] = useState<EducationEntry[]>([]);
    const [experience, setExperience] = useState<ExperienceEntry[]>([]);
    const [projects, setProjects] = useState<ProjectEntry[]>([]);
    const [achievements, setAchievements] = useState<AchievementEntry[]>([]);

    // File lists
    const [resumes, setResumes] = useState<RawFile[]>([]);
    const [linkedinFiles, setLinkedinFiles] = useState<RawFile[]>([]);

    // Extraction processing state
    const [isExtracting, setIsExtracting] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>("");
    const [uploadLimits, setUploadLimits] = useState({
        max_resumes: 5,
        max_linkedin: 5,
        lifetime_resume_uploads: 0,
        lifetime_linkedin_uploads: 0,
        can_upload_resume: true,
        can_upload_linkedin: true,
    });

    // Manual save status
    const [hasSavedManual, setHasSavedManual] = useState(false);

    // Derived states
    const isResumeSelected = resumes.some((r) => r.is_selected);
    const isLinkedInSelected = linkedinFiles.some((l) => l.is_selected);
    const isContentFromFiles = isResumeSelected || isLinkedInSelected;
    const hasAnyData = isResumeSelected || isLinkedInSelected || hasSavedManual;

    const tabs: { key: SectionType; label: string }[] = [
        { key: "contact", label: "Contact Info" },
        { key: "summary", label: "Summary" },
        { key: "skills", label: "Skills" },
        { key: "education", label: "Education" },
        { key: "experience", label: "Experience" },
        { key: "projects", label: "Projects" },
        { key: "achievements", label: "Achievements" },
    ];

    // --- Helper Functions ---

    // Fetch saved data and files on mount
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
                        setEducation(data.manual.education || []);
                        setExperience(data.manual.experience || []);
                        setProjects(data.manual.projects || []);
                        setAchievements(data.manual.achievements || []);

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

                await fetchFiles();
            } catch (error) {
                console.error("Failed to fetch saved data:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, accessToken]);

    // Toast cleanup
    useEffect(() => {
        if (toast.type) {
            const timer = setTimeout(() => setToast({ message: "", type: null }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.type]);

    const fetchFiles = async () => {
        if (!accessToken) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setResumes(data.resumes || []);
                setLinkedinFiles(data.linkedin || []);
                if (data.limits) setUploadLimits(data.limits);
            }
        } catch (error) {
            console.error("Failed to fetch files:", error);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!uploadLimits.can_upload_resume) {
            setToast({ message: "Upload limit reached", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setUploadStatus(prev => ({ ...prev, resume: "uploading" }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/resume/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (response.ok) {
                setUploadStatus(prev => ({ ...prev, resume: "success" }));
                setToast({ message: "Resume uploaded!", type: "success" });
                await fetchFiles();
                setNudgeType("resume");
                setShowNudge(true);
            } else {
                setToast({ message: "Upload failed", type: "error" });
                setUploadStatus(prev => ({ ...prev, resume: "error" }));
            }
        } catch {
            setToast({ message: "Network error", type: "error" });
        }
    };

    const handleLinkedInUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!uploadLimits.can_upload_linkedin) {
            setToast({ message: "Upload limit reached", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setUploadStatus(prev => ({ ...prev, linkedin: "uploading" }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/linkedin/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (response.ok) {
                setUploadStatus(prev => ({ ...prev, linkedin: "success" }));
                setToast({ message: "LinkedIn profile uploaded!", type: "success" });
                await fetchFiles();
                setNudgeType("linkedin");
                setShowNudge(true);
            } else {
                setToast({ message: "Upload failed", type: "error" });
                setUploadStatus(prev => ({ ...prev, linkedin: "error" }));
            }
        } catch {
            setToast({ message: "Network error", type: "error" });
        }
    };

    const handleRemoveFile = async (type: "resume" | "linkedin", id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/${type}/${id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) await fetchFiles();
        } catch (error) {
            console.error("Delete failed:", error);
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
            if (response.ok) await fetchFiles();
        } catch (error) {
            console.error("Toggle failed:", error);
        }
    };

    const handleContinue = () => {
        const type = currentView === "resume" ? "resume" : "linkedin";
        const isSelected = type === "resume" ? isResumeSelected : isLinkedInSelected;

        if (!isSelected) {
            setSourceWarningType(type as "resume" | "linkedin");
            setShowSourceWarning(true);
        } else {
            updateNavigation("menu");
        }
    };

    const handleManualSave = async () => {
        // --- Validation Logic ---
        const errors: string[] = [];

        // 1. Contact Validation
        if (!isContentFromFiles) {
            if (!contact.full_name.trim()) errors.push("Full Name is required in Contact Info");
            if (!contact.email.trim()) errors.push("Email is required in Contact Info");
            if (!contact.phone.trim()) errors.push("Phone Number is required in Contact Info");
            if (!contact.linkedin_url.trim()) errors.push("LinkedIn URL is required in Contact Info");
        }

        // 2. Education Validation
        if (!isContentFromFiles && education.length === 0) {
            errors.push("At least one Education entry is required");
        }
        education.forEach((edu, idx) => {
            const num = idx + 1;
            if (!edu.degree_type.trim()) errors.push(`Education #${num}: Degree Type is required`);
            if (!edu.institution_name.trim()) errors.push(`Education #${num}: Institution Name is required`);
            if (!edu.country.trim()) errors.push(`Education #${num}: Country is required`);
            if (!edu.state.trim()) errors.push(`Education #${num}: State is required`);
            if (!edu.city.trim()) errors.push(`Education #${num}: City is required`);
            if (!edu.start_date.trim()) errors.push(`Education #${num}: Start Date is required`);
            if (!edu.is_pursuing && !edu.end_date.trim()) errors.push(`Education #${num}: End Date is required`);
        });

        // 3. Experience Validation
        if (!isContentFromFiles && experience.length === 0) {
            errors.push("At least one Experience entry is required");
        }
        experience.forEach((exp, idx) => {
            const num = idx + 1;
            if (!exp.company_name.trim()) errors.push(`Experience #${num}: Company Name is required`);
            if (!exp.job_role.trim()) errors.push(`Experience #${num}: Job Role is required`);
            if (!exp.country.trim()) errors.push(`Experience #${num}: Country is required`);
            if (!exp.state.trim()) errors.push(`Experience #${num}: State is required`);
            if (!exp.city.trim()) errors.push(`Experience #${num}: City is required`);
            if (!exp.start_date.trim()) errors.push(`Experience #${num}: Start Date is required`);
            if (!exp.is_current && !exp.end_date.trim()) errors.push(`Experience #${num}: End Date is required`);
            if (!exp.job_description.trim()) errors.push(`Experience #${num}: Description is required`);
        });

        // 4. Projects Validation
        if (!isContentFromFiles && projects.length === 0) {
            errors.push("At least one Project entry is required");
        }
        projects.forEach((proj, idx) => {
            const num = idx + 1;
            if (!proj.name.trim()) errors.push(`Project #${num}: Project Name is required`);
            if (!proj.description.trim()) errors.push(`Project #${num}: Description is required`);
            if (!proj.technologies.trim()) errors.push(`Project #${num}: Technologies are required`);
        });

        // 5. Achievements Validation
        if (!isContentFromFiles && achievements.length === 0) {
            errors.push("At least one Achievement entry is required");
        }
        achievements.forEach((ach, idx) => {
            const num = idx + 1;
            if (!ach.title.trim()) errors.push(`Achievement #${num}: Title is required`);
            if (!ach.description.trim()) errors.push(`Achievement #${num}: Description is required`);
        });

        // 6. Summary & Skills (Optional check, but usually good to have if user entered that tab)
        if (!isContentFromFiles) {
            if (!summary.text.trim()) errors.push("Professional Summary is required");
            if (!skills.skills.trim()) errors.push("Technical Skills are required");
        }

        if (errors.length > 0) {
            setShowErrors(true);
            setToast({ message: errors[0], type: "error" });

            // Jump to the tab with the first error
            const firstError = errors[0].toLowerCase();
            if (firstError.includes("contact")) setActiveTab("contact");
            else if (firstError.includes("education")) setActiveTab("education");
            else if (firstError.includes("experience")) setActiveTab("experience");
            else if (firstError.includes("project")) setActiveTab("projects");
            else if (firstError.includes("achievement")) setActiveTab("achievements");
            else if (firstError.includes("summary")) setActiveTab("summary");
            else if (firstError.includes("skills")) setActiveTab("skills");

            return;
        }

        setShowErrors(false);
        setIsSaving(true);
        // We'll use a simple "save all" approach for simplicity in this flow
        const sectionsData = [
            { section_type: "contact", content: contact },
            { section_type: "summary", content: summary },
            { section_type: "skills", content: skills },
            { section_type: "education", content: education.filter(e => e.institution_name.trim()) },
            { section_type: "experience", content: experience.filter(e => e.company_name.trim()) },
            { section_type: "projects", content: projects.filter(e => e.name.trim()) },
            { section_type: "achievements", content: achievements.filter(e => e.title.trim()) },
        ];

        try {
            await Promise.all(
                sectionsData.map(section =>
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
            setToast({ message: "Information saved!", type: "success" });
            setHasSavedManual(true);
            updateNavigation("menu");
        } catch {
            setToast({ message: "Save failed", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const triggerExtraction = async () => {
        setIsExtracting(true);
        setProcessingStep("Initializing AI agents...");
        try {
            if (isResumeSelected) {
                setProcessingStep("Extracting Resume data...");
                await new Promise(r => setTimeout(r, 600));
            }
            if (isLinkedInSelected) {
                setProcessingStep("Processing LinkedIn profile...");
                await new Promise(r => setTimeout(r, 600));
            }
            if (hasSavedManual) {
                setProcessingStep("Merging manual entries...");
                await new Promise(r => setTimeout(r, 600));
            }
            setProcessingStep("Analyzing and normalizing content...");

            const response = await fetch(`${API_BASE_URL}/api/ingestion/extract/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                setProcessingStep("✅ Content ready! Redirecting...");
                await new Promise(r => setTimeout(r, 500));
                router.push("/profile/normalize");
            } else {
                setToast({ message: "Processing failed", type: "error" });
                setIsExtracting(false);
            }
        } catch {
            setToast({ message: "Network error", type: "error" });
            setIsExtracting(false);
        }
    };

    // --- Dynamic Entry Handlers ---
    const addEducation = () => setEducation([...education, createEmptyEducation()]);
    const removeEducation = (id: string) => setEducation(education.filter(e => e.id !== id));
    const updateEducation = (id: string, field: keyof EducationEntry, value: any) => {
        setEducation(education.map(e => (e.id === id ? { ...e, [field]: value } : e)));
    };

    const addExperience = () => setExperience([...experience, createEmptyExperience()]);
    const removeExperience = (id: string) => setExperience(experience.filter(e => e.id !== id));
    const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
        setExperience(experience.map(e => (e.id === id ? { ...e, [field]: value } : e)));
    };

    const addProject = () => setProjects([...projects, createEmptyProject()]);
    const removeProject = (id: string) => setProjects(projects.filter(p => p.id !== id));
    const updateProject = (id: string, field: keyof ProjectEntry, value: any) => {
        setProjects(projects.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    };

    const addAchievement = () => setAchievements([...achievements, createEmptyAchievement()]);
    const removeAchievement = (id: string) => setAchievements(achievements.filter(a => a.id !== id));
    const updateAchievement = (id: string, field: keyof AchievementEntry, value: any) => {
        setAchievements(achievements.map(a => (a.id === id ? { ...a, [field]: value } : a)));
    };

    // --- Render Functions ---

    const renderMenuView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-4xl w-full text-center mb-8">
                <h3 className="text-2xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    Build Your <span className="text-primary italic">Professional</span> Profile
                </h3>
                <p className="text-lg text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
                    Choose an import method to begin. For best results with our AI, we recommend providing both a resume and LinkedIn profile.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-10">
                {/* Resume Card */}
                <button
                    onClick={() => updateNavigation("resume")}
                    className="glass-card p-8 flex flex-col items-center text-center transition-all hover:scale-[1.03] active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isResumeSelected && (
                        <div className="absolute top-4 right-4 animate-in zoom-in">
                            <IconCheck />
                        </div>
                    )}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-3">
                        <span className="text-primary group-hover:scale-110 transition-transform">
                            <IconResume />
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Upload Resume</h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed font-medium">
                        Import your existing PDF resume to extract your history.
                    </p>
                </button>

                {/* LinkedIn Card */}
                <button
                    onClick={() => updateNavigation("linkedin")}
                    className="glass-card p-8 flex flex-col items-center text-center transition-all hover:scale-[1.03] active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isLinkedInSelected && (
                        <div className="absolute top-4 right-4 animate-in zoom-in">
                            <IconCheck />
                        </div>
                    )}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:-rotate-3">
                        <span className="text-primary group-hover:scale-110 transition-transform">
                            <IconLinkedIn />
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">LinkedIn Profile</h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed font-medium">
                        Upload your LinkedIn PDF to add detailed professional details.
                    </p>
                </button>

                {/* Manual Card */}
                <button
                    onClick={() => updateNavigation("manual")}
                    className="glass-card p-8 flex flex-col items-center text-center transition-all hover:scale-[1.03] active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {hasSavedManual && (
                        <div className="absolute top-4 right-4 animate-in zoom-in">
                            <IconCheck />
                        </div>
                    )}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-3">
                        <span className="text-primary group-hover:scale-110 transition-transform">
                            <IconManual />
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Manual Entry</h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed font-medium">
                        Enter or refine your details manually for maximum ATS accuracy.
                    </p>
                </button>
            </div>

            <div className="flex flex-col items-center gap-5">
                <div>
                    {!hasAnyData ? (
                        <div className="flex items-center gap-3 text-foreground-secondary bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-sm leading-none">
                            <span className="animate-pulse text-sm">⚠️</span>
                            <span className="text-[10px] md:text-xs font-bold tracking-wide uppercase">Add at least one source to continue</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-green-600 bg-green-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/10 shadow-sm animate-in zoom-in leading-none">
                            <span className="text-sm">✨</span>
                            <span className="text-[10px] md:text-xs font-bold tracking-wide uppercase">Ready to create your profile!</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={triggerExtraction}
                    disabled={!hasAnyData || isExtracting}
                    className={`btn-primary px-10 py-3.5 rounded-full text-base font-bold shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all duration-500 ${!hasAnyData || isExtracting ? "opacity-30 grayscale cursor-not-allowed scale-95" : "hover:scale-[1.05] active:scale-95"
                        }`}
                >
                    {isExtracting ? (
                        <>
                            <span className="animate-spin text-lg">⏳</span>
                            <span>Creating Profile...</span>
                        </>
                    ) : (
                        <>
                            <IconSparkles />
                            <span>Create Professional Profile</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    const renderResumeView = () => (
        <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => updateNavigation("menu")} className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors group">
                    <IconBack />
                    <span>Back to Menu</span>
                </button>
                <button onClick={() => handleContinue()} className="btn-primary px-8 py-2 text-sm shadow-sm">Continue</button>
            </div>


            <div className="glass-card p-6 md:p-8 mb-4">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Upload Your Resume</h2>
                        <p className="text-foreground-secondary">
                            PDF files are supported. We&apos;ll extract your experience automatically.
                        </p>
                    </div>
                    <div className="p-5 bg-primary/10 rounded-2xl text-primary">
                        <IconResume />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="p-3 bg-background-secondary/50 rounded-xl border border-border">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary mb-2">Recent Uploads</h4>
                            {resumes.length === 0 ? (
                                <p className="text-sm text-foreground-secondary italic">No resumes uploaded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {resumes.map(file => (
                                        <div
                                            key={file.id}
                                            className={`p-3 rounded-lg border transition-all flex items-center justify-between group cursor-pointer ${file.is_selected ? "bg-primary/5 border-primary/30" : "bg-background/50 border-border"
                                                }`}
                                            onClick={() => handleToggleSelect("resume", file.id, file.is_selected)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${file.is_selected ? "bg-primary border-primary" : "border-border"}`}>
                                                    {file.is_selected && <span className="text-[10px] text-white">✓</span>}
                                                </div>
                                                <span className="text-sm font-medium truncate max-w-[200px]">{file.file_name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveFile("resume", file.id); }}
                                                className="text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove file"
                                            >
                                                <IconTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                            <p className="text-[10px] text-foreground-secondary flex items-center gap-2">
                                <span className="text-primary scale-75"><IconInfo /></span>
                                <span>Upload Limit: {uploadLimits.lifetime_resume_uploads}/{uploadLimits.max_resumes} lifetime files.</span>
                            </p>
                        </div>
                    </div>

                    <div className="relative group h-full">
                        <label className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative flex flex-col items-center justify-center h-full ${uploadStatus.resume === "uploading" || isResumeSelected || !uploadLimits.can_upload_resume
                            ? "border-border bg-background-secondary/30 cursor-not-allowed opacity-60"
                            : "border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5 group"
                            }`}>
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                className="hidden"
                                onChange={handleResumeUpload}
                                disabled={uploadStatus.resume === "uploading" || isResumeSelected || !uploadLimits.can_upload_resume}
                            />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${uploadStatus.resume === "uploading" || isResumeSelected || !uploadLimits.can_upload_resume
                                ? "bg-foreground-secondary/10 text-foreground-secondary"
                                : "bg-primary/10 text-primary group-hover:scale-110"
                                }`}>
                                <IconUpload />
                            </div>
                            <span className="text-lg font-bold text-foreground mb-1">
                                {uploadStatus.resume === "uploading" ? "Uploading..." : "Click to Upload"}
                            </span>
                            <span className="text-sm text-foreground-secondary">
                                {isResumeSelected
                                    ? "Deselect current file to upload new"
                                    : !uploadLimits.can_upload_resume
                                        ? "Lifetime upload limit reached"
                                        : "or drag and drop resume here"
                                }
                            </span>
                        </label>

                        {(isResumeSelected || !uploadLimits.can_upload_resume) && (
                            <div className="absolute top-4 right-4 animate-in zoom-in">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                                    <IconInfo />
                                    {isResumeSelected ? "Source Selected" : "Limit Reached"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );

    const renderLinkedInView = () => (
        <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => updateNavigation("menu")} className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors group">
                    <IconBack />
                    <span>Back to Menu</span>
                </button>
                <button onClick={() => handleContinue()} className="btn-primary px-8 py-2 text-sm shadow-sm">Continue</button>
            </div>


            <div className="glass-card p-6 md:p-8 mb-4">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Import LinkedIn Data</h2>
                        <p className="text-foreground-secondary">
                            Export your profile from LinkedIn as PDF and upload it here.
                        </p>
                    </div>
                    <div className="p-5 bg-primary/10 rounded-2xl text-primary">
                        <IconLinkedIn />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        <div className="p-3 bg-background-secondary/50 rounded-xl border border-border">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary mb-2">Uploaded Profiles</h4>
                            {linkedinFiles.length === 0 ? (
                                <p className="text-sm text-foreground-secondary italic">No LinkedIn profiles uploaded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedinFiles.map(file => (
                                        <div
                                            key={file.id}
                                            className={`p-3 rounded-lg border transition-all flex items-center justify-between group cursor-pointer ${file.is_selected ? "bg-primary/5 border-primary/30" : "bg-background/50 border-border"
                                                }`}
                                            onClick={() => handleToggleSelect("linkedin", file.id, file.is_selected)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${file.is_selected ? "bg-primary border-primary" : "border-border"}`}>
                                                    {file.is_selected && <span className="text-[10px] text-white">✓</span>}
                                                </div>
                                                <span className="text-sm font-medium truncate max-w-[200px]">{file.file_name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveFile("linkedin", file.id); }}
                                                className="text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove file"
                                            >
                                                <IconTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                            <p className="text-[10px] text-foreground-secondary flex items-center gap-2">
                                <span className="text-primary scale-75"><IconInfo /></span>
                                <span>Upload Limit: {uploadLimits.lifetime_linkedin_uploads}/{uploadLimits.max_linkedin} lifetime files.</span>
                            </p>
                        </div>

                        <div className="bg-background-secondary/50 p-3 rounded-xl border border-border">
                            <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-2 text-primary">
                                <IconInfo />
                                <span>How to get your LinkedIn PDF?</span>
                            </h4>
                            <ul className="space-y-2 text-[11px] text-foreground-secondary">
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">1.</span>
                                    <span>Go to your LinkedIn Profile page.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">2.</span>
                                    <span>Click the <strong>&quot;More&quot;</strong> button in the top section.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary font-bold">3.</span>
                                    <span>Select <strong>&quot;Save to PDF&quot;</strong> from the dropdown.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="relative group h-full">
                        <label className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative flex flex-col items-center justify-center h-full ${uploadStatus.linkedin === "uploading" || isLinkedInSelected || !uploadLimits.can_upload_linkedin
                            ? "border-border bg-background-secondary/30 cursor-not-allowed opacity-60"
                            : "border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5 group"
                            }`}>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleLinkedInUpload}
                                disabled={uploadStatus.linkedin === "uploading" || isLinkedInSelected || !uploadLimits.can_upload_linkedin}
                            />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${uploadStatus.linkedin === "uploading" || isLinkedInSelected || !uploadLimits.can_upload_linkedin
                                ? "bg-foreground-secondary/10 text-foreground-secondary"
                                : "bg-primary/10 text-primary group-hover:scale-110"
                                }`}>
                                <IconUpload />
                            </div>
                            <span className="text-lg font-bold text-foreground mb-1">
                                {uploadStatus.linkedin === "uploading" ? "Uploading..." : "Upload LinkedIn PDF"}
                            </span>
                            <span className="text-sm text-foreground-secondary">
                                {isLinkedInSelected
                                    ? "Deselect current file to upload new"
                                    : !uploadLimits.can_upload_linkedin
                                        ? "Lifetime upload limit reached"
                                        : "or drag and drop file here"
                                }
                            </span>
                        </label>

                        {(isLinkedInSelected || !uploadLimits.can_upload_linkedin) && (
                            <div className="absolute top-4 right-4 animate-in zoom-in">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                                    <IconInfo />
                                    {isLinkedInSelected ? "Source Selected" : "Limit Reached"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderManualView = () => (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 h-full max-w-[1400px] mx-auto w-full p-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => updateNavigation("menu")} className="flex items-center gap-2 text-foreground-secondary hover:text-primary transition-colors group">
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                    <span>Back to Menu</span>
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleManualSave}
                        disabled={isSaving}
                        className="btn-primary px-8 py-2.5 flex items-center gap-3 shadow-lg shadow-primary/20"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin text-lg">⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <IconSparkles />
                                <span>Save All Content</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                {/* Manual Refinement Sidebar */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="glass-card p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider px-2 mb-4">Manual Entry Sections</h3>
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => updateNavigation(undefined, tab.key)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${activeTab === tab.key
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "hover:bg-background-secondary text-foreground-secondary hover:text-foreground"
                                        }`}
                                >
                                    <span className="text-lg transition-transform group-hover:scale-110">
                                        {tab.key === "contact" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        )}
                                        {tab.key === "summary" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
                                        )}
                                        {tab.key === "skills" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                        )}
                                        {tab.key === "education" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                        )}
                                        {tab.key === "experience" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                        )}
                                        {tab.key === "projects" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.62 5-2.5 5-2.5" /><path d="M12 15v5s3.03-.55 4.5-2c1.62-1.62 2.5-5 2.5-5" /></svg>
                                        )}
                                        {tab.key === "achievements" && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.45.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                        )}
                                    </span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Form Content */}
                <div className="flex-1 glass-card p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-3xl">
                        {activeTab === "contact" && (
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-foreground">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Full Name {isContentFromFiles && "(Optional)"}</label>
                                        <input type="text" className={`input-field ${showErrors && !isContentFromFiles && !contact.full_name.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="John Doe" value={contact.full_name} onChange={e => setContact({ ...contact, full_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Email Address {isContentFromFiles && "(Optional)"}</label>
                                        <input type="email" className={`input-field ${showErrors && !isContentFromFiles && !contact.email.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="john@example.com" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Phone Number {isContentFromFiles && "(Optional)"}</label>
                                        <PhoneInput value={contact.phone} onChange={val => setContact({ ...contact, phone: val })} error={showErrors && !isContentFromFiles && !contact.phone.trim()} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Location (Optional)</label>
                                        <input type="text" className="input-field" placeholder="City, Country" value={contact.location} onChange={e => setContact({ ...contact, location: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground-secondary mb-2">LinkedIn URL {isContentFromFiles && "(Optional)"}</label>
                                        <input type="url" className={`input-field ${showErrors && !isContentFromFiles && !contact.linkedin_url.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="https://linkedin.com/in/..." value={contact.linkedin_url} onChange={e => setContact({ ...contact, linkedin_url: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "summary" && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">Professional Summary {isContentFromFiles && "(Optional)"}</h3>
                                <textarea className={`input-field min-h-[300px] leading-relaxed ${showErrors && !isContentFromFiles && !summary.text.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="Tell us about your professional journey..." value={summary.text} onChange={e => setSummary({ text: e.target.value })} />
                                <p className="text-sm text-foreground-secondary italic">Keep it concise and focus on your greatest strengths.</p>
                            </div>
                        )}

                        {activeTab === "skills" && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">Technical Skills {isContentFromFiles && "(Optional)"}</h3>
                                <textarea className={`input-field min-h-[200px] ${showErrors && !isContentFromFiles && !skills.skills.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="React, Node.js, Python, AWS..." value={skills.skills} onChange={e => setSkills({ skills: e.target.value })} />
                                <p className="text-sm text-foreground-secondary">Separate skills with commas for best recognition.</p>
                            </div>
                        )}

                        {activeTab === "education" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-foreground">Education</h3>
                                    <button onClick={addEducation} className="btn-secondary py-2 text-primary font-bold flex items-center gap-2">
                                        <IconPlus />
                                        <span>Add</span>
                                    </button>
                                </div>
                                {education.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-background-secondary/20 rounded-2xl border border-dashed border-border">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                            <IconEducation />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">No education entries yet</h4>
                                        <p className="text-sm text-foreground-secondary text-center max-w-xs">
                                            Click the <strong>Add</strong> button above to include your degrees or certifications.
                                        </p>
                                    </div>
                                ) : (
                                    education.map((edu, idx) => (
                                        <div key={edu.id} className="p-6 border border-border rounded-2xl bg-background-secondary/30 relative group">
                                            <button
                                                onClick={() => removeEducation(edu.id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove entry"
                                            >
                                                <IconTrash />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium mb-1 block">Degree Type</label>
                                                    <input className={`input-field ${showErrors && !edu.degree_type.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="Bachelor of Technology" value={edu.degree_type} onChange={e => updateEducation(edu.id, "degree_type", e.target.value)} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium mb-1 block">Institution Name</label>
                                                    {/* <input className={`input-field ${showErrors && !edu.institution_name.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="Charotar University of Science and Technology, Gujarat" value={edu.institution_name} onChange={e => updateEducation(edu.id, "institution_name", e.target.value)} /> */}
                                                    <InstitutionSelector
                                                        value={edu.institution_name}
                                                        onChange={(val) => updateEducation(edu.id, "institution_name", val)}
                                                        country={edu.country} // Pass selected country for better filtering
                                                        showErrors={showErrors}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <LocationSelector country={edu.country} state={edu.state} city={edu.city}
                                                        onCountryChange={(v, iso) => { updateEducation(edu.id, "country", v); updateEducation(edu.id, "country_iso", iso); }}
                                                        onStateChange={(v, iso) => { updateEducation(edu.id, "state", v); updateEducation(edu.id, "state_iso", iso); }}
                                                        onCityChange={(v) => updateEducation(edu.id, "city", v)}
                                                        showErrors={showErrors}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                                                    <DateInput value={edu.start_date} onChange={v => updateEducation(edu.id, "start_date", v)} error={showErrors && !edu.start_date.trim()} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">End Date</label>
                                                    <DateInput value={edu.end_date} onChange={v => updateEducation(edu.id, "end_date", v)} disabled={edu.is_pursuing} error={showErrors && !edu.is_pursuing && !edu.end_date.trim()} />
                                                    <label className="mt-2 flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={edu.is_pursuing} onChange={e => updateEducation(edu.id, "is_pursuing", e.target.checked)} />
                                                        <span className="text-xs">Currently Pursuing</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "experience" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-foreground">Work Experience</h3>
                                    <button onClick={addExperience} className="btn-secondary py-2 text-primary font-bold flex items-center gap-2">
                                        <IconPlus />
                                        <span>Add</span>
                                    </button>
                                </div>
                                {experience.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-background-secondary/20 rounded-2xl border border-dashed border-border">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                            <IconExperience />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">No work experience yet</h4>
                                        <p className="text-sm text-foreground-secondary text-center max-w-xs">
                                            Click the <strong>Add</strong> button above to include your professional roles.
                                        </p>
                                    </div>
                                ) : (
                                    experience.map((exp, idx) => (
                                        <div key={exp.id} className="p-6 border border-border rounded-2xl bg-background-secondary/30 relative group">
                                            <button
                                                onClick={() => removeExperience(exp.id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove entry"
                                            >
                                                <IconTrash />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Company Name</label>
                                                    <input className={`input-field ${showErrors && !exp.company_name.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={exp.company_name} onChange={e => updateExperience(exp.id, "company_name", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Job Role</label>
                                                    <input className={`input-field ${showErrors && !exp.job_role.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={exp.job_role} onChange={e => updateExperience(exp.id, "job_role", e.target.value)} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <LocationSelector country={exp.country} state={exp.state} city={exp.city}
                                                        onCountryChange={(v, iso) => { updateExperience(exp.id, "country", v); updateExperience(exp.id, "country_iso", iso); }}
                                                        onStateChange={(v, iso) => { updateExperience(exp.id, "state", v); updateExperience(exp.id, "state_iso", iso); }}
                                                        onCityChange={(v) => updateExperience(exp.id, "city", v)}
                                                        showErrors={showErrors}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Start Date</label>
                                                    <DateInput value={exp.start_date} onChange={v => updateExperience(exp.id, "start_date", v)} error={showErrors && !exp.start_date.trim()} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">End Date</label>
                                                    <DateInput value={exp.end_date} onChange={v => updateExperience(exp.id, "end_date", v)} disabled={exp.is_current} error={showErrors && !exp.is_current && !exp.end_date.trim()} />
                                                    <label className="mt-2 flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={exp.is_current} onChange={e => updateExperience(exp.id, "is_current", e.target.checked)} />
                                                        <span className="text-xs">Currently Working Here</span>
                                                    </label>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                                    <textarea className={`input-field min-h-[120px] ${showErrors && !exp.job_description.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={exp.job_description} onChange={e => updateExperience(exp.id, "job_description", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "projects" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-foreground">Featured Projects</h3>
                                    <button onClick={addProject} className="btn-secondary py-2 text-primary font-bold flex items-center gap-2">
                                        <IconPlus />
                                        <span>Add</span>
                                    </button>
                                </div>
                                {projects.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-background-secondary/20 rounded-2xl border border-dashed border-border">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                            <IconProjects />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">No projects added yet</h4>
                                        <p className="text-sm text-foreground-secondary text-center max-w-xs">
                                            Click the <strong>Add</strong> button above to showcase your best work and side projects.
                                        </p>
                                    </div>
                                ) : (
                                    projects.map((proj) => (
                                        <div key={proj.id} className="p-6 border border-border rounded-2xl bg-background-secondary/30 relative">
                                            <button
                                                onClick={() => removeProject(proj.id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove entry"
                                            >
                                                <IconTrash />
                                            </button>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Project Name</label>
                                                    <input className={`input-field ${showErrors && !proj.name.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={proj.name} onChange={e => updateProject(proj.id, "name", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                                    <textarea className={`input-field min-h-[100px] ${showErrors && !proj.description.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={proj.description} onChange={e => updateProject(proj.id, "description", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Technologies</label>
                                                    <input className={`input-field ${showErrors && !proj.technologies.trim() ? 'border-red-500 bg-red-500/5' : ''}`} placeholder="React, API, Firebase..." value={proj.technologies} onChange={e => updateProject(proj.id, "technologies", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "achievements" && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-foreground">Honors & Achievements</h3>
                                    <button onClick={addAchievement} className="btn-secondary py-2 text-primary font-bold flex items-center gap-2">
                                        <IconPlus />
                                        <span>Add</span>
                                    </button>
                                </div>
                                {achievements.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-background-secondary/20 rounded-2xl border border-dashed border-border">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                            <IconAchievements />
                                        </div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">No achievements added yet</h4>
                                        <p className="text-sm text-foreground-secondary text-center max-w-xs">
                                            Click the <strong>Add</strong> button above to list your awards, honors, and key milestones.
                                        </p>
                                    </div>
                                ) : (
                                    achievements.map((ach) => (
                                        <div key={ach.id} className="p-6 border border-border rounded-2xl bg-background-secondary/30 relative">
                                            <button
                                                onClick={() => removeAchievement(ach.id)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove entry"
                                            >
                                                <IconTrash />
                                            </button>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Achievement Title</label>
                                                    <input className={`input-field ${showErrors && !ach.title.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={ach.title} onChange={e => updateAchievement(ach.id, "title", e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                                    <textarea className={`input-field min-h-[80px] ${showErrors && !ach.description.trim() ? 'border-red-500 bg-red-500/5' : ''}`} value={ach.description} onChange={e => updateAchievement(ach.id, "description", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNudgeModal = () => {
        if (!showNudge) return null;

        // Logical "Smart Nudge" - only show sources NOT yet added
        const needsResume = resumes.length === 0;
        const needsLinkedIn = linkedinFiles.length === 0;
        const needsManual = !hasSavedManual;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="glass-card max-w-md w-full p-8 text-center shadow-2xl border-primary/20 scale-in-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <IconSparkles />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Great Start!</h3>
                    <p className="text-foreground-secondary mb-8 leading-relaxed">
                        You&apos;ve successfully imported <strong>{nudgeType === "resume" ? "your resume" : "LinkedIn data"}</strong>. To make your profile truly complete, would you like to add more?
                    </p>
                    <div className="flex flex-col gap-3">
                        {nudgeType === "resume" && needsLinkedIn && (
                            <button onClick={() => { setShowNudge(false); updateNavigation("linkedin"); }} className="btn-primary w-full py-4 font-bold">Import LinkedIn Profile</button>
                        )}
                        {nudgeType === "linkedin" && needsResume && (
                            <button onClick={() => { setShowNudge(false); updateNavigation("resume"); }} className="btn-primary w-full py-4 font-bold">Upload Resume</button>
                        )}
                        {needsManual && (
                            <button onClick={() => { setShowNudge(false); updateNavigation("manual"); }} className="btn-secondary w-full py-4 font-bold border-primary/20 text-primary">Manual Refinement</button>
                        )}
                        <button onClick={() => setShowNudge(false)} className="bg-transparent hover:bg-white/5 text-foreground-secondary py-3 text-sm font-medium transition-colors">Skip for now</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSourceWarning = () => {
        if (!showSourceWarning) return null;

        const isResume = sourceWarningType === "resume";

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="glass-card max-w-md w-full p-8 text-center shadow-2xl border-primary/20 scale-in-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <IconInfo />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                        No {isResume ? "Resume" : "LinkedIn"} Selected
                    </h3>
                    <p className="text-foreground-secondary mb-8 leading-relaxed">
                        You haven&apos;t selected a {isResume ? "resume" : "LinkedIn profile"}. Without it, our AI won&apos;t be able to auto-fill your details.
                        <strong> Are you sure you want to proceed to manual entry?</strong>
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowSourceWarning(false)}
                            className="btn-primary w-full py-4 font-bold"
                        >
                            Go Back & Select {isResume ? "Resume" : "LinkedIn"}
                        </button>
                        <button
                            onClick={() => { setShowSourceWarning(false); updateNavigation("menu"); }}
                            className="btn-secondary w-full py-4 font-bold border-primary/20 text-primary"
                        >
                            Yes, I&apos;ll Entry Manually
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Return ---

    if (isLoading || isInitialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="animate-pulse text-foreground-secondary font-medium tracking-wide">Loading Resumify Profile Creator...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen flex flex-col selection:bg-primary/20">
            {/* Processing Overlay */}
            {isExtracting && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl">
                    <div className="glass-card p-10 max-w-md w-full mx-4 text-center shadow-2xl border-white/10">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center animate-pulse text-primary">
                                    <IconSparkles />
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-28 h-28 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">Crafting Your Profile</h2>
                        <div className="text-lg text-primary font-medium mb-6 min-h-[28px] animate-pulse">{processingStep}</div>

                        <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-primary/40 animate-shimmer rounded-full" style={{ width: '100%', backgroundSize: '200% 100%' }} />
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed italic">
                            &quot;Our AI is meticulously organizing your history for maximum ATS performance.&quot;
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/50 backdrop-blur-md">
                <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center max-w-[1400px]">
                    <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
                        <div className="relative">
                            <Image src="/logo.png" alt="Resumify" width={32} height={32} className="rounded-lg transition-transform group-hover:scale-110 md:w-10 md:h-10" />
                            <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Resumify</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* Content Views */}
            <main className="flex-1 flex flex-col relative">
                <div className="absolute inset-0 bg-radial-at-t from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />

                {currentView === "menu" && renderMenuView()}
                {currentView === "resume" && renderResumeView()}
                {currentView === "linkedin" && renderLinkedInView()}
                {currentView === "manual" && renderManualView()}
            </main>

            {/* Smart Nudge Modal */}
            {renderNudgeModal()}
            {renderSourceWarning()}

            {/* Global Toast */}
            {toast.type && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-bottom-5">
                    <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${toast.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-sm font-semibold">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

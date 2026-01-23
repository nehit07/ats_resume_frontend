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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    const { user, isAuthenticated, isLoading, accessToken, refreshProfileStatus } = useAuth();

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [currentView, setCurrentView] = useState<"menu" | "resume" | "linkedin" | "manual">(
        (searchParams.get("view") as any) || "menu"
    );
    const [activeTab, setActiveTab] = useState<SectionType>(
        (searchParams.get("tab") as SectionType) || "contact"
    );


    // Track previous view for selection management
    const previousView = useRef<string | null>(null);
    const isInternalNavigation = useRef(false);

    // Sync state with URL changes (handle back/forward)
    useEffect(() => {
        const urlView = searchParams.get("view") as any;
        const urlTab = searchParams.get("tab") as SectionType;

        if (urlView && urlView !== currentView) setCurrentView(urlView);
        if (urlTab && urlTab !== activeTab) setActiveTab(urlTab);
        if (!urlView && currentView !== "menu") setCurrentView("menu");

        // Track view changes for selection management
        previousView.current = currentView;
    }, [searchParams]);

    // Clear selections when entering menu from external navigation (not from resume/linkedin views)
    useEffect(() => {
        // Only run when view changes to menu
        if (currentView === "menu" && previousView.current !== null) {
            // If coming from internal navigation (resume/linkedin subviews), keep selections
            if (isInternalNavigation.current) {
                isInternalNavigation.current = false;
                return;
            }

            // Coming from external navigation (main screen, other pages) - clear selections
            // Reset skip states for fresh flow
            setSkippedLinkedIn(false);
            setSkippedResume(false);
            setSkippedManual(false);
            setShowPopup("none");
        }
    }, [currentView]);

    // Override updateNavigation to track internal navigation
    const updateNavigation = (view?: string, tab?: string) => {
        isInternalNavigation.current = true;
        const params = new URLSearchParams(searchParams.toString());
        if (view) params.set("view", view);
        if (tab) params.set("tab", tab);
        router.push(`${pathname}?${params.toString()}`);
    };

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
    const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; type: "resume" | "linkedin" | null; id: string | null; fileName: string }>({ show: false, type: null, id: null, fileName: "" });

    // Duplicate File Handling
    const [duplicateWarning, setDuplicateWarning] = useState<{
        show: boolean;
        type: "resume" | "linkedin" | null;
        file: File | null;
        existingId: string | null;
        fileName: string;
    }>({ show: false, type: null, file: null, existingId: null, fileName: "" });

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

    // Frontend-controlled file selection (no backend persistence)
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [selectedLinkedInId, setSelectedLinkedInId] = useState<string | null>(null);

    // Processing job state for real-time updates
    const [processingJob, setProcessingJob] = useState<{
        step: number;
        message: string;
        progress: number;
        status: string;
    } | null>(null);

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

    // Manual data status - derived from actual data presence (no API persistence)
    const hasManualData =
        Object.values(contact).some(v => !!v) ||
        !!summary.text ||
        !!skills.skills ||
        education.length > 0 ||
        experience.length > 0 ||
        projects.length > 0 ||
        achievements.length > 0;

    // Progressive popup flow state
    const [showPopup, setShowPopup] = useState<"none" | "other-source" | "manual" | "confirm">("none");
    const [skippedLinkedIn, setSkippedLinkedIn] = useState(false);
    const [skippedResume, setSkippedResume] = useState(false);
    const [skippedManual, setSkippedManual] = useState(false);
    const [popupStep, setPopupStep] = useState(1);
    const [totalPopupSteps, setTotalPopupSteps] = useState(3);

    // Derived states (using frontend-controlled selection)
    const isResumeSelected = selectedResumeId !== null;
    const isLinkedInSelected = selectedLinkedInId !== null;
    const isContentFromFiles = isResumeSelected || isLinkedInSelected;
    const hasAnyData = isResumeSelected || isLinkedInSelected || hasManualData;

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

                        // Note: hasManualData is now derived from state, no need to track separately
                    }

                    await fetchFiles();
                }
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

    // Clear selections on initial page load (reset frontend state)
    useEffect(() => {
        if (!isAuthenticated || !accessToken || isInitialLoading) return;

        // Check if we should preserve selections (coming from popup flow)
        const preserveSelections = sessionStorage.getItem("preserveSelections");
        if (preserveSelections === "true") {
            sessionStorage.removeItem("preserveSelections");
            // Restore selections from sessionStorage if available
            const savedResumeId = sessionStorage.getItem("selectedResumeId");
            const savedLinkedInId = sessionStorage.getItem("selectedLinkedInId");
            if (savedResumeId) setSelectedResumeId(savedResumeId);
            if (savedLinkedInId) setSelectedLinkedInId(savedLinkedInId);
            return;
        }

        // Clear selections on fresh page load
        setSelectedResumeId(null);
        setSelectedLinkedInId(null);
    }, [isInitialLoading, isAuthenticated, accessToken]);

    const uploadFile = async (type: "resume" | "linkedin", file: File, replace: boolean = false) => {
        if (type === "resume" && !uploadLimits.can_upload_resume && !replace) {
            setToast({ message: "Upload limit reached", type: "error" });
            return;
        }
        if (type === "linkedin" && !uploadLimits.can_upload_linkedin && !replace) {
            setToast({ message: "Upload limit reached", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setUploadStatus(prev => ({ ...prev, [type]: "uploading" }));

        const endpoint = type === "resume" ? "resume/" : "linkedin/";
        const url = `${API_BASE_URL}/api/ingestion/${endpoint}${replace ? "?replace=true" : ""}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (response.status === 409) {
                // Handle Duplicate
                const data = await response.json();
                setUploadStatus(prev => ({ ...prev, [type]: "idle" })); // Reset status to allow retry
                setDuplicateWarning({
                    show: true,
                    type,
                    file,
                    existingId: data.file_id,
                    fileName: file.name
                });
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUploadStatus(prev => ({ ...prev, [type]: "success" }));
                setToast({ message: `${type === "resume" ? "Resume" : "LinkedIn profile"} uploaded!`, type: "success" });
                await fetchFiles();

                // Auto-select the newly uploaded file
                if (data.data && data.data.id) {
                    if (type === "resume") setSelectedResumeId(data.data.id);
                    else setSelectedLinkedInId(data.data.id);
                }

                // setNudgeType(type); // Removing Nudge as per user request
                // setShowNudge(true); 
            } else {
                setToast({ message: "Upload failed", type: "error" });
                setUploadStatus(prev => ({ ...prev, [type]: "error" }));
            }
        } catch {
            setToast({ message: "Network error", type: "error" });
            setUploadStatus(prev => ({ ...prev, [type]: "error" }));
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile("resume", file);
    };

    const handleLinkedInUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile("linkedin", file);
    };

    const handleDuplicateReplace = async () => {
        if (duplicateWarning.file && duplicateWarning.type) {
            setDuplicateWarning(prev => ({ ...prev, show: false }));
            await uploadFile(duplicateWarning.type, duplicateWarning.file, true);
        }
    };

    const handleDuplicateUseExisting = () => {
        if (duplicateWarning.type && duplicateWarning.existingId) {
            if (duplicateWarning.type === "resume") setSelectedResumeId(duplicateWarning.existingId);
            else setSelectedLinkedInId(duplicateWarning.existingId);

            setToast({ message: "Existing file selected", type: "success" });
            setDuplicateWarning({ show: false, type: null, file: null, existingId: null, fileName: "" });
        }
    };

    const handleRemoveFile = async (type: "resume" | "linkedin", id: string, fileName: string) => {
        setConfirmDialog({ show: true, type, id, fileName });
    };

    const confirmDeleteFile = async () => {
        if (!confirmDialog.type || !confirmDialog.id) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingestion/files/${confirmDialog.type}/${confirmDialog.id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.ok) {
                setToast({ message: "File deleted successfully", type: "success" });
                await fetchFiles();
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setToast({ message: "Failed to delete file", type: "error" });
        }
        setConfirmDialog({ show: false, type: null, id: null, fileName: "" });
    };

    // Local file selection (no API call - frontend-controlled)
    const handleSelectFile = (type: "resume" | "linkedin", id: string) => {
        if (type === "resume") {
            // Toggle: if already selected, deselect; otherwise select this one
            setSelectedResumeId(prev => prev === id ? null : id);
        } else {
            setSelectedLinkedInId(prev => prev === id ? null : id);
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

        // Store manual data in sessionStorage (no backend API call)
        const manualData = {
            contact,
            summary,
            skills,
            education: education.filter(e => e.institution_name.trim()),
            experience: experience.filter(e => e.company_name.trim()),
            projects: projects.filter(e => e.name.trim()),
            achievements: achievements.filter(e => e.title.trim()),
        };

        sessionStorage.setItem("manualData", JSON.stringify(manualData));
        sessionStorage.setItem("hasManualData", "true");

        setToast({ message: "Information saved!", type: "success" });
        updateNavigation("menu");
    };

    const triggerExtraction = async () => {
        setIsExtracting(true);
        setProcessingJob({
            step: 0,
            message: "Initializing AI agents...",
            progress: 0,
            status: "pending"
        });

        try {
            // Save manual data if present
            if (hasManualData) {
                const manualData = {
                    contact,
                    summary,
                    skills,
                    education: education.filter(e => e.institution_name.trim()),
                    experience: experience.filter(e => e.company_name.trim()),
                    projects: projects.filter(e => e.name.trim()),
                    achievements: achievements.filter(e => e.title.trim()),
                };
                sessionStorage.setItem("manualData", JSON.stringify(manualData));
                sessionStorage.setItem("hasManualData", "true");
            }

            // Save selected IDs to sessionStorage for fallback/direct access
            if (selectedResumeId) sessionStorage.setItem("selectedResumeId", selectedResumeId);
            if (selectedLinkedInId) sessionStorage.setItem("selectedLinkedInId", selectedLinkedInId);

            // 1. Start the Celery job
            const response = await fetch(`${API_BASE_URL}/api/ingestion/generate-profile/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resume_id: selectedResumeId,
                    linkedin_id: selectedLinkedInId,
                    manual_data: hasManualData ? JSON.parse(sessionStorage.getItem("manualData") || "{}") : null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to start profile generation");
            }

            const { job_id } = await response.json();

            // 2. Poll for status
            const pollStatus = async () => {
                try {
                    const statusRes = await fetch(
                        `${API_BASE_URL}/api/ingestion/task-status/${job_id}/`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        }
                    );

                    if (!statusRes.ok) throw new Error("Status check failed");

                    const statusData = await statusRes.json();

                    setProcessingJob({
                        step: statusData.current_step,
                        message: statusData.message,
                        progress: statusData.progress,
                        status: statusData.status
                    });

                    if (statusData.status === "completed") {
                        setProcessingJob(prev => prev ? { ...prev, message: "✅ Content ready! Redirecting..." } : null);
                        await new Promise(r => setTimeout(r, 800));
                        await refreshProfileStatus();
                        router.push("/profile/edit");
                    } else if (statusData.status === "failed") {
                        setToast({ message: "Processing failed. Please try again.", type: "error" });
                        setIsExtracting(false);
                    } else {
                        // Continue polling
                        setTimeout(pollStatus, 1500);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    // Silent retry logic
                    setTimeout(pollStatus, 3000);
                }
            };

            pollStatus();

        } catch (error: any) {
            setToast({ message: error.message || "Network error", type: "error" });
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

    // --- Progressive Popup Flow Handlers ---
    const handleStartFlow = () => {
        // Calculate total steps needed
        let steps = 1; // Confirmation is always shown
        const needsOtherSource = (isResumeSelected && !isLinkedInSelected && !skippedLinkedIn) ||
            (isLinkedInSelected && !isResumeSelected && !skippedResume);
        const needsManual = !hasManualData && !skippedManual;

        if (needsOtherSource) steps++;
        if (needsManual) steps++;

        setTotalPopupSteps(steps);
        setPopupStep(1);

        // Determine which popup to show first
        if (needsOtherSource) {
            setShowPopup("other-source");
        } else if (needsManual) {
            setShowPopup("manual");
        } else {
            setShowPopup("confirm");
        }
    };

    const moveToNextPopup = () => {
        setPopupStep(prev => prev + 1);

        if (showPopup === "other-source") {
            // After other-source popup, check if manual is needed
            if (!hasManualData && !skippedManual) {
                setShowPopup("manual");
            } else {
                setShowPopup("confirm");
            }
        } else if (showPopup === "manual") {
            setShowPopup("confirm");
        }
    };

    const handlePopupAction = (action: "add" | "skip") => {
        if (showPopup === "other-source") {
            if (action === "skip") {
                if (isResumeSelected && !isLinkedInSelected) {
                    setSkippedLinkedIn(true);
                } else {
                    setSkippedResume(true);
                }
                moveToNextPopup();
            } else {
                // Set flag to preserve selections when returning
                sessionStorage.setItem("preserveSelections", "true");
                // Navigate to the appropriate upload page
                setShowPopup("none");
                if (isResumeSelected && !isLinkedInSelected) {
                    updateNavigation("linkedin");
                } else {
                    updateNavigation("resume");
                }
            }
        } else if (showPopup === "manual") {
            if (action === "skip") {
                setSkippedManual(true);
                moveToNextPopup();
            } else {
                // Set flag to preserve selections when returning
                sessionStorage.setItem("preserveSelections", "true");
                setShowPopup("none");
                updateNavigation("manual");
            }
        }
    };

    const handleConfirmAndGenerate = () => {
        setShowPopup("none");
        triggerExtraction();
    };

    // Get popup content based on current state
    const getOtherSourcePopupContent = () => {
        if (isResumeSelected && !isLinkedInSelected) {
            return {
                title: "Boost your ATS accuracy 🚀",
                benefits: [
                    "Fill missing skills",
                    "Improve keyword matching",
                    "Reduce AI assumptions"
                ],
                primaryBtn: "Add LinkedIn",
                icon: <IconLinkedIn />
            };
        }
        return {
            title: "Want a stronger resume? 📄",
            benefits: [
                "Preserve your exact wording",
                "Capture achievements & metrics",
                "Improve recruiter readability"
            ],
            primaryBtn: "Upload Resume",
            icon: <IconResume />
        };
    };

    // --- Render Functions ---

    const renderMenuView = () => (
        <div className="flex-1 flex flex-col items-center p-6 pt-12 overflow-auto animate-in fade-in duration-700 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
                    Build Your <span className="text-primary italic">Professional</span> Profile
                </h1>
                <p className="text-sm text-foreground-secondary max-w-md mx-auto leading-relaxed">
                    Import your background or enter it manually to create an
                    ATS-optimized foundation for your resume.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
                {/* Upload Resume Button */}
                <button
                    onClick={() => updateNavigation("resume")}
                    className="relative w-full glass-card px-6 py-3 hover:bg-primary/5 border-2 border-primary/20 hover:border-primary/40 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                    {isResumeSelected && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs animate-in zoom-in">✓</span>
                    )}
                    <span className="text-primary"><IconResume /></span>
                    <span className="text-foreground">Upload Resume</span>
                </button>

                {/* Or Divider */}
                <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-foreground-secondary text-xs font-medium">or</span>
                    <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Upload LinkedIn Profile Button */}
                <button
                    onClick={() => updateNavigation("linkedin")}
                    className="relative w-full glass-card px-6 py-3 hover:bg-primary/5 border-2 border-primary/20 hover:border-primary/40 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                    {isLinkedInSelected && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs animate-in zoom-in">✓</span>
                    )}
                    <span className="text-primary"><IconLinkedIn /></span>
                    <span className="text-foreground">Upload LinkedIn Profile</span>
                </button>
            </div>

            {/* Manual Entry Section */}
            <div className="mt-5 text-center">
                <p className="text-foreground-secondary text-sm font-medium mb-1">
                    Don't have any?
                </p>
                <p className="text-foreground-secondary/70 text-xs mb-2">
                    No worries, you can add your details manually also.
                </p>
                <button
                    onClick={() => updateNavigation("manual")}
                    className="relative inline-flex items-center gap-2 px-4 py-1.5 text-primary hover:text-primary/80 font-semibold border-2 border-primary/30 hover:border-primary/50 rounded-lg transition-all hover:bg-primary/5 text-sm"
                >
                    {hasManualData && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px] animate-in zoom-in">✓</span>
                    )}
                    <IconManual />
                    <span>Add Manually</span>
                </button>
            </div>

            {/* Continue Button - Only shows when user has data */}
            {hasAnyData && (
                <div className="mt-4 mb-2 flex flex-col items-center gap-2 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full text-xs font-medium">
                        <span>✨</span>
                        <span>Ready to continue!</span>
                    </div>
                    <button
                        onClick={handleStartFlow}
                        className="btn-primary px-8 py-2.5 rounded-full text-sm font-bold shadow-xl shadow-primary/30 flex items-center gap-2 transition-all duration-500 hover:scale-[1.05] active:scale-95"
                    >
                        <span>Continue</span>
                        <span>→</span>
                    </button>
                </div>
            )}

            {/* Smart Popup - Other Source */}
            {showPopup === "other-source" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
                    <div className="glass-card p-8 max-w-md w-full animate-in zoom-in-95 duration-300 relative">
                        {/* Step Indicator */}
                        <div className="absolute top-4 right-4 text-xs text-foreground-secondary">
                            Step {popupStep} of {totalPopupSteps}
                        </div>

                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto text-primary">
                            {getOtherSourcePopupContent().icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-foreground text-center mb-4">
                            {getOtherSourcePopupContent().title}
                        </h2>

                        {/* Benefits */}
                        <p className="text-foreground-secondary text-center mb-4">
                            Adding this helps us:
                        </p>
                        <ul className="space-y-2 mb-6">
                            {getOtherSourcePopupContent().benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-foreground-secondary">
                                    <span className="text-primary">•</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handlePopupAction("add")}
                                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 relative"
                            >
                                <span className="absolute left-3 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">⭐ Recommended</span>
                                <span>{getOtherSourcePopupContent().primaryBtn}</span>
                            </button>
                            <button
                                onClick={() => handlePopupAction("skip")}
                                className="w-full py-3 rounded-xl font-medium text-foreground-secondary hover:bg-background-secondary/50 transition-colors"
                            >
                                ⏭ Skip for now
                            </button>
                        </div>

                        {/* Note */}
                        <p className="text-xs text-foreground-secondary/70 text-center mt-4">
                            You can always add it later
                        </p>
                    </div>
                </div>
            )}

            {/* Smart Popup - Manual Data */}
            {showPopup === "manual" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
                    <div className="glass-card p-8 max-w-md w-full animate-in zoom-in-95 duration-300 relative">
                        {/* Step Indicator */}
                        <div className="absolute top-4 right-4 text-xs text-foreground-secondary">
                            Step {popupStep} of {totalPopupSteps}
                        </div>

                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto text-primary">
                            <IconManual />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-foreground text-center mb-4">
                            Add anything we might have missed ✍️
                        </h2>

                        {/* Benefits */}
                        <p className="text-foreground-secondary text-center mb-4">
                            You can quickly add:
                        </p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-foreground-secondary">
                                <span className="text-primary">•</span>
                                <span>Certifications</span>
                            </li>
                            <li className="flex items-center gap-2 text-foreground-secondary">
                                <span className="text-primary">•</span>
                                <span>Freelance / side projects</span>
                            </li>
                            <li className="flex items-center gap-2 text-foreground-secondary">
                                <span className="text-primary">•</span>
                                <span>Career gaps or context</span>
                            </li>
                        </ul>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handlePopupAction("add")}
                                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                ✍️ Add manually
                            </button>
                            <button
                                onClick={() => handlePopupAction("skip")}
                                className="w-full py-3 rounded-xl font-medium text-foreground-secondary hover:bg-background-secondary/50 transition-colors"
                            >
                                ⏭ Skip
                            </button>
                        </div>

                        {/* Note */}
                        <p className="text-xs text-foreground-secondary/70 text-center mt-4">
                            Optional — your profile already looks good 👍
                        </p>
                    </div>
                </div>
            )}

            {/* Confirmation Screen */}
            {showPopup === "confirm" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
                    <div className="glass-card p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto text-primary">
                            <IconSparkles />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                            Ready to generate your profile!
                        </h2>

                        {/* Summary Card */}
                        <div className="bg-background-secondary/50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex items-center gap-3">
                                {isResumeSelected ? (
                                    <span className="text-green-500">✔</span>
                                ) : skippedResume ? (
                                    <span className="text-foreground-secondary">⏭</span>
                                ) : (
                                    <span className="text-foreground-secondary/50">○</span>
                                )}
                                <span className="text-foreground">
                                    Resume {isResumeSelected ? "uploaded" : skippedResume ? "skipped" : "not added"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {isLinkedInSelected ? (
                                    <span className="text-green-500">✔</span>
                                ) : skippedLinkedIn ? (
                                    <span className="text-foreground-secondary">⏭</span>
                                ) : (
                                    <span className="text-foreground-secondary/50">○</span>
                                )}
                                <span className="text-foreground">
                                    LinkedIn {isLinkedInSelected ? "added" : skippedLinkedIn ? "skipped" : "not added"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {hasManualData ? (
                                    <span className="text-green-500">✔</span>
                                ) : skippedManual ? (
                                    <span className="text-foreground-secondary">⏭</span>
                                ) : (
                                    <span className="text-foreground-secondary/50">○</span>
                                )}
                                <span className="text-foreground">
                                    Manual info {hasManualData ? "added" : skippedManual ? "skipped" : "not added"}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleConfirmAndGenerate}
                            disabled={isExtracting}
                            className={`w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 ${isExtracting ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"} transition-all`}
                        >
                            {isExtracting ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span>⚡</span>
                                    <span>Generate ATS-Optimized Profile</span>
                                </>
                            )}
                        </button>

                        {/* Subtext */}
                        <p className="text-xs text-foreground-secondary text-center mt-3">
                            Takes ~15–30 seconds
                        </p>

                        {/* Back Button */}
                        <button
                            onClick={() => setShowPopup("none")}
                            className="w-full mt-4 py-2 text-foreground-secondary hover:text-foreground text-sm transition-colors"
                        >
                            ← Go back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderResumeView = () => (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
            {/* Compact Header with Continue Button */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => updateNavigation("menu")} className="flex items-center gap-1.5 text-foreground-secondary hover:text-primary transition-colors text-sm">
                    <IconBack />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-foreground-secondary hidden sm:block">
                        Step 1 of 4 • <span className="text-primary font-medium">Upload</span> → Analyze → Optimize → Download
                    </div>
                    <button
                        onClick={() => handleContinue()}
                        disabled={!isResumeSelected}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isResumeSelected
                            ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isResumeSelected ? "Continue →" : "Select to continue"}
                    </button>
                </div>
            </div>

            {/* Title Row */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Upload Your Resume</h1>
                    <p className="text-sm text-foreground-secondary">Upload a PDF resume to extract your professional history</p>
                </div>
                <div className="px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-xs whitespace-nowrap">
                    <span className="text-foreground-secondary">Uploads left: </span>
                    <span className="font-bold text-primary">{uploadLimits.max_resumes - uploadLimits.lifetime_resume_uploads}/{uploadLimits.max_resumes}</span>
                </div>
            </div>

            {/* Fixed Upload Section */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Upload Area */}
                    <label className={`flex-1 flex items-center gap-5 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${uploadStatus.resume === "uploading" || !uploadLimits.can_upload_resume
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary"
                        }`}>
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleResumeUpload}
                            disabled={uploadStatus.resume === "uploading" || !uploadLimits.can_upload_resume}
                        />
                        {uploadStatus.resume === "uploading" ? (
                            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            <>
                                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <IconUpload />
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-bold text-foreground mb-0.5">Drop your resume here or click to browse</p>
                                    <p className="text-xs text-foreground-secondary">Supports PDF format • Maximum file size 2 MB</p>
                                </div>
                                <div className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shrink-0">
                                    Browse Files
                                </div>
                            </>
                        )}
                    </label>
                </div>

                {/* Subtle Info - What happens next */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                    <p className="text-[10px] text-foreground-secondary flex items-center gap-1.5">
                        <span className="text-primary"><IconInfo /></span>
                        <span className="font-medium">What happens:</span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-foreground-secondary">
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">1</span> AI Parsing</span>
                        <span className="text-gray-300">→</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">2</span> ATS Analysis</span>
                        <span className="text-gray-300">→</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">3</span> Optimization</span>
                    </div>
                    <span className="ml-auto text-[9px] text-foreground-secondary">🔒 Your data is secure</span>
                </div>
            </div>

            {/* Uploaded Resumes Section */}
            {resumes.length > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-foreground">Your Uploaded Resumes</h2>
                        <p className="text-xs text-foreground-secondary">{resumes.length} file{resumes.length !== 1 ? 's' : ''} • Select one to continue</p>
                    </div>

                    {/* Resume Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {resumes.map(file => {
                            const isSelected = selectedResumeId === file.id;
                            return (
                                <div
                                    key={file.id}
                                    onClick={() => handleSelectFile("resume", file.id)}
                                    className={`group relative rounded-xl bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden ${isSelected
                                        ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                                        : "border border-gray-200 hover:border-primary/30"
                                        }`}
                                >
                                    {/* Selected Badge */}
                                    {isSelected && (
                                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-full text-[9px] font-bold">
                                            <span>✓</span>
                                            <span>Selected</span>
                                        </div>
                                    )}

                                    {/* Checkbox (hidden when selected badge shows) */}
                                    {!isSelected && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white flex items-center justify-center" />
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile("resume", file.id, file.file_name); }}
                                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Delete file"
                                    >
                                        <IconTrash />
                                    </button>

                                    {/* PDF Preview */}
                                    <div className="pt-8 pb-2 px-2.5">
                                        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="px-1 py-0.5 bg-red-500 text-white text-[7px] font-bold rounded">PDF</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="h-1 bg-gray-200 rounded w-full" />
                                                <div className="h-1 bg-gray-200 rounded w-3/4" />
                                                <div className="h-1 bg-gray-100 rounded w-full" />
                                                <div className="h-1 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filename */}
                                    <div className={`px-2.5 pb-2.5 ${isSelected ? 'bg-primary/5' : ''}`}>
                                        <p className="text-[11px] font-semibold text-gray-800 truncate" title={file.file_name}>
                                            {file.file_name}
                                        </p>
                                        <p className="text-[9px] text-gray-400">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State - No Resumes Yet */}
            {resumes.length === 0 && (
                <div className="glass-card p-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <IconResume />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">No resumes uploaded yet</h3>
                    <p className="text-sm text-foreground-secondary max-w-md">
                        Upload your first resume using the upload area above to get started with AI-powered optimization
                    </p>
                </div>
            )}
        </div>
    );

    const renderLinkedInView = () => (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
            {/* Compact Header with Continue Button */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => updateNavigation("menu")} className="flex items-center gap-1.5 text-foreground-secondary hover:text-primary transition-colors text-sm">
                    <IconBack />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-foreground-secondary hidden sm:block">
                        Step 1 of 4 • <span className="text-primary font-medium">Upload</span> → Analyze → Optimize → Download
                    </div>
                    <button
                        onClick={() => handleContinue()}
                        disabled={!isLinkedInSelected}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${isLinkedInSelected
                            ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isLinkedInSelected ? "Continue →" : "Select to continue"}
                    </button>
                </div>
            </div>

            {/* Title Row */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Import LinkedIn Profile</h1>
                    <p className="text-sm text-foreground-secondary">Export your profile from LinkedIn as PDF and upload it here</p>
                </div>
                <div className="px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-xs whitespace-nowrap">
                    <span className="text-foreground-secondary">Uploads left: </span>
                    <span className="font-bold text-primary">{uploadLimits.max_linkedin - uploadLimits.lifetime_linkedin_uploads}/{uploadLimits.max_linkedin}</span>
                </div>
            </div>

            {/* Fixed Upload Section */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-6">
                    {/* Upload Area */}
                    <label className={`flex-1 flex items-center gap-5 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${uploadStatus.linkedin === "uploading" || !uploadLimits.can_upload_linkedin
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary"
                        }`}>
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleLinkedInUpload}
                            disabled={uploadStatus.linkedin === "uploading" || !uploadLimits.can_upload_linkedin}
                        />
                        {uploadStatus.linkedin === "uploading" ? (
                            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            <>
                                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <IconUpload />
                                </div>
                                <div className="flex-1">
                                    <p className="text-base font-bold text-foreground mb-0.5">Drop your LinkedIn PDF here or click to browse</p>
                                    <p className="text-xs text-foreground-secondary">
                                        {!uploadLimits.can_upload_linkedin
                                            ? "Lifetime upload limit reached"
                                            : "Supports PDF format • Maximum file size 2 MB"
                                        }
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shrink-0">
                                    Browse Files
                                </div>
                            </>
                        )}
                    </label>

                    {/* How to Guide (Compact) */}
                    <div className="w-1/3 bg-background-secondary/50 p-4 rounded-xl border border-border hidden md:block">
                        <h4 className="text-[10px] font-bold text-foreground mb-2 flex items-center gap-2 text-primary">
                            <IconInfo />
                            <span>How to get PDF?</span>
                        </h4>
                        <ul className="space-y-1.5 text-[10px] text-foreground-secondary">
                            <li className="flex gap-1.5">
                                <span className="text-primary font-bold">1.</span>
                                <span>Go to your LinkedIn Profile</span>
                            </li>
                            <li className="flex gap-1.5">
                                <span className="text-primary font-bold">2.</span>
                                <span>Click <strong>&quot;More&quot;</strong> button</span>
                            </li>
                            <li className="flex gap-1.5">
                                <span className="text-primary font-bold">3.</span>
                                <span>Select <strong>&quot;Save to PDF&quot;</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Subtle Info */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                    <p className="text-[10px] text-foreground-secondary flex items-center gap-1.5">
                        <span className="text-primary"><IconInfo /></span>
                        <span className="font-medium">What happens:</span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-foreground-secondary">
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">1</span> Data Extraction</span>
                        <span className="text-gray-300">→</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">2</span> Skill Mapping</span>
                        <span className="text-gray-300">→</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">3</span> Gap Analysis</span>
                    </div>
                    <div className="ml-auto text-[10px] text-foreground-secondary flex items-center gap-1">
                        <span className="text-green-500">🔒</span> Private & Secure
                    </div>
                </div>
            </div>

            {/* Uploaded Profiles Section */}
            {linkedinFiles.length > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-foreground">Your Uploaded Profiles</h2>
                        <p className="text-xs text-foreground-secondary">{linkedinFiles.length} file{linkedinFiles.length !== 1 ? 's' : ''} • Select one to continue</p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {linkedinFiles.map(file => {
                            const isSelected = selectedLinkedInId === file.id;
                            return (
                                <div
                                    key={file.id}
                                    onClick={() => handleSelectFile("linkedin", file.id)}
                                    className={`group relative rounded-xl bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden ${isSelected
                                        ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                                        : "border border-gray-200 hover:border-primary/30"
                                        }`}
                                >
                                    {/* Selected Badge */}
                                    {isSelected && (
                                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-full text-[9px] font-bold">
                                            <span>✓</span>
                                            <span>Selected</span>
                                        </div>
                                    )}

                                    {/* Checkbox */}
                                    {!isSelected && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white flex items-center justify-center" />
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile("linkedin", file.id, file.file_name); }}
                                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Delete file"
                                    >
                                        <IconTrash />
                                    </button>

                                    {/* PDF Preview */}
                                    <div className="pt-8 pb-2 px-2.5">
                                        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="px-1 py-0.5 bg-blue-600 text-white text-[7px] font-bold rounded">IN</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                                                    <div className="h-1 bg-gray-200 rounded w-8" />
                                                </div>
                                                <div className="h-1 bg-gray-100 rounded w-full" />
                                                <div className="h-1 bg-gray-100 rounded w-2/3" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filename */}
                                    <div className={`px-2.5 pb-2.5 ${isSelected ? 'bg-primary/5' : ''}`}>
                                        <p className="text-[11px] font-semibold text-gray-800 truncate" title={file.file_name}>
                                            {file.file_name}
                                        </p>
                                        <p className="text-[9px] text-gray-400">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            {/* Empty State - No LinkedIn Profiles Yet */}
            {linkedinFiles.length === 0 && (
                <div className="glass-card p-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <IconLinkedIn />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">No LinkedIn profiles uploaded yet</h3>
                    <p className="text-sm text-foreground-secondary max-w-md">
                        Upload your LinkedIn profile PDF using the upload area above to extract your professional history
                    </p>
                </div>
            )}
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
        const needsManual = !hasManualData;

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
        return null; // Keep showing loading.tsx skeleton
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

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {processingJob?.status === 'failed' ? 'Processing Failed' : 'Crafting Your Profile'}
                        </h2>
                        <div className="text-lg text-primary font-medium mb-6 min-h-[28px] animate-pulse">
                            {processingJob?.message || "Preparing..."}
                        </div>

                        <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/40 transition-all duration-500 rounded-full"
                                style={{ width: `${processingJob?.progress || 0}%` }}
                            />
                        </div>
                        <div className="flex justify-end text-[10px] text-gray-500 mb-6 font-mono uppercase tracking-widest">
                            <span>{processingJob?.progress || 0}% Complete</span>
                        </div>


                        <p className="text-sm text-gray-400 leading-relaxed italic">
                            &quot;Our AI is meticulously organizing your history for maximum ATS performance.&quot;
                        </p>
                    </div>
                </div>
            )}

            {/* Content Views */}
            <main className="flex-1 flex flex-col relative p-8 bg-transparent">
                <div className="absolute inset-0 bg-radial-at-t from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />

                {currentView === "menu" && renderMenuView()}
                {currentView === "resume" && renderResumeView()}
                {currentView === "linkedin" && renderLinkedInView()}
                {currentView === "manual" && renderManualView()}
            </main>

            {/* Smart Nudge Modal */}
            {renderNudgeModal()}
            {renderSourceWarning()}

            {/* Duplicate File Warning Modal */}
            {duplicateWarning.show && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDuplicateWarning({ show: false, type: null, file: null, existingId: null, fileName: "" })} />
                    <div className="relative bg-background rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <IconInfo />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Duplicate File</h3>
                            <p className="text-sm text-foreground-secondary mb-6">
                                A file named <span className="font-semibold text-foreground">"{duplicateWarning.fileName}"</span> already exists. Do you want to replace it or use the existing one?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDuplicateReplace}
                                    className="w-full px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Replace New File
                                </button>
                                <button
                                    onClick={handleDuplicateUseExisting}
                                    className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-background-secondary transition-colors"
                                >
                                    Use Existing File
                                </button>
                                <button
                                    onClick={() => setDuplicateWarning({ show: false, type: null, file: null, existingId: null, fileName: "" })}
                                    className="text-xs text-foreground-secondary hover:text-foreground mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Dialog */}
            {confirmDialog.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDialog({ show: false, type: null, id: null, fileName: "" })} />
                    <div className="relative bg-background rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full animate-in zoom-in-95">
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <IconTrash />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Delete File?</h3>
                            <p className="text-sm text-foreground-secondary mb-6">
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{confirmDialog.fileName}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDialog({ show: false, type: null, id: null, fileName: "" })}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-background-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteFile}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

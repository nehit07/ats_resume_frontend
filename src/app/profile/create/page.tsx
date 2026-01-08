"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type SectionType = "contact" | "summary" | "skills" | "projects" | "experience" | "education";

interface UploadStatus {
    resume: "idle" | "uploading" | "success" | "error";
    linkedin: "idle" | "uploading" | "success" | "error";
}

export default function ProfileCreatePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState<SectionType>("contact");
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        resume: "idle",
        linkedin: "idle",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [manualData, setManualData] = useState({
        contact: { full_name: "", email: "", phone: "", location: "", linkedin_url: "" },
        summary: { text: "" },
        skills: { skills: "" },
        projects: { projects: "" },
        experience: { experience: "" },
        education: { education: "" },
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

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
            } else {
                setUploadStatus((prev) => ({ ...prev, resume: "error" }));
            }
        } catch {
            setUploadStatus((prev) => ({ ...prev, resume: "error" }));
        }
    };

    const handleLinkedInUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

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
            } else {
                setUploadStatus((prev) => ({ ...prev, linkedin: "error" }));
            }
        } catch {
            setUploadStatus((prev) => ({ ...prev, linkedin: "error" }));
        }
    };

    const handleManualSave = async () => {
        const content = manualData[activeTab];

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
        }
    };

    const handleProcessData = async () => {
        setIsProcessing(true);
        // TODO: Call /api/ingestion/process/ when backend is ready
        setTimeout(() => {
            setIsProcessing(false);
            router.push("/profile/review");
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-foreground-secondary">Loading...</div>
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
        { key: "projects", label: "Projects" },
        { key: "experience", label: "Experience" },
        { key: "education", label: "Education" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-border">
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

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8">
                <div className="max-w-5xl mx-auto">
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
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-foreground">Upload Resume</h3>
                                {uploadStatus.resume === "success" && (
                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">✓ Uploaded</span>
                                )}
                            </div>
                            <p className="text-sm text-foreground-secondary mb-4">
                                Upload your existing resume (PDF or DOCX)
                            </p>
                            <label className={`block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors ${uploadStatus.resume === "uploading" ? "opacity-50" : ""}`}>
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
                                    className="hidden"
                                    onChange={handleResumeUpload}
                                    disabled={uploadStatus.resume === "uploading"}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-foreground-secondary">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className="text-sm text-foreground-secondary">
                                    {uploadStatus.resume === "uploading" ? "Uploading..." : "Drop file here or click to browse"}
                                </span>
                            </label>
                        </div>

                        {/* LinkedIn Upload Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-foreground">Upload LinkedIn Profile</h3>
                                {uploadStatus.linkedin === "success" && (
                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full ml-auto">✓ Uploaded</span>
                                )}
                            </div>
                            <p className="text-sm text-foreground-secondary mb-2">
                                Download your LinkedIn profile as PDF and upload here
                            </p>
                            <p className="text-xs text-foreground-secondary/70 mb-4">
                                Go to your LinkedIn profile → Click &quot;More&quot; → &quot;Save to PDF&quot;
                            </p>
                            <label className={`block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors ${uploadStatus.linkedin === "uploading" ? "opacity-50" : ""}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleLinkedInUpload}
                                    disabled={uploadStatus.linkedin === "uploading"}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-foreground-secondary">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className="text-sm text-foreground-secondary">
                                    {uploadStatus.linkedin === "uploading" ? "Uploading..." : "Drop LinkedIn PDF here"}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Manual Entry Section */}
                    <div className="glass-card p-6 mb-8">
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
                                {activeTab === "contact" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="John Doe"
                                                value={manualData.contact.full_name}
                                                onChange={(e) => setManualData((prev) => ({
                                                    ...prev,
                                                    contact: { ...prev.contact, full_name: e.target.value }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="input-field"
                                                placeholder="john@example.com"
                                                value={manualData.contact.email}
                                                onChange={(e) => setManualData((prev) => ({
                                                    ...prev,
                                                    contact: { ...prev.contact, email: e.target.value }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                className="input-field"
                                                placeholder="+1 234 567 8900"
                                                value={manualData.contact.phone}
                                                onChange={(e) => setManualData((prev) => ({
                                                    ...prev,
                                                    contact: { ...prev.contact, phone: e.target.value }
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-foreground-secondary mb-1">Location</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="New York, USA"
                                                value={manualData.contact.location}
                                                onChange={(e) => setManualData((prev) => ({
                                                    ...prev,
                                                    contact: { ...prev.contact, location: e.target.value }
                                                }))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-foreground-secondary mb-1">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                className="input-field"
                                                placeholder="https://linkedin.com/in/yourprofile"
                                                value={manualData.contact.linkedin_url}
                                                onChange={(e) => setManualData((prev) => ({
                                                    ...prev,
                                                    contact: { ...prev.contact, linkedin_url: e.target.value }
                                                }))}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "summary" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Professional Summary</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Write a brief summary of your professional background..."
                                            value={manualData.summary.text}
                                            onChange={(e) => setManualData((prev) => ({
                                                ...prev,
                                                summary: { text: e.target.value }
                                            }))}
                                        />
                                    </div>
                                )}

                                {activeTab === "skills" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Skills (comma separated)</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Python, JavaScript, React, Node.js, AWS..."
                                            value={manualData.skills.skills}
                                            onChange={(e) => setManualData((prev) => ({
                                                ...prev,
                                                skills: { skills: e.target.value }
                                            }))}
                                        />
                                    </div>
                                )}

                                {activeTab === "projects" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Projects</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Describe your key projects..."
                                            value={manualData.projects.projects}
                                            onChange={(e) => setManualData((prev) => ({
                                                ...prev,
                                                projects: { projects: e.target.value }
                                            }))}
                                        />
                                    </div>
                                )}

                                {activeTab === "experience" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Work Experience</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Describe your work experience..."
                                            value={manualData.experience.experience}
                                            onChange={(e) => setManualData((prev) => ({
                                                ...prev,
                                                experience: { experience: e.target.value }
                                            }))}
                                        />
                                    </div>
                                )}

                                {activeTab === "education" && (
                                    <div>
                                        <label className="block text-sm text-foreground-secondary mb-1">Education</label>
                                        <textarea
                                            className="input-field min-h-[150px]"
                                            placeholder="Describe your educational background..."
                                            value={manualData.education.education}
                                            onChange={(e) => setManualData((prev) => ({
                                                ...prev,
                                                education: { education: e.target.value }
                                            }))}
                                        />
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleManualSave} className="btn-secondary">
                                        Save {tabs.find((t) => t.key === activeTab)?.label}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Process Data Button */}
                    <button
                        onClick={handleProcessData}
                        disabled={isProcessing}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            "🚀 Process My Data"
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

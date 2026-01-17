'use client';

import React, { useRef, useEffect, useState } from 'react';

// Type definitions
interface ContactData {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github?: string;
    portfolio?: string;
}

interface SummaryData {
    text?: string;
}

interface SkillsData {
    skills?: string;
}

interface EducationEntry {
    degree_type?: string;
    institution_name?: string;
    city?: string;
    state?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    is_pursuing?: boolean;
    grade?: string;
}

interface ExperienceEntry {
    company_name?: string;
    job_role?: string;
    job_description?: string;
    city?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
}

interface ProjectEntry {
    name?: string;
    description?: string;
    technologies?: string;
    url?: string;
}

interface AchievementEntry {
    title?: string;
    description?: string;
}

interface CertificationEntry {
    title?: string;
    issued_by?: string;
    issue_date?: string;
    expiry_date?: string;
    credential_url?: string;
}

interface ATSResumePreviewProps {
    contact: ContactData | null;
    summary: SummaryData | null;
    skills: SkillsData | null;
    education: EducationEntry[] | null;
    experience: ExperienceEntry[] | null;
    projects: ProjectEntry[] | null;
    achievements: AchievementEntry[] | null;
    certifications: CertificationEntry[] | null;
    scale?: number;
}

// Helper to format date
const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    // Handle YYYY-MM format
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[parseInt(parts[1]) - 1] || '';
        return `${month} ${parts[0]}`;
    }
    return dateStr;
};

// Section components
const ContactSection: React.FC<{ data: ContactData | null }> = ({ data }) => {
    if (!data || !data.full_name) return null;

    const contactParts = [
        data.location,
        data.phone,
        data.email
    ].filter(Boolean).join(' | ');

    return (
        <div className="text-center mb-4">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
                {data.full_name}
            </h1>
            {contactParts && (
                <div className="resume-date-location mt-1 text-gray-700">
                    {contactParts}
                </div>
            )}
            {data.linkedin_url && (
                <div className="resume-date-location text-blue-700 underline">
                    {data.linkedin_url}
                </div>
            )}
            {(data.github || data.portfolio) && (
                <div className="resume-date-location text-blue-700 underline">
                    {[data.github, data.portfolio].filter(Boolean).join(' | ')}
                </div>
            )}
        </div>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="resume-section-header">
        {title}
    </h2>
);

const SummarySection: React.FC<{ data: SummaryData | null }> = ({ data }) => {
    if (!data || !data.text) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Professional Summary" />
            <p className="resume-content-text">
                {data.text}
            </p>
        </div>
    );
};

const EducationSection: React.FC<{ data: EducationEntry[] | null }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Education" />
            {data.map((edu, idx) => (
                <div key={idx} className="mb-2">
                    <div className="flex justify-between resume-item-title">
                        <span>{edu.institution_name}</span>
                        <span className="resume-date-location font-normal">
                            {formatDate(edu.start_date)} – {edu.is_pursuing ? 'Present' : formatDate(edu.end_date)}
                        </span>
                    </div>
                    <div className="flex justify-between resume-item-subtitle">
                        <span>{edu.degree_type}</span>
                        <span className="resume-date-location not-italic">
                            {[edu.city, edu.state, edu.country].filter(Boolean).join(', ')}
                        </span>
                    </div>
                    {edu.grade && (
                        <p className="resume-content-text mt-0.5">Grade: {edu.grade}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

const SkillsSection: React.FC<{ data: SkillsData | null }> = ({ data }) => {
    if (!data || !data.skills) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Technical Skills" />
            <p className="text-[9pt] text-gray-800">
                {data.skills}
            </p>
        </div>
    );
};

const ExperienceSection: React.FC<{ data: ExperienceEntry[] | null }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Professional Experience" />
            {data.map((exp, idx) => (
                <div key={idx} className="mb-2">
                    <div className="flex justify-between resume-item-title">
                        <span>{exp.company_name}</span>
                        <span className="resume-date-location font-normal">
                            {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                        </span>
                    </div>
                    <div className="flex justify-between resume-item-subtitle">
                        <span>{exp.job_role}</span>
                        <span className="resume-date-location not-italic">
                            {[exp.city, exp.country].filter(Boolean).join(', ')}
                        </span>
                    </div>
                    {exp.job_description && (
                        <p className="resume-content-text mt-1 whitespace-pre-line">
                            {exp.job_description}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

const ProjectsSection: React.FC<{ data: ProjectEntry[] | null }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Key Projects" />
            {data.map((proj, idx) => (
                <div key={idx} className="mb-2">
                    <div className="flex justify-between resume-item-title">
                        <span>{proj.name}</span>
                        {proj.url && (
                            <span className="text-blue-700 underline font-normal resume-date-location">
                                {proj.url}
                            </span>
                        )}
                    </div>
                    {proj.technologies && (
                        <p className="resume-content-text">
                            <strong>Technologies:</strong> {proj.technologies}
                        </p>
                    )}
                    {proj.description && (
                        <p className="resume-content-text italic mt-0.5">
                            {proj.description}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

const AchievementsSection: React.FC<{ data: AchievementEntry[] | null }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Honors & Achievements" />
            {data.map((ach, idx) => (
                <div key={idx} className="mb-1">
                    <span className="resume-item-title">{ach.title}</span>
                    {ach.description && (
                        <span className="resume-content-text"> – {ach.description}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

const CertificationsSection: React.FC<{ data: CertificationEntry[] | null }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Certifications" />
            <ul className="resume-bullet-list mt-1">
                {data.map((cert, idx) => (
                    <li key={idx} className="resume-bullet-item">
                        {cert.title}
                        {cert.issued_by && ` (${cert.issued_by})`}
                        {cert.issue_date && ` - ${formatDate(cert.issue_date)}`}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Empty state component
const EmptyPreview: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <div className="text-6xl mb-4 opacity-30">📄</div>
        <h3 className="text-lg font-semibold text-foreground-secondary mb-2">
            No Preview Available
        </h3>
        <p className="text-sm text-foreground-secondary max-w-xs">
            Generate content for your sections to see a live preview of your ATS-optimized resume.
        </p>
    </div>
);

// Main component
export default function ATSResumePreview({
    contact,
    summary,
    skills,
    education,
    experience,
    projects,
    achievements,
    certifications,
    scale = 0.65
}: ATSResumePreviewProps) {
    const page1Ref = useRef<HTMLDivElement>(null);
    const [showPage2, setShowPage2] = useState(false);

    // Check if any content exists
    const hasContent = contact || summary || skills ||
        (education && education.length > 0) ||
        (experience && experience.length > 0) ||
        (projects && projects.length > 0) ||
        (achievements && achievements.length > 0) ||
        (certifications && certifications.length > 0);

    // Detect overflow
    useEffect(() => {
        if (page1Ref.current) {
            // A4 height at ~96dpi: 297mm ≈ 1123px, minus padding
            const maxHeight = 1000;
            const currentHeight = page1Ref.current.scrollHeight;
            setShowPage2(currentHeight > maxHeight);
        }
    }, [contact, summary, skills, education, experience, projects, achievements, certifications]);

    if (!hasContent) {
        return <EmptyPreview />;
    }

    // Sections for Page 1 (priority sections)
    const page1Content = (
        <>
            <ContactSection data={contact} />
            <SummarySection data={summary} />
            <EducationSection data={education} />
            <SkillsSection data={skills} />
            <ExperienceSection data={experience} />
        </>
    );

    // Sections for Page 2 (overflow sections)
    const page2Content = (
        <>
            <ProjectsSection data={projects} />
            <AchievementsSection data={achievements} />
            <CertificationsSection data={certifications} />
        </>
    );

    return (
        <div className="a4-container">
            {/* Page 1 */}
            <div
                className="relative"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    marginBottom: `calc(${(scale - 1) * 297}mm + ${showPage2 ? '2rem' : '0px'})`
                }}
            >
                <div className="absolute -top-10 left-0 bg-background-secondary px-3 py-1 rounded-full border border-border shadow-sm text-[12px] font-bold text-primary z-10">
                    PAGE 1 {showPage2 && '/ 2'}
                </div>
                <div
                    ref={page1Ref}
                    className="a4-page shadow-2xl"
                >
                    {page1Content}
                    {!showPage2 && page2Content}
                </div>
            </div>

            {/* Page Break Visual (only if 2 pages) */}
            {showPage2 && (
                <div className="resume-page-break" style={{ width: '210mm' }}>
                    <span>PAGE BREAK</span>
                </div>
            )}

            {/* Page 2 */}
            {showPage2 && (
                <div
                    className="relative"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `calc(${(scale - 1) * 297}mm)`
                    }}
                >
                    <div className="absolute -top-10 left-0 bg-background-secondary px-3 py-1 rounded-full border border-border shadow-sm text-[12px] font-bold text-primary z-10">
                        PAGE 2 / 2
                    </div>
                    <div
                        className="a4-page shadow-2xl"
                    >
                        {page2Content}
                    </div>
                </div>
            )}
        </div>
    );
}

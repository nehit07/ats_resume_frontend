'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

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
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[parseInt(parts[1]) - 1] || '';
        return `${month} ${parts[0]}`;
    }
    return dateStr;
};

// Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="resume-section-header">{title}</h2>
);

// Individual Entry Components (for atomic measurement)
const ContactEntry: React.FC<{ data: ContactData }> = ({ data }) => {
    const contactParts = [data.location, data.phone].filter(Boolean).join(' | ');

    return (
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-black mb-1">
                {data.full_name}
            </h1>
            {(contactParts || data.email) && (
                <div className="resume-date-location font-normal text-black">
                    {contactParts}
                    {contactParts && data.email && ' | '}
                    {data.email && (
                        <a href={`mailto:${data.email}`}
                            className="text-blue-700 hover:underline">
                            {data.email}
                        </a>
                    )}
                </div>
            )}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1">
                {data.linkedin_url && (
                    <a href={data.linkedin_url.startsWith('http') ? data.linkedin_url : `https://${data.linkedin_url}`}
                        target="_blank" rel="noopener noreferrer"
                        className="resume-date-location text-blue-700 hover:underline">
                        <strong className="text-black">LinkedIn:</strong> {data.linkedin_url.replace(/^https?:\/\//, '')}
                    </a>
                )}
                {data.github && (
                    <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`}
                        target="_blank" rel="noopener noreferrer"
                        className="resume-date-location text-blue-700 hover:underline">
                        <strong className="text-black">GitHub:</strong> {data.github.replace(/^https?:\/\//, '')}
                    </a>
                )}
                {data.portfolio && (
                    <a href={data.portfolio.startsWith('http') ? data.portfolio : `https://${data.portfolio}`}
                        target="_blank" rel="noopener noreferrer"
                        className="resume-date-location text-blue-700 hover:underline">
                        <strong className="text-black">Portfolio:</strong> {data.portfolio.replace(/^https?:\/\//, '')}
                    </a>
                )}
            </div>
        </div>
    );
};

const SummaryEntry: React.FC<{ data: any }> = ({ data }) => {
    const text = typeof data === 'string' ? data : (data?.text || data?.summary || data?.content);
    if (!text || !text.trim()) return null;

    return (
        <div className="mb-3">
            <SectionHeader title="Professional Summary" />
            <p className="resume-content-text">{text}</p>
        </div>
    );
};

const EducationEntry_: React.FC<{ data: EducationEntry; showHeader?: boolean }> = ({ data, showHeader }) => (
    <div className="mb-2">
        {showHeader && <SectionHeader title="Education" />}
        <div className="flex justify-between resume-item-title">
            <span>{data.institution_name}</span>
            <span className="resume-date-location font-normal">
                {formatDate(data.start_date)} – {data.is_pursuing ? 'Present' : formatDate(data.end_date)}
            </span>
        </div>
        <div className="flex justify-between resume-item-subtitle">
            <span>{data.degree_type}</span>
            <span className="resume-date-location not-italic">
                {[data.city, data.state, data.country].filter(Boolean).join(', ')}
            </span>
        </div>
        {data.grade && <p className="resume-content-text mt-0.5">Grade: {data.grade}</p>}
    </div>
);

const SkillsEntry: React.FC<{ data: any }> = ({ data }) => {
    let skillsString = '';
    if (typeof data === 'string') {
        skillsString = data;
    } else if (data?.skills) {
        skillsString = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;
    } else if (data?.list) {
        skillsString = Array.isArray(data.list) ? data.list.join(', ') : data.list;
    } else if (data && Object.keys(data).length > 0 && typeof Object.values(data)[0] === 'string') {
        skillsString = Object.values(data)[0] as string;
    }
    if (!skillsString || !skillsString.trim()) return null;

    return (
        <div className="mb-4">
            <SectionHeader title="Technical Skills" />
            <div className="resume-content-text">{skillsString}</div>
        </div>
    );
};

const ExperienceEntry_: React.FC<{ data: ExperienceEntry; showHeader?: boolean }> = ({ data, showHeader }) => (
    <div className="mb-2">
        {showHeader && <SectionHeader title="Professional Experience" />}
        <div className="flex justify-between resume-item-title">
            <span>{data.company_name}</span>
            <span className="resume-date-location font-normal">
                {formatDate(data.start_date)} – {data.is_current ? 'Present' : formatDate(data.end_date)}
            </span>
        </div>
        <div className="flex justify-between resume-item-subtitle">
            <span>{data.job_role}</span>
            <span className="resume-date-location not-italic">
                {[data.city, data.country].filter(Boolean).join(', ')}
            </span>
        </div>
        {data.job_description && (
            <p className="resume-content-text mt-1 whitespace-pre-line">{data.job_description}</p>
        )}
    </div>
);

const ProjectEntry_: React.FC<{ data: ProjectEntry; showHeader?: boolean }> = ({ data, showHeader }) => (
    <div className={showHeader ? "mb-3" : "mb-2"}>
        {showHeader && <SectionHeader title="Key Projects" />}
        <div className="flex justify-between resume-item-title">
            <span>{data.name}</span>
            {data.url && (
                <a href={data.url.startsWith('http') ? data.url : `https://${data.url}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-700 underline font-normal resume-date-location hover:text-blue-900">
                    {data.url.replace(/^https?:\/\//, '')}
                </a>
            )}
        </div>
        {data.technologies && (
            <p className="resume-content-text">
                <strong>Technologies:</strong> {data.technologies}
            </p>
        )}
        {data.description && <p className="resume-content-text italic mt-0.5">{data.description}</p>}
    </div>
);

const AchievementEntry_: React.FC<{ data: AchievementEntry; showHeader?: boolean }> = ({ data, showHeader }) => (
    <div className="mb-1">
        {showHeader && <SectionHeader title="Honors & Achievements" />}
        <span className="resume-item-title">{data.title}</span>
        {data.description && <span className="resume-content-text"> – {data.description}</span>}
    </div>
);

const CertificationEntry_: React.FC<{ data: CertificationEntry; showHeader?: boolean; isLast?: boolean }> = ({ data, showHeader, isLast }) => (
    <div className={showHeader ? 'mb-3' : (isLast ? '' : 'mb-1')}>
        {showHeader && <SectionHeader title="Certifications" />}
        <div className="resume-content-text">
            • {data.title}
            {data.issued_by && ` (${data.issued_by})`}
            {data.issue_date && ` - ${formatDate(data.issue_date)}`}
        </div>
    </div>
);

// Empty state component
const EmptyPreview: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <div className="text-6xl mb-4 opacity-30">📄</div>
        <h3 className="text-lg font-semibold text-foreground-secondary mb-2">No Preview Available</h3>
        <p className="text-sm text-foreground-secondary max-w-xs">
            Generate content for your sections to see a live preview of your ATS-optimized resume.
        </p>
    </div>
);

// Block type for partitioning
interface ContentBlock {
    id: string;
    type: 'contact' | 'summary' | 'education' | 'skills' | 'experience' | 'project' | 'achievement' | 'certification';
    data: any;
    showHeader: boolean;
    isLast?: boolean;
}

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
    const measuringRef = useRef<HTMLDivElement>(null);
    const [page1Blocks, setPage1Blocks] = useState<ContentBlock[]>([]);
    const [page2Blocks, setPage2Blocks] = useState<ContentBlock[]>([]);
    const [isReady, setIsReady] = useState(false);

    // Build list of all content blocks
    const buildBlocks = useCallback((): ContentBlock[] => {
        const blocks: ContentBlock[] = [];

        if (contact?.full_name) {
            blocks.push({ id: 'contact', type: 'contact', data: contact, showHeader: false });
        }
        if (summary) {
            const text = typeof summary === 'string' ? summary : (summary as any)?.text || (summary as any)?.summary || (summary as any)?.content || '';
            if (text && typeof text === 'string' && text.trim()) {
                blocks.push({ id: 'summary', type: 'summary', data: summary, showHeader: false });
            }
        }
        if (education && education.length > 0) {
            education.forEach((edu, i) => {
                blocks.push({ id: `education-${i}`, type: 'education', data: edu, showHeader: i === 0 });
            });
        }
        if (skills) {
            blocks.push({ id: 'skills', type: 'skills', data: skills, showHeader: false });
        }
        if (experience && experience.length > 0) {
            experience.forEach((exp, i) => {
                blocks.push({ id: `experience-${i}`, type: 'experience', data: exp, showHeader: i === 0 });
            });
        }
        if (projects && projects.length > 0) {
            // Sort projects: those with URLs (GitHub links) come first
            const sortedProjects = [...projects].sort((a, b) => {
                if (a.url && !b.url) return -1;
                if (!a.url && b.url) return 1;
                return 0;
            });
            sortedProjects.forEach((proj, i) => {
                blocks.push({ id: `project-${i}`, type: 'project', data: proj, showHeader: i === 0 });
            });
        }
        if (achievements && achievements.length > 0) {
            achievements.forEach((ach, i) => {
                blocks.push({ id: `achievement-${i}`, type: 'achievement', data: ach, showHeader: i === 0 });
            });
        }
        if (certifications && certifications.length > 0) {
            certifications.forEach((cert, i) => {
                blocks.push({
                    id: `certification-${i}`,
                    type: 'certification',
                    data: cert,
                    showHeader: i === 0,
                    isLast: i === certifications.length - 1
                });
            });
        }

        return blocks;
    }, [contact, summary, skills, education, experience, projects, achievements, certifications]);

    // Measure and partition blocks
    useEffect(() => {
        const allBlocks = buildBlocks();
        if (allBlocks.length === 0) {
            setIsReady(true);
            return;
        }

        // Delay to ensure DOM is painted
        const timer = setTimeout(() => {
            if (!measuringRef.current) return;

            const blockElements = measuringRef.current.querySelectorAll('[data-block-id]');
            const heights: Map<string, number> = new Map();

            blockElements.forEach((el) => {
                const id = el.getAttribute('data-block-id');
                if (id) {
                    heights.set(id, (el as HTMLElement).offsetHeight);
                }
            });

            // A4 printable area = 266.52mm ≈ 1007px at 96dpi
            const MAX_HEIGHT = 1007;
            let currentHeight = 0;
            const p1: ContentBlock[] = [];
            const p2: ContentBlock[] = [];

            allBlocks.forEach((block) => {
                const blockHeight = heights.get(block.id) || 0;
                if (currentHeight + blockHeight <= MAX_HEIGHT) {
                    p1.push(block);
                    currentHeight += blockHeight;
                } else {
                    // If this is NOT the first item of its section, we might need to add a header on page 2
                    if (!block.showHeader) {
                        // Find if this is the first of its type on page 2
                        const typeAlreadyOnPage2 = p2.some(b => b.type === block.type);
                        if (!typeAlreadyOnPage2) {
                            block = { ...block, showHeader: true };
                        }
                    }
                    p2.push(block);
                }
            });

            setPage1Blocks(p1);
            setPage2Blocks(p2);
            setIsReady(true);
        }, 150);

        return () => clearTimeout(timer);
    }, [buildBlocks]);

    // Render a single block
    const renderBlock = (block: ContentBlock) => {
        switch (block.type) {
            case 'contact':
                return <ContactEntry key={block.id} data={block.data} />;
            case 'summary':
                return <SummaryEntry key={block.id} data={block.data} />;
            case 'education':
                return <EducationEntry_ key={block.id} data={block.data} showHeader={block.showHeader} />;
            case 'skills':
                return <SkillsEntry key={block.id} data={block.data} />;
            case 'experience':
                return <ExperienceEntry_ key={block.id} data={block.data} showHeader={block.showHeader} />;
            case 'project':
                return <ProjectEntry_ key={block.id} data={block.data} showHeader={block.showHeader} />;
            case 'achievement':
                return <AchievementEntry_ key={block.id} data={block.data} showHeader={block.showHeader} />;
            case 'certification':
                return <CertificationEntry_ key={block.id} data={block.data} showHeader={block.showHeader} isLast={block.isLast} />;
            default:
                return null;
        }
    };

    const allBlocks = buildBlocks();
    if (allBlocks.length === 0) {
        return <EmptyPreview />;
    }

    const MARGIN_MM = "15.24mm";
    const showPage2 = page2Blocks.length > 0;

    return (
        <div className="a4-container">
            {/* Hidden measuring container */}
            <div
                ref={measuringRef}
                className="fixed -left-[9999px] top-0 pointer-events-none invisible"
                style={{ width: '210mm' }}
            >
                <div className="resume-content-wrapper">
                    {allBlocks.map((block) => (
                        <div key={block.id} data-block-id={block.id}>
                            {renderBlock(block)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Page 1 */}
            <div
                className="relative"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    marginBottom: `calc(${(scale - 1) * 297}mm + ${showPage2 ? '3rem' : '0px'})`
                }}
            >
                <div className="absolute -top-10 left-0 bg-background-secondary px-3 py-1 rounded-full border border-border shadow-sm text-[12px] font-bold text-primary z-20">
                    PAGE 1 {showPage2 && '/ 2'}
                </div>
                <div className="a4-page shadow-2xl overflow-hidden relative bg-white">
                    <div className="absolute top-0 left-0 right-0 z-10 bg-white" style={{ height: MARGIN_MM }} />
                    <div className="resume-content-wrapper bg-white">
                        {isReady ? page1Blocks.map(renderBlock) : allBlocks.map(renderBlock)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white" style={{ height: MARGIN_MM }} />
                </div>
            </div>

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
                    <div className="absolute -top-10 left-0 bg-background-secondary px-3 py-1 rounded-full border border-border shadow-sm text-[12px] font-bold text-primary z-20">
                        PAGE 2 / 2
                    </div>
                    <div className="a4-page shadow-2xl overflow-hidden relative bg-white">
                        <div className="absolute top-0 left-0 right-0 z-10 bg-white" style={{ height: MARGIN_MM }} />
                        <div className="resume-content-wrapper bg-white">
                            {page2Blocks.map(renderBlock)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 z-10 bg-white" style={{ height: MARGIN_MM }} />
                    </div>
                </div>
            )}
        </div>
    );
}

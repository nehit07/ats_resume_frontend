"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Icons } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/plans/`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <AnimatedBackground />
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden text-center px-4">

          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Icons.zap className="w-3 h-3" />
              AI-Powered Resume Optimization
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Your Resume. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Supercharged by AI.
              </span>
            </h1>

            <p className="text-base md:text-lg text-foreground-secondary/50 font-medium max-w-2xl mx-auto leading-relaxed">
              Resumify extracts your experience from LinkedIn and existing resumes to build professional,
              ATS-optimized profiles that get you past the screening bots.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary w-full sm:w-auto px-10 py-4 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Go to Dashboard
                  <Icons.chevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary w-full sm:w-auto px-10 py-4 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                    Get Started Free
                    <Icons.chevronRight className="w-5 h-5" />
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto px-10 py-4 text-base font-bold rounded-2xl bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-all">
                    How it works
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof Placeholder */}
            <div className="pt-12 flex flex-col items-center gap-4 opacity-40">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Trusted by thousands of job seekers</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 grayscale">
                <span className="text-xl font-black italic tracking-tighter">Google</span>
                <span className="text-xl font-black italic tracking-tighter">Meta</span>
                <span className="text-xl font-black italic tracking-tighter">Amazon</span>
                <span className="text-xl font-black italic tracking-tighter">Netflix</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-24 border-y border-foreground/5 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">How it Works</h2>
              <p className="text-sm text-foreground-secondary/40 max-w-md mx-auto">
                Build your professional profile in minutes with our simple 3-step AI workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: 1,
                  title: "Upload Resume",
                  desc: "Import your existing PDF or Word resume. Our AI extracts your core experience and skills automatically.",
                  color: "text-primary",
                  bg: "bg-primary/10 border-primary/20 shadow-primary/5",
                  badge: "bg-primary",
                  icon: Icons.upload
                },
                {
                  step: 2,
                  title: "Add LinkedIn",
                  desc: "Connect your LinkedIn profile for extra depth. We merge data from multiple sources for a richer final profile.",
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/10 border-indigo-400/20 shadow-indigo-400/5",
                  badge: "bg-indigo-400",
                  icon: Icons.linkedin
                },
                {
                  step: 3,
                  title: "AI Generates",
                  desc: "Our AI engine cleans, formats, and optimizes your data specifically to pass through ATS screening systems.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/5",
                  badge: "bg-emerald-400",
                  icon: Icons.zap
                }
              ].map((s: any) => (
                <div key={s.step} className="glass-card p-10 flex flex-col items-center text-center space-y-6 hover:translate-y-[-8px] transition-all duration-300 shadow-xl">
                  <div className={`w-20 h-20 rounded-3xl ${s.bg} border flex items-center justify-center mb-2 relative shadow-2xl`}>
                    <s.icon className={`w-10 h-10 ${s.color}`} />
                    <span className={`absolute -top-3 -right-3 w-8 h-8 ${s.badge} rounded-full text-xs font-black text-white flex items-center justify-center shadow-lg border-4 border-background`}>
                      {s.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="text-sm text-foreground-secondary/40 leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section id="features" className="py-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Packed with powerful <br className="hidden md:block" /> AI features</h2>
              <p className="text-sm text-foreground-secondary/40 max-w-md mx-auto">
                We've built everything you need to build a perfect resume.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
              {/* Feature 1: Large Bento */}
              <div className="md:col-span-2 md:row-span-2 glass-card p-10 flex flex-col justify-end gap-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 overflow-hidden relative group transition-all duration-300 shadow-xl">
                <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icons.bot className="w-48 h-48 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                  <Icons.bot className="w-12 h-12 text-primary" />
                  <h3 className="text-2xl font-black">Smart AI Extraction</h3>
                  <p className="text-sm text-foreground-secondary/50 font-medium leading-relaxed">
                    Our proprietary AI engine doesn't just copy-paste. It understands context, translates skills across domains, and highlights your most impactful achievements using the STAR method.
                  </p>
                </div>
              </div>

              {/* Feature 2: Wide Bento */}
              <div className="md:col-span-2 glass-card p-8 flex flex-col justify-center gap-3 bg-gradient-to-r from-indigo-500/5 to-transparent border-indigo-500/10 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icons.shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">ATS-Proof Check</h3>
                    <p className="text-xs text-foreground-secondary/50 font-medium leading-relaxed">Ensure your resume passes 99% of Applicant Tracking Systems globally.</p>
                  </div>
                </div>
              </div>

              {/* Feature 3: Normal Bento */}
              <div className="glass-card p-8 flex flex-col justify-end gap-3 bg-gradient-to-b from-emerald-500/5 to-transparent border-emerald-500/10 transition-all duration-300 shadow-xl">
                <Icons.layers className="w-8 h-8 text-emerald-400" />
                <h3 className="text-base font-bold">Multiple Formats</h3>
                <p className="text-[11px] text-foreground-secondary/50 font-medium">Download in PDF or Word formats for any application type.</p>
              </div>

              {/* Feature 4: Normal Bento */}
              <div className="glass-card p-8 flex flex-col justify-end gap-3 bg-gradient-to-b from-purple-500/5 to-transparent border-purple-500/10 transition-all duration-300 shadow-xl">
                <Icons.merge className="w-8 h-8 text-purple-400" />
                <h3 className="text-base font-bold">Data Merging</h3>
                <p className="text-[11px] text-foreground-secondary/50 font-medium">Sync resume and LinkedIn data seamlessly into one profile.</p>
              </div>

              {/* Feature 5: Wide Middle Bento */}
              <div className="md:col-span-2 glass-card p-8 flex border-dashed border-foreground/10 items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300 shadow-lg">
                <div className="w-20 h-20 shrink-0 border border-foreground/5 rounded-2xl bg-foreground/5 p-4 flex items-center justify-center">
                  <Icons.refresh className="w-10 h-10 text-foreground-secondary/20 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Instant Updates</h3>
                  <p className="text-xs text-foreground-secondary/40 leading-relaxed font-medium">
                    Changes to your profile are reflected across all resume templates instantly. Build once, deploy anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 border-y border-foreground/5 px-4 overflow-hidden relative">

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight italic uppercase skew-x-[-4deg]">Pricing that <br className="md:hidden" /> gets you hired</h2>
              <p className="text-sm text-foreground-secondary/40 max-w-md mx-auto">
                Start for free and upgrade as you grow. No hidden fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.length > 0 ? (
                plans.map((plan) => {
                  let uiPlan: any = {};

                  if (plan.name === "free") {
                    uiPlan = {
                      name: "Free",
                      desc: "For job seekers starting out",
                      features: ["1 AI-optimized Resume", "PDF Export only", "Standard Templates", "Basic Support"],
                      btn: "Get Started",
                      primary: false
                    };
                  } else if (plan.name === "beta") {
                    uiPlan = {
                      name: "Beta",
                      desc: "For career professionals",
                      features: ["15 Resumes/mo", "30 Exports/mo", "LinkedIn Import", "Basic Templates", "Email Support"],
                      btn: "Get Beta",
                      primary: true
                    };
                  } else if (plan.name === "pro") {
                    uiPlan = {
                      name: "Pro",
                      desc: "For power users",
                      features: ["Unlimited Resumes", "Unlimited Exports", "Priority Support", "Premium Templates", "Version Control"],
                      btn: "Go Pro",
                      primary: false
                    };
                  } else {
                    // Fallback for unknown plans
                    uiPlan = {
                      name: plan.display_name,
                      desc: plan.description || "Subscription Plan",
                      features: [],
                      btn: "Subscribe",
                      primary: false
                    }
                  }

                  return (
                    <div key={plan.name} className={`glass-card p-10 flex flex-col gap-8 relative overflow-hidden transition-all duration-300 shadow-xl ${uiPlan.primary ? 'ring-2 ring-primary border-primary/30 scale-105 z-10 shadow-primary/10' : 'hover:scale-102 hover:shadow-2xl'}`}>
                      {uiPlan.primary && <div className="absolute top-6 right-6 px-3 py-1 bg-primary text-[8px] font-black italic uppercase tracking-widest text-white rounded-full">Popular</div>}

                      <div className="space-y-4 text-center pb-8 border-b border-foreground/5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground-secondary/50">{uiPlan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-black italic">₹</span>
                          <span className="text-6xl font-black italic">{Math.floor(plan.pricing.monthly)}</span>
                          <span className="text-xs font-bold text-foreground-secondary/40">/mo</span>
                        </div>
                        <p className="text-xs font-medium text-foreground-secondary/40">{uiPlan.desc}</p>
                      </div>

                      <ul className="space-y-4 flex-1">
                        {uiPlan.features.map((f: string) => (
                          <li key={f} className="flex items-center gap-3 text-xs font-bold text-foreground-secondary">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-foreground/5 ${uiPlan.primary ? 'bg-primary/10 text-primary' : 'bg-foreground/5'}`}>
                              <Icons.check className="w-3 h-3" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button className={`w-full py-4 text-sm font-black italic uppercase tracking-widest rounded-2xl transition-all shadow-lg ${uiPlan.primary ? 'btn-primary shadow-primary/25 hover:shadow-primary/40 active:scale-95' : 'bg-foreground/5 border border-foreground/10 hover:bg-foreground/10'}`}>
                        {uiPlan.btn}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-10 opacity-50">Loading pricing...</div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">FAQ</h2>
              <p className="text-sm text-foreground-secondary/40">Everything you need to know about Resumify.</p>
            </div>

            <div className="space-y-4 font-medium">
              {[
                { q: "How does the AI optimize my resume?", a: "Our AI analyzes keywords from thousands of successful job descriptions and applies specific formatting and phrasing patterns that ATS screening tools look for." },
                { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your Pro plan at any time through your dashboard settings. You'll keep access until the end of your billing period." },
                { q: "Is my personal data secure?", a: "Absolutely. We use industry-standard encryption and never share your data with third parties. Your data is used only to build your profile." },
                { q: "Can I export to both PDF and Word?", a: "Yes, our Pro plan includes support for both formats to give you maximum flexibility during the application process." }
              ].map((item, i) => (
                <details key={i} className="glass-card group transition-all duration-300">
                  <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-bold text-foreground">
                    {item.q}
                    <Icons.plus className="w-5 h-5 text-foreground-secondary/40 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-foreground-secondary/50 leading-relaxed border-t border-foreground/5 pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 border-t border-foreground/5 px-4 overflow-hidden relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                About{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Resumify
                </span>
              </h2>
              <p className="text-sm text-foreground-secondary/40 max-w-2xl mx-auto leading-relaxed">
                We believe your skills deserve to be seen — not filtered out by a machine.
                Resumify was born from a simple frustration: talented people getting rejected
                by ATS bots before a human ever reads their resume.
              </p>
            </div>

            {/* Mission Card */}
            <div className="glass-card p-10 md:p-14 mb-8 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 border-primary/10 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                <Icons.bot className="w-56 h-56 rotate-12" />
              </div>
              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  <Icons.zap className="w-3 h-3" />
                  Our Mission
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-snug">
                  Bridge the gap between talent and opportunity through intelligent resume optimization.
                </h3>
                <p className="text-sm text-foreground-secondary/50 font-medium leading-relaxed">
                  Resumify uses advanced AI to extract, clean, and restructure your professional
                  data from multiple sources — LinkedIn profiles and existing resumes — into a
                  single, polished, ATS-optimized document that gets you past screening bots and
                  into the interview room.
                </p>
              </div>
            </div>

            {/* Tech Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Icons.bot,
                  title: "AI Extraction Engine",
                  desc: "Powered by state-of-the-art LLMs that understand context, not just keywords. Your experience is interpreted, not just copied.",
                  color: "text-primary",
                  bg: "bg-primary/10 border-primary/20",
                },
                {
                  icon: Icons.merge,
                  title: "Multi-Source Merging",
                  desc: "We fuse data from your uploaded resume and LinkedIn profile into one rich, deduplicated professional profile.",
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/10 border-indigo-400/20",
                },
                {
                  icon: Icons.shield,
                  title: "ATS Optimization",
                  desc: "Every output is structured, formatted, and phrased to sail through Applicant Tracking Systems used by top companies.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10 border-emerald-400/20",
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="glass-card p-8 flex flex-col gap-4 hover:translate-y-[-4px] transition-all duration-300 shadow-xl"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${pillar.bg} border flex items-center justify-center`}
                  >
                    <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                  </div>
                  <h3 className="text-base font-bold">{pillar.title}</h3>
                  <p className="text-xs text-foreground-secondary/50 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Built By */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground-secondary/30">
                Built with passion for the modern job seeker
              </p>
              <p className="text-xs text-foreground-secondary/20 font-medium">
                Designed &amp; Developed as an AI-Powered Product
              </p>
            </div>
          </div>
        </section>

        {/* PRIVACY POLICY SECTION */}
        <section id="privacy" className="py-24 border-t border-foreground/5 px-4 overflow-hidden relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                Privacy{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Policy
                </span>
              </h2>
              <p className="text-sm text-foreground-secondary/40 max-w-2xl mx-auto leading-relaxed">
                Your privacy matters to us. Here&apos;s how we handle your data with care and transparency.
              </p>
            </div>

            {/* Commitment Card */}
            <div className="glass-card p-10 md:p-14 mb-8 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5 border-emerald-500/10 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                <Icons.shield className="w-56 h-56 rotate-12" />
              </div>
              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <Icons.shield className="w-3 h-3" />
                  Our Commitment
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-snug">
                  We never sell, share, or misuse your personal data. Period.
                </h3>
                <p className="text-sm text-foreground-secondary/50 font-medium leading-relaxed">
                  Resumify is built with a privacy-first approach. Your resumes, LinkedIn data,
                  and personal information are used solely to generate your optimized profile —
                  nothing more.
                </p>
              </div>
            </div>

            {/* Policy Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Data We Collect",
                  items: [
                    "Account information (name, email) for authentication",
                    "Uploaded resumes and LinkedIn profile data for AI processing",
                    "Usage analytics to improve our service quality",
                  ],
                },
                {
                  title: "How We Use It",
                  items: [
                    "Generate and optimize your ATS-friendly resume",
                    "Merge data from multiple sources into a unified profile",
                    "Improve our AI models and user experience",
                  ],
                },
                {
                  title: "Data Security",
                  items: [
                    "Industry-standard encryption for data in transit and at rest",
                    "Secure authentication with JWT tokens",
                    "Regular security audits and best practices",
                  ],
                },
                {
                  title: "Your Rights",
                  items: [
                    "Download or delete your data at any time from your dashboard",
                    "Opt out of analytics and non-essential data collection",
                    "Request a full copy of all data we store about you",
                  ],
                },
              ].map((block) => (
                <div
                  key={block.title}
                  className="glass-card p-8 flex flex-col gap-4 hover:translate-y-[-4px] transition-all duration-300 shadow-xl"
                >
                  <h3 className="text-base font-bold">{block.title}</h3>
                  <ul className="space-y-3">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-foreground-secondary/50 font-medium leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Icons.check className="w-3 h-3 text-emerald-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Last Updated */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground-secondary/30">
                Last updated: February 2026
              </p>
              <p className="text-xs text-foreground-secondary/20 font-medium">
                Questions? Reach out at privacy@resumify.ai
              </p>
            </div>
          </div>
        </section>

        {/* TERMS OF SERVICE SECTION */}
        <section id="terms" className="py-24 border-t border-foreground/5 px-4 overflow-hidden relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                Terms of{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Service
                </span>
              </h2>
              <p className="text-sm text-foreground-secondary/40 max-w-2xl mx-auto leading-relaxed">
                By using Resumify, you agree to the following terms. We&apos;ve kept them simple and fair.
              </p>
            </div>

            {/* Overview Card */}
            <div className="glass-card p-10 md:p-14 mb-8 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 border-indigo-500/10 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                <Icons.layers className="w-56 h-56 rotate-12" />
              </div>
              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                  <Icons.layers className="w-3 h-3" />
                  Agreement Overview
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-snug">
                  Fair terms that respect both your rights and our service.
                </h3>
                <p className="text-sm text-foreground-secondary/50 font-medium leading-relaxed">
                  These terms govern your use of Resumify&apos;s platform, including AI-powered resume
                  generation, data processing, and account management. We believe in transparency
                  and keeping legal language understandable.
                </p>
              </div>
            </div>

            {/* Terms Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Service Usage",
                  items: [
                    "Resumify is provided for personal, professional resume building purposes",
                    "You must provide accurate information when creating your account",
                    "Automated scraping or bulk misuse of the service is prohibited",
                  ],
                },
                {
                  title: "Intellectual Property",
                  items: [
                    "You retain full ownership of all content you upload to Resumify",
                    "AI-generated resume outputs are yours to use freely and without restriction",
                    "The Resumify platform, branding, and AI models remain our property",
                  ],
                },
                {
                  title: "Account Responsibilities",
                  items: [
                    "You are responsible for maintaining the security of your account credentials",
                    "You must be at least 16 years old to create an account and use our services",
                    "We reserve the right to suspend accounts that violate these terms",
                  ],
                },
                {
                  title: "Limitation of Liability",
                  items: [
                    "Resumify is provided \"as is\" — we do not guarantee job placement outcomes",
                    "We are not liable for decisions made by employers based on your resume",
                    "Service availability may vary; we strive for maximum uptime but cannot guarantee it",
                  ],
                },
              ].map((block) => (
                <div
                  key={block.title}
                  className="glass-card p-8 flex flex-col gap-4 hover:translate-y-[-4px] transition-all duration-300 shadow-xl"
                >
                  <h3 className="text-base font-bold">{block.title}</h3>
                  <ul className="space-y-3">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-foreground-secondary/50 font-medium leading-relaxed">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Icons.check className="w-3 h-3 text-indigo-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Effective Date */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground-secondary/30">
                Effective: February 2026
              </p>
              <p className="text-xs text-foreground-secondary/20 font-medium">
                Questions about these terms? Contact us at legal@resumify.ai
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24 border-t border-foreground/5 px-4 overflow-hidden relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                Get in{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Touch
                </span>
              </h2>
              <p className="text-sm text-foreground-secondary/40 max-w-2xl mx-auto leading-relaxed">
                Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
              </p>
            </div>

            {/* Contact Header Card */}
            <div className="glass-card p-10 md:p-14 mb-8 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 border-purple-500/10 shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                <Icons.activity className="w-56 h-56 rotate-12" />
              </div>
              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                  <Icons.activity className="w-3 h-3" />
                  We&apos;re Here to Help
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-snug">
                  Whether it&apos;s a bug report, feature request, or career advice — reach out anytime.
                </h3>
                <p className="text-sm text-foreground-secondary/50 font-medium leading-relaxed">
                  Our team is committed to providing quick and helpful responses.
                  We typically respond within 24 hours on business days.
                </p>
              </div>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Email Us",
                  desc: "For general inquiries and support requests.",
                  detail: "support@resumify.ai",
                  color: "text-primary",
                  bg: "bg-primary/10 border-primary/20",
                  icon: Icons.file,
                },
                {
                  title: "Connect Socially",
                  desc: "Follow us for updates, tips, and career resources.",
                  detail: "LinkedIn & Twitter",
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/10 border-indigo-400/20",
                  icon: Icons.linkedin,
                },
                {
                  title: "Help & Support",
                  desc: "Check our FAQ or reach out for technical assistance.",
                  detail: "help@resumify.ai",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10 border-purple-400/20",
                  icon: Icons.shield,
                },
              ].map((method) => (
                <div
                  key={method.title}
                  className="glass-card p-8 flex flex-col items-center text-center gap-4 hover:translate-y-[-4px] transition-all duration-300 shadow-xl"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${method.bg} border flex items-center justify-center`}
                  >
                    <method.icon className={`w-7 h-7 ${method.color}`} />
                  </div>
                  <h3 className="text-base font-bold">{method.title}</h3>
                  <p className="text-xs text-foreground-secondary/50 font-medium leading-relaxed">
                    {method.desc}
                  </p>
                  <span className={`text-xs font-bold ${method.color}`}>
                    {method.detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Response Time */}
            <div className="text-center mt-12 space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground-secondary/30">
                Average response time: Under 24 hours
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-4 relative">
          <div className="max-w-4xl mx-auto glass-card p-16 md:p-24 text-center space-y-10 relative shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Ready to land your <br className="hidden md:block" /> dream job?</h2>
            <p className="text-base md:text-lg text-foreground-secondary/50 font-medium max-w-xl mx-auto">
              Join thousands of job seekers using Resumify to double their interview callback rates.
            </p>
            <div className="pt-4">
              <Link href="/register" className="btn-primary inline-flex px-12 py-5 text-lg font-black italic uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all gap-4 items-center">
                Start Your Journey Free
                <Icons.chevronRight className="w-6 h-6 animate-pulse" />
              </Link>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground-secondary/30">Takes less than 2 minutes to set up</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

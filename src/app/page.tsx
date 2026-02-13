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

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 border-y border-foreground/5 px-4 overflow-hidden relative">

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight italic uppercase skew-x-[-4deg]">Pricing that <br className="md:hidden" /> gets you hired</h2>
              <p className="text-sm text-foreground-secondary/40 max-w-md mx-auto">
                Start for free and upgrade as you grow. No hidden fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Basic", price: "0", desc: "For job seekers starting out",
                  features: ["1 AI-optimized Resume", "PDF Export only", "Standard Templates", "Basic Support"],
                  btn: "Get Started", primary: false
                },
                {
                  name: "Pro", price: "19", desc: "For career professionals",
                  features: ["Unlimited Resumes", "LinkedIn Import", "Word & PDF Export", "Premium Templates", "Priority Support", "Version Control"],
                  btn: "Go Pro Now", primary: true
                },
                {
                  name: "Enterprise", price: "99", desc: "For recruitment teams",
                  features: ["Team Management", "Branded Templates", "Bulk AI Processing", "API Access", "Custom Support"],
                  btn: "Contact Sales", primary: false
                }
              ].map((plan) => (
                <div key={plan.name} className={`glass-card p-10 flex flex-col gap-8 relative overflow-hidden transition-all duration-300 shadow-xl ${plan.primary ? 'ring-2 ring-primary border-primary/30 scale-105 z-10 shadow-primary/10' : 'hover:scale-102 hover:shadow-2xl'}`}>
                  {plan.primary && <div className="absolute top-6 right-6 px-3 py-1 bg-primary text-[8px] font-black italic uppercase tracking-widest text-white rounded-full">Popular</div>}

                  <div className="space-y-4 text-center pb-8 border-b border-foreground/5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground-secondary/50">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black italic">$</span>
                      <span className="text-6xl font-black italic">{plan.price}</span>
                      <span className="text-xs font-bold text-foreground-secondary/40">/month</span>
                    </div>
                    <p className="text-xs font-medium text-foreground-secondary/40">{plan.desc}</p>
                  </div>

                  <ul className="space-y-4 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-xs font-bold text-foreground-secondary">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-foreground/5 ${plan.primary ? 'bg-primary/10 text-primary' : 'bg-foreground/5'}`}>
                          <Icons.check className="w-3 h-3" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-4 text-sm font-black italic uppercase tracking-widest rounded-2xl transition-all shadow-lg ${plan.primary ? 'btn-primary shadow-primary/25 hover:shadow-primary/40 active:scale-95' : 'bg-foreground/5 border border-foreground/10 hover:bg-foreground/10'}`}>
                    {plan.btn}
                  </button>
                </div>
              ))}
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sparkles,
  ArrowRight,
  Calculator,
  Code2,
  Atom,
  Cpu,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Server,
  Zap,
  CheckCircle2,
  BrainCircuit,
  BarChart3,
  FileText,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";

export default function LandingPage() {
  // Interactive live preview query state
  const [demoPrompt, setDemoPrompt] = useState(
    "Solve \\int x^2 \\cos(x) dx step-by-step and verify the boundary conditions."
  );
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleRunDemo = async () => {
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: demoPrompt,
          mode: "STEP_BY_STEP_SOLVER",
          level: "UNDERGRADUATE",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value);
          setDemoResult(accumulated);
        }
      }
    } catch (e) {
      console.error(e);
      setDemoResult("System operational. Connect to live inference to execute.");
    } finally {
      setDemoLoading(false);
    }
  };

  const disciplines = [
    {
      name: "Mathematics",
      icon: Calculator,
      topics: ["Calculus", "Linear Algebra", "Differential Equations", "Discrete Math", "Real Analysis"],
      gradient: "from-blue-600/20 to-cyan-500/10",
      accent: "text-blue-400",
    },
    {
      name: "Computer Science",
      icon: Code2,
      topics: ["Data Structures & Algorithms", "Operating Systems", "Computer Networks", "DBMS", "Compilers"],
      gradient: "from-cyan-600/20 to-teal-500/10",
      accent: "text-cyan-400",
    },
    {
      name: "Physics & Engineering",
      icon: Atom,
      topics: ["Quantum Mechanics", "Electromagnetism", "Thermodynamics", "Signal Processing", "Control Systems"],
      gradient: "from-indigo-600/20 to-purple-500/10",
      accent: "text-indigo-400",
    },
    {
      name: "Humanities & Law",
      icon: BookOpen,
      topics: ["Economics", "Jurisprudence", "Philosophy & Ethics", "Political Theory", "Cognitive Psychology"],
      gradient: "from-purple-600/20 to-pink-500/10",
      accent: "text-purple-400",
    },
  ];

  const modes = [
    {
      title: "Step-by-Step Solver",
      desc: "Solves problems with numbered derivations, formulas, substitutions, and verified final answers.",
      badge: "Mathematics & Logic",
    },
    {
      title: "College Examination Mode",
      desc: "Answers formatted for university papers: Definition, Principle, Schematic Diagram, Pros/Cons, Applications.",
      badge: "University Standard",
    },
    {
      title: "Socratic Academic Tutor",
      desc: "Never spoils the answer; asks guiding questions to lead learners to self-discovered breakthroughs.",
      badge: "Pedagogy",
    },
    {
      title: "Textbook Intelligence (RAG)",
      desc: "Retrieves passages from uploaded PDFs and provides factual answers with exact page and section citations.",
      badge: "Zero Hallucination",
    },
    {
      title: "Programming Specialist",
      desc: "Full-stack code generation, debugging, Big-O complexity analysis, and safe sandboxed execution.",
      badge: "Code & Systems",
    },
    {
      title: "Assessment & Quiz Generator",
      desc: "Generates multiple-choice, true/false, and short answer examinations with automatic scoring and diagnostic reports.",
      badge: "Assessments",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 md:pt-32 md:pb-40 overflow-hidden bg-grid-pattern">
        {/* Radiant Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] radiant-glow pointer-events-none opacity-50"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 radiant-cyan-glow pointer-events-none opacity-20"></div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-[11px] sm:text-xs font-medium shadow-xl shadow-blue-900/20 max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Open-Weight Models • Google Search • Textbook RAG</span>
          </div>

          {/* Headline */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-[1.1]">
              Your intelligence.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                Expanded.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-slate-400 leading-relaxed font-normal">
              Learn, explore, understand, and solve anything. Your personal AI academic companion powered by open-source intelligence.
            </p>
          </div>

          {/* Philosophy Statement */}
          <div className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] sm:text-sm font-mono text-cyan-300 tracking-wide max-w-full">
            Understanding first. Answers backed by knowledge.
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-md sm:max-w-none mx-auto w-full">
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all group"
            >
              <span>Launch Academic Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/documents"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Query Textbooks (RAG)</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Learning Hub</span>
            </Link>
          </div>

          {/* Live Interactive Chatbot Preview Widget */}
          <div className="pt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/15 bg-[#050b18]/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <span className="font-mono text-slate-400 ml-2">EXAM MIND AI Academic Preview</span>
                </div>
                <span className="font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px]">
                  Mode: STEP-BY-STEP SOLVER
                </span>
              </div>

              {/* Input & Run */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleRunDemo}
                  disabled={demoLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{demoLoading ? "Solving..." : "Test Solve"}</span>
                </button>
              </div>

              {/* Output Preview Window */}
              {demoResult && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm max-h-96 overflow-y-auto">
                  <MarkdownRenderer content={demoResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Universal Academic Coverage Section */}
      <section className="py-24 border-t border-white/[0.08] bg-[#040814]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              Universal Discipline Intelligence
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Mastery Across All Academic Frontiers
            </h3>
            <p className="text-sm text-slate-400">
              From foundational arithmetic to doctoral-level mathematical physics, distributed systems, and jurisprudence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${d.gradient} backdrop-blur-md space-y-4 hover:border-blue-500/40 transition-all`}
                >
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/10 w-fit ${d.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{d.name}</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {d.topics.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9 Teaching Modes Section */}
      <section className="py-24 border-t border-white/[0.08] bg-[#030712] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-blue-400 font-mono font-semibold">
              Pedagogical Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Dedicated Educational Teaching Engine
            </h3>
            <p className="text-sm text-slate-400">
              Not just an answer generator. EXAM MIND AI determines the exact pedagogical format that maximizes student comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((mode, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-cyan-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {mode.badge}
                  </span>
                  <h4 className="text-base font-bold text-white">{mode.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-medium">
                  <span>Explore Mode</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open-Source Model Architecture */}
      <section className="py-24 border-t border-white/[0.08] bg-[#050b18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              Open-Weight AI Stack
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Open-Source Independence
            </h3>
            <p className="text-sm text-slate-400">
              Never locked into a single proprietary API. Designed for high-throughput GPU inference with vLLM, DeepSeek-R1, and Qwen 2.5.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-3">
              <Server className="w-6 h-6 text-blue-400" />
              <h4 className="text-base font-bold text-white">vLLM GPU Acceleration</h4>
              <p className="text-slate-400 leading-relaxed">
                PagedAttention and continuous batching support high concurrency, fast time-to-first-token, and low per-student inference cost.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-3">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h4 className="text-base font-bold text-white">pgvector Semantic Retrieval</h4>
              <p className="text-slate-400 leading-relaxed">
                Hybrid keyword and vector similarity guarantees that every textbook answer cites exact page numbers without hallucination.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 space-y-3">
              <Activity className="w-6 h-6 text-emerald-400" />
              <h4 className="text-base font-bold text-white">Dynamic Model Orchestration</h4>
              <p className="text-slate-400 leading-relaxed">
                Administrators can hot-swap models, configure sampling temperatures, and switch endpoints directly through environment variables or the admin UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#030712] to-[#060e22]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Elevate Your Academic Potential Today.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience the next era of universal educational intelligence. Answers grounded in science, proofs verified in mathematics, and learning without limits.
          </p>
          <div className="pt-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all"
            >
              <span>Begin Learning Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#02050d] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              E
            </div>
            <span className="font-bold text-white text-sm">EXAM MIND AI</span>
            <span className="text-[11px] text-slate-400">Universal Exam & Academic Intelligence</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/chat" className="hover:text-white transition-colors">Chat</Link>
            <Link href="/documents" className="hover:text-white transition-colors">Library (RAG)</Link>
            <Link href="/quizzes" className="hover:text-white transition-colors">Assessments</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Model Health</Link>
          </div>

          <div>
            &copy; 2026 EXAM MIND AI. Deployable on Vercel.
          </div>
        </div>
      </footer>
    </div>
  );
}

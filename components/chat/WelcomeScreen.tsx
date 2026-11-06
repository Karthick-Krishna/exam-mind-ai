"use client";

import React from "react";
import {
  Sparkles,
  Globe,
  ArrowRight,
  Calculator,
  Code2,
  Database
} from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string, mode?: ResponseMode) => void;
  currentMode?: ResponseMode;
  onSelectMode?: (mode: ResponseMode) => void;
}

export function WelcomeScreen({
  onSelectPrompt,
}: WelcomeScreenProps) {
  const suggestedCards = [
    {
      title: "Core Identity & Superiority",
      desc: "Who created ExamMind AI, and how does it surpass unumancorps?",
      prompt: "Who are you, who created you, and how does ExamMind AI compare with unumancorps?",
      icon: Sparkles,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-blue-500/20 to-indigo-500/10",
      accent: "text-blue-400",
      badge: "CoralGenz Global",
    },
    {
      title: "Direct Answer & Fact Search",
      desc: "Who is the Chief Minister of Tamil Nadu? (Verified live data as of today)",
      prompt: "Who is the Chief Minister of Tamil Nadu?",
      icon: Globe,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-cyan-400",
      badge: "Deep Search",
    },
    {
      title: "Step-by-Step Differentiation",
      desc: "Differentiate x^3 + 5x^2 + 2x with verified symbolic steps.",
      prompt: "Differentiate x^3 + 5x^2 + 2x with respect to x.",
      icon: Calculator,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-cyan-500/20 to-blue-500/10",
      accent: "text-cyan-400",
      badge: "Deep Search",
    },
    {
      title: "Lagrange's Mean Value Theorem",
      desc: "Exhaustive conditions, mathematical proof, geometric intuition & worked example.",
      prompt: "Explain and solve Lagrange's Mean Value Theorem with conditions and a solved example.",
      icon: Calculator,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-purple-500/20 to-indigo-500/10",
      accent: "text-purple-400",
      badge: "Deep Search",
    },
    {
      title: "Optimal Java Prime Checker",
      desc: "Executable Java program with O(sqrt(n)) complexity proof and boundary validation.",
      prompt: "Write a Java program to check whether a number is prime, with explanation and complexity.",
      icon: Code2,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-emerald-500/20 to-cyan-500/10",
      accent: "text-emerald-400",
      badge: "Deep Search",
    },
    {
      title: "Database Normalization (1NF to 3NF)",
      desc: "Deep-dive with real-world schemas, functional dependencies, and anomalies.",
      prompt: "Explain database normalization (1NF, 2NF, 3NF) with practical examples.",
      icon: Database,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-cyan-400",
      badge: "Deep Search",
    },
    {
      title: "Live Web & Scientific Research",
      desc: "Who won the Nobel prize in Physics in 2024? (Multi-source research dossier)",
      prompt: "Who won the Nobel prize in Physics in 2024?",
      icon: Globe,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-indigo-500/20 to-blue-500/10",
      accent: "text-indigo-400",
      badge: "Deep Search",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-2.5 sm:px-6 md:px-8 py-3 sm:py-8 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[80vh]">
      <div className="max-w-4xl w-full space-y-4 sm:space-y-6 text-center">
        {/* Brand Logo & Headline */}
        <div className="space-y-2.5 sm:space-y-4 flex flex-col items-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-blue-500/40 p-0.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400">
            <img
              src="/logo.png"
              alt="EXAM MIND AI Logo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-[10px] sm:text-xs font-medium shadow-lg shadow-blue-900/20 max-w-full">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="truncate">EXAM MIND AI • Created by CoralGenz Global</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
            Master Any Exam or Topic. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Pure Intelligence.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed px-1">
            Proprietary multimodal neural architecture engineered by CoralGenz Global. Advanced real-time deep web research across Google, deterministic mathematics verification, and full-stack software intelligence.
          </p>
        </div>

        {/* Deep Search Engine Permanent Active Indicator */}
        <div className="pt-0.5 pb-0.5 flex justify-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-blue-950/70 border border-blue-500/30 text-[11px] sm:text-xs font-semibold text-cyan-300 shadow-md">
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Deep Search Active Across All Sites on Google</span>
          </div>
        </div>

        {/* Suggested Queries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5 pt-1 sm:pt-4 text-left">
          {suggestedCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectPrompt(card.prompt, card.mode)}
                className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/80 hover:border-blue-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2 sm:space-y-3 shadow-lg active:scale-[0.98]"
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br ${card.color} border border-white/10 flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.accent}`} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px] sm:text-[11px] font-medium text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <span>Explore topic</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

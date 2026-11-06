"use client";

import React from "react";
import {
  Sparkles,
  Globe,
  Zap,
  Brain,
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
  currentMode = "DEEP_SEARCH",
  onSelectMode,
}: WelcomeScreenProps) {
  const suggestedCards = [
    {
      title: "Direct Answer & Fact Search",
      desc: "Who is the Chief Minister of Tamil Nadu? (Verified live data as of today)",
      prompt: "Who is the Chief Minister of Tamil Nadu?",
      icon: Zap,
      mode: "QUICK_ANSWER" as ResponseMode,
      color: "from-amber-500/20 to-orange-500/10",
      accent: "text-amber-400",
      badge: "Quick Answer",
    },
    {
      title: "Step-by-Step Differentiation",
      desc: "Differentiate x^3 + 5x^2 + 2x with verified symbolic steps.",
      prompt: "Differentiate x^3 + 5x^2 + 2x with respect to x.",
      icon: Calculator,
      mode: "QUICK_ANSWER" as ResponseMode,
      color: "from-cyan-500/20 to-blue-500/10",
      accent: "text-cyan-400",
      badge: "Math Solver",
    },
    {
      title: "Lagrange's Mean Value Theorem",
      desc: "Exhaustive conditions, mathematical proof, geometric intuition & worked example.",
      prompt: "Explain and solve Lagrange's Mean Value Theorem with conditions and a solved example.",
      icon: Brain,
      mode: "THINKING" as ResponseMode,
      color: "from-purple-500/20 to-indigo-500/10",
      accent: "text-purple-400",
      badge: "Thinking",
    },
    {
      title: "Optimal Java Prime Checker",
      desc: "Executable Java program with O(sqrt(n)) complexity proof and boundary validation.",
      prompt: "Write a Java program to check whether a number is prime, with explanation and complexity.",
      icon: Code2,
      mode: "THINKING" as ResponseMode,
      color: "from-emerald-500/20 to-cyan-500/10",
      accent: "text-emerald-400",
      badge: "Code Sandbox",
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
            <span className="truncate">EXAM MIND AI • Gemini-Grade Intelligence</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-snug sm:leading-tight">
            Master Any Exam or Topic. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Pure Intelligence.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed px-1">
            Connected to dual open-source AI engines (GPT-OSS & Qwen 2.5) with real-time web search, deterministic mathematical verification, and isolated code execution.
          </p>
        </div>

        {/* 3-Mode Selector Bar */}
        <div className="pt-0.5 pb-0.5 flex justify-center">
          <div className="inline-flex items-center p-1 rounded-xl bg-black/60 border border-white/10 gap-1 text-xs">
            <button
              onClick={() => onSelectMode?.("QUICK_ANSWER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentMode === "QUICK_ANSWER"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Answer</span>
            </button>
            <button
              onClick={() => onSelectMode?.("THINKING")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentMode === "THINKING"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Thinking</span>
            </button>
            <button
              onClick={() => onSelectMode?.("DEEP_SEARCH")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentMode === "DEEP_SEARCH"
                  ? "bg-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Deep Search</span>
            </button>
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

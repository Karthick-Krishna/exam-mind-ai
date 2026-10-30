"use client";

import React from "react";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  ArrowRight,
  Calculator,
  Code2,
  Atom,
  Database
} from "lucide-react";
import { RESPONSE_MODES, ResponseMode } from "@/lib/ai/prompts";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string, mode?: ResponseMode) => void;
  currentMode: ResponseMode;
  onSelectMode: (mode: ResponseMode) => void;
}

export function WelcomeScreen({
  onSelectPrompt,
  currentMode,
  onSelectMode,
}: WelcomeScreenProps) {
  const suggestedCards = [
    {
      title: "Direct Answer & Fact Search",
      desc: "Who is the Chief Minister of Tamil Nadu?",
      prompt: "Who is the Chief Minister of Tamil Nadu?",
      icon: Zap,
      mode: "QUICK_ANSWER" as ResponseMode,
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-cyan-400",
      badge: "Quick Answer",
    },
    {
      title: "Academic Theorem & Proof",
      desc: "Explain and solve Lagrange's Mean Value Theorem with conditions & examples.",
      prompt: "Explain and solve Lagrange's Mean Value Theorem with conditions and a solved example.",
      icon: Brain,
      mode: "THINKING" as ResponseMode,
      color: "from-indigo-500/20 to-blue-500/10",
      accent: "text-indigo-400",
      badge: "Thinking",
    },
    {
      title: "Step-by-Step Differentiation",
      desc: "Differentiate x^3 + 5x^2 + 2x with intermediate derivation steps.",
      prompt: "Differentiate x^3 + 5x^2 + 2x with respect to x.",
      icon: Calculator,
      mode: "THINKING" as ResponseMode,
      color: "from-cyan-500/20 to-blue-500/10",
      accent: "text-cyan-400",
      badge: "Thinking",
    },
    {
      title: "Programming & Code Explanation",
      desc: "Write an executable Java program to check whether a number is prime.",
      prompt: "Write a Java program to check whether a number is prime, with explanation and complexity.",
      icon: Code2,
      mode: "THINKING" as ResponseMode,
      color: "from-emerald-500/20 to-cyan-500/10",
      accent: "text-emerald-400",
      badge: "Thinking",
    },
    {
      title: "Database Normalization",
      desc: "Explain 1NF, 2NF, and 3NF with practical database tables and examples.",
      prompt: "Explain database normalization (1NF, 2NF, 3NF) with practical examples.",
      icon: Database,
      mode: "QUICK_ANSWER" as ResponseMode,
      color: "from-purple-500/20 to-indigo-500/10",
      accent: "text-purple-400",
      badge: "Quick Answer",
    },
    {
      title: "Live Web & Scientific Research",
      desc: "Who won the Nobel prize in Physics in 2024?",
      prompt: "Who won the Nobel prize in Physics in 2024?",
      icon: Globe,
      mode: "DEEP_SEARCH" as ResponseMode,
      color: "from-amber-500/20 to-orange-500/10",
      accent: "text-amber-400",
      badge: "Deep Search",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Badge & Headline */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-medium shadow-lg shadow-blue-900/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>EXAM MIND AI • Gemini-Grade Academic Intelligence</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Master Any Exam or Topic. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Pure Intelligence.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 leading-relaxed">
            EXAM MIND AI delivers Gemini-level structured reasoning, step-by-step mathematical problem solving, code debugging, and real-time Google search intelligence.
          </p>
        </div>

        {/* 3-Mode Selector Pill Row */}
        <div className="pt-2 pb-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Inference Mode
          </div>
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 gap-1">
            {RESPONSE_MODES.map((mode) => {
              const isSelected = mode.id === currentMode;
              const Icon = mode.id === "QUICK_ANSWER" ? Zap : mode.id === "THINKING" ? Brain : Globe;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-300" : "text-slate-400"}`} />
                  <span>{mode.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggested Queries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4 text-left">
          {suggestedCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectPrompt(card.prompt, card.mode)}
                className="group p-4 rounded-2xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/80 hover:border-blue-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} border border-white/10 flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${card.accent}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-medium text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <span>Explore topic</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

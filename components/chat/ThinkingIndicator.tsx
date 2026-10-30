"use client";

import React from "react";
import { Brain, Globe, BookOpen, Sparkles } from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";

interface ThinkingIndicatorProps {
  mode: ResponseMode;
  hasTextbookGrounding?: boolean;
}

export function ThinkingIndicator({ mode, hasTextbookGrounding }: ThinkingIndicatorProps) {
  let label = "Searching web & generating answer (Fast Academic Engine)...";
  let Icon = Sparkles;

  if (mode === "DEEP_SEARCH") {
    label = "Searching Google & compiling full research dossier (GPT 120B OSS)...";
    Icon = Globe;
  } else if (mode === "THINKING") {
    label = "Deep answering & rigorous reasoning (GPT 120B OSS)...";
    Icon = Brain;
  } else if (hasTextbookGrounding) {
    label = "Searching web & retrieving textbook passages...";
    Icon = BookOpen;
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 backdrop-blur-md w-fit my-2 shadow-sm animate-fadeIn">
      {/* Icon */}
      <div className="w-5 h-5 rounded-md bg-blue-500/20 text-cyan-400 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 animate-pulse" />
      </div>

      {/* Label */}
      <span className="text-xs font-medium text-slate-300">
        {label}
      </span>

      {/* Three Sequential Bouncing Dots */}
      <div className="flex items-center gap-1 pl-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1000ms" }}
        />
      </div>
    </div>
  );
}

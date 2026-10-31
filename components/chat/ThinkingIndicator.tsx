"use client";

import React from "react";
import { Globe, BookOpen } from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";

interface ThinkingIndicatorProps {
  mode?: ResponseMode;
  hasTextbookGrounding?: boolean;
}

export function ThinkingIndicator({ hasTextbookGrounding }: ThinkingIndicatorProps) {
  const label = hasTextbookGrounding
    ? "Retrieving textbook chapters & scraping web across Google..."
    : "Deep Search active: Scraping all sites on Google & compiling research dossier...";
  const Icon = hasTextbookGrounding ? BookOpen : Globe;

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 backdrop-blur-md w-fit max-w-[calc(100vw-3rem)] my-2 shadow-sm animate-fadeIn">
      {/* Icon */}
      <div className="w-5 h-5 rounded-md bg-blue-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 animate-pulse" />
      </div>

      {/* Label */}
      <span className="text-[11px] sm:text-xs font-medium text-slate-300 truncate">
        {label}
      </span>

      {/* Three Sequential Bouncing Dots */}
      <div className="flex items-center gap-1 pl-0.5 sm:pl-1 flex-shrink-0">
        <span
          className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1000ms" }}
        />
      </div>
    </div>
  );
}

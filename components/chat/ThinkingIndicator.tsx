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
    <div className="flex items-center gap-2 sm:gap-2.5 py-1.5 px-3 rounded-full bg-[#2f2f2f]/85 border border-white/10 backdrop-blur-xl w-fit max-w-[calc(100vw-3rem)] my-2 shadow-md animate-fadeIn">
      {/* Icon */}
      <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 text-[#10a37f] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 animate-pulse" />
      </div>

      {/* Label */}
      <span className="text-[11px] sm:text-xs font-medium text-zinc-300 truncate">
        {label}
      </span>

      {/* Three Sequential Bouncing Dots */}
      <div className="flex items-center gap-1 pl-1 flex-shrink-0">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1000ms" }}
        />
      </div>
    </div>
  );
}

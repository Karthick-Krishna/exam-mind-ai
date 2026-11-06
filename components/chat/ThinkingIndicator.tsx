"use client";

import React, { useState, useEffect } from "react";
import { Globe, Search, ShieldCheck, Sparkles, CheckCircle2, Cpu } from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";

interface ThinkingIndicatorProps {
  mode?: ResponseMode;
  hasTextbookGrounding?: boolean;
}

const SCRAPING_STAGES = [
  {
    icon: Search,
    text: "Decomposing query & dispatching live search across Google & global indices...",
    domain: "google.com/search",
  },
  {
    icon: Globe,
    text: "Scraping full web text & extracting empirical data from active sites...",
    domain: "nature.com • arxiv.org",
  },
  {
    icon: ShieldCheck,
    text: "Validating publication freshness & cross-referencing independent citations...",
    domain: "wikipedia.org • ieee.org",
  },
  {
    icon: Cpu,
    text: "Assembling research dossier & executing independent verification engine...",
    domain: "coralgenz-quantum-core",
  },
];

export function ThinkingIndicator({ hasTextbookGrounding }: ThinkingIndicatorProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Cycle through scraping animation stages
  useEffect(() => {
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % SCRAPING_STAGES.length);
    }, 1800);

    const clockTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stageTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const currentStage = SCRAPING_STAGES[currentStageIndex];
  const StageIcon = currentStage.icon;

  return (
    <div className="w-full max-w-2xl my-3 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-500/30 shadow-lg shadow-emerald-500/5 backdrop-blur-xl transition-all animate-fadeIn">
      {/* Top Main Banner */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Animated Pulsing Globe */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 text-[#10a37f] border border-emerald-500/20 flex-shrink-0">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10a37f] animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10a37f]" />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-900 leading-tight">
              Deep Search active: Scraping all sites on Google &amp; compiling research dossier...
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1 font-mono text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Web Crawl
              </span>
              <span>•</span>
              <span className="font-mono text-[10px] text-zinc-400">{secondsElapsed}s elapsed</span>
            </div>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-medium flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[#10a37f] animate-pulse" />
          <span>Researching</span>
        </div>
      </div>

      {/* Animated Scraping Progress Bar */}
      <div className="relative w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-3.5">
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#10a37f] rounded-full transition-all duration-500"
          style={{ width: `${Math.min(25 + currentStageIndex * 25, 95)}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>

      {/* Active Scraping Stage Card */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <StageIcon className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-zinc-700 font-medium text-[12px] truncate">
            {currentStage.text}
          </span>
        </div>

        {/* Current Scraped Domain Tag */}
        <span className="hidden min-[480px]:inline-block font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0 shadow-2xs">
          {currentStage.domain}
        </span>
      </div>

      {/* Checklist of Research Phases */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500">
        {SCRAPING_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-1.5 p-1 rounded-md transition-colors ${
                isCurrent
                  ? "text-emerald-700 font-medium bg-emerald-50/60"
                  : isDone
                  ? "text-zinc-600 line-through opacity-70"
                  : "text-zinc-400"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-zinc-300 flex-shrink-0" />
              )}
              <span className="truncate">
                {idx === 0
                  ? "Query Plan"
                  : idx === 1
                  ? "Scraping"
                  : idx === 2
                  ? "Fact Check"
                  : "Synthesis"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

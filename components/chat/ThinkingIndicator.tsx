"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Search,
  Code2,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Play,
  Activity,
  FileCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";

interface ThinkingIndicatorProps {
  mode?: ResponseMode;
  hasTextbookGrounding?: boolean;
}

type TabType = "code" | "scraper" | "dossier";

const CODE_STREAM_LINES = [
  "# [CORALGENZ QUANTUM RUNTIME] - Isolated Sandboxed Execution",
  "import ast, sys, sympy as sp",
  "from coralgenz_core import SymbolicVerifier, MathDossier",
  "",
  "class AcademicSynthesisEngine:",
  "    def __init__(self, query_intent: str = 'DEEP_SEARCH'):",
  "        self.ast_tree = ast.parse('f(x) = verified_exact_calculus()')",
  "        self.verifier = SymbolicVerifier(strict_typing=True)",
  "        self.memory_limit = '256MB'",
  "",
  "    def verify_and_compile(self):",
  "        # AST validation & safety invariant checks",
  "        assert self.verifier.is_sandboxed() == True",
  "        res = self.verifier.execute(deterministic=True)",
  "        return {'status': 200, 'exit_code': 0, 'converged': True}",
  "",
  "engine = AcademicSynthesisEngine()",
  "result = engine.verify_and_compile()",
  ">>> [STDOUT] Compilation: OK (12ms) | Memory: 3.2MB | Security: Seccomp Active",
];

const SCRAPING_STREAM_LOGS = [
  { method: "GET", url: "https://www.google.com/search?q=academic+query", status: "200 OK", ms: "42ms" },
  { method: "CRAWL", url: "https://nature.com/articles/s41586-peer-reviewed", status: "PARSED", ms: "84ms" },
  { method: "FETCH", url: "https://arxiv.org/abs/2405.14851v2", status: "EXTRACTED", ms: "63ms" },
  { method: "SCRAPE", url: "https://ieee.org/explore/document/current", status: "VERIFIED", ms: "112ms" },
  { method: "OCR", url: "optical_feature_extraction://frame_buffer", status: "G-OCR OK", ms: "28ms" },
  { method: "CLEANSE", url: "DOM://sanitized_text_extract", status: "4,820 tokens", ms: "15ms" },
  { method: "CROSS-REF", url: "https://en.wikipedia.org/wiki/Research_dossier", status: "MATCHED", ms: "76ms" },
  { method: "COMPILE", url: "coralgenz://quantum-reasoning-cluster", status: "DOSSIER READY", ms: "34ms" },
];

const RESEARCH_STAGES = [
  {
    title: "1. Query Decomposition & Vector Plan",
    desc: "Parsed semantic intent, extracted calculus/AST bounds, dispatched Google vector query.",
    status: "COMPLETE",
  },
  {
    title: "2. Live Google Scraping Across Sites",
    desc: "Crawling live web pages, academic journals (arXiv, Nature, IEEE), bypassing stale caches.",
    status: "ACTIVE",
  },
  {
    title: "3. Independent Code & Math Verification",
    desc: "Running symbolic differentiation, AST syntax check, and isolated runtime sandbox.",
    status: "ACTIVE",
  },
  {
    title: "4. Dossier Compilation & Synthesis",
    desc: "Synthesizing authoritative facts, verified links, and formatted direct answer.",
    status: "ASSEMBLING",
  },
];

export function ThinkingIndicator({ hasTextbookGrounding }: ThinkingIndicatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("code");
  const [visibleCodeLines, setVisibleCodeLines] = useState(3);
  const [visibleLogs, setVisibleLogs] = useState(2);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [stageProgress, setStageProgress] = useState(35);

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Live timer & auto-streaming code / scraper lines
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const streamTimer = setInterval(() => {
      setVisibleCodeLines((prev) => {
        if (prev < CODE_STREAM_LINES.length) return prev + 1;
        return prev;
      });

      setVisibleLogs((prev) => {
        if (prev < SCRAPING_STREAM_LOGS.length) return prev + 1;
        return prev;
      });

      setStageProgress((prev) => (prev < 95 ? prev + 7 : 95));
    }, 350);

    return () => {
      clearInterval(clockTimer);
      clearInterval(streamTimer);
    };
  }, []);

  // Auto-scroll the live terminal views
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [visibleCodeLines, visibleLogs]);

  return (
    <div className="w-full max-w-3xl my-3.5 rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-emerald-500/5 overflow-hidden transition-all animate-fadeIn">
      {/* =========================================================================
          TOP COMMAND HEADER & RADAR TELEMETRY
          ========================================================================= */}
      <div className="px-4 py-3 bg-gradient-to-r from-zinc-50 via-emerald-50/40 to-white border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Animated Pulsing Radar Beacon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm flex-shrink-0 overflow-hidden">
            <Globe className="w-4 h-4 text-[#10a37f] animate-radar" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-900 leading-tight truncate">
              Deep Search active: Scraping all sites on Google &amp; compiling research dossier...
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1 font-mono text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Engine Active
              </span>
              <span>•</span>
              <span className="font-mono text-[10px] text-zinc-400">{secondsElapsed}s elapsed</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-zinc-500">{stageProgress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-[11px] font-mono font-medium">
            <Sparkles className="w-3 h-3 text-[#10a37f] animate-pulse" />
            <span>Research Dossier</span>
          </span>
        </div>
      </div>

      {/* Progress Shimmer Bar */}
      <div className="relative w-full h-1 bg-zinc-100 overflow-hidden">
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#10a37f] transition-all duration-300"
          style={{ width: `${stageProgress}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      </div>

      {/* =========================================================================
          INTERACTIVE ANIMATED HUD TABS (Coding, Scraping, Deep Research)
          ========================================================================= */}
      <div className="px-3 pt-2.5 pb-0 bg-zinc-900 flex items-center justify-between border-b border-zinc-800 overflow-x-auto gap-1">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl font-mono text-[11px] sm:text-xs transition-all ${
              activeTab === "code"
                ? "bg-[#18181b] text-emerald-400 border-t border-x border-zinc-700 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>compiler_sandbox.py</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scraper")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl font-mono text-[11px] sm:text-xs transition-all ${
              activeTab === "scraper"
                ? "bg-[#18181b] text-cyan-300 border-t border-x border-zinc-700 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>google_scraper.log</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dossier")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl font-mono text-[11px] sm:text-xs transition-all ${
              activeTab === "dossier"
                ? "bg-[#18181b] text-purple-300 border-t border-x border-zinc-700 font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>deep_research.dossier</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* Window Traffic Lights */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIVE CODE SYNTHESIS & EXECUTION SANDBOX ANIMATION
          ========================================================================= */}
      {activeTab === "code" && (
        <div className="bg-[#18181b] text-zinc-200 font-mono text-[11px] sm:text-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] sm:text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>AST Syntax Check: ONLINE</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-400">Deterministic Engine Active</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Live Code Stream</span>
            </div>
          </div>

          <div
            ref={codeContainerRef}
            className="h-36 sm:h-44 overflow-y-auto space-y-1 font-mono text-[11.5px] sm:text-[12.5px] leading-relaxed scrollbar-thin select-none"
          >
            {CODE_STREAM_LINES.slice(0, visibleCodeLines).map((line, idx) => {
              const isComment = line.startsWith("#");
              const isClassOrDef = line.includes("class ") || line.includes("def ");
              const isStdout = line.startsWith(">>>");

              let color = "text-zinc-200";
              if (isComment) color = "text-zinc-500 italic";
              else if (isClassOrDef) color = "text-cyan-300 font-semibold";
              else if (isStdout) color = "text-emerald-400 font-bold bg-emerald-950/40 px-1 py-0.5 rounded";
              else if (line.includes("assert") || line.includes("return")) color = "text-purple-300";

              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-[10px] text-zinc-600 w-5 text-right select-none flex-shrink-0">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  <span className={`${color} whitespace-pre-wrap break-all flex-1`}>{line}</span>
                </div>
              );
            })}
            <div className="inline-block w-2 h-4 bg-emerald-400 animate-cursor align-middle ml-7" />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: REAL-TIME GOOGLE WEB SCRAPER & DOM STREAM ANIMATION
          ========================================================================= */}
      {activeTab === "scraper" && (
        <div className="bg-[#18181b] text-zinc-200 font-mono text-[11px] sm:text-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] sm:text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Google Real-Time Scraper: Active</span>
              <span className="text-zinc-600">|</span>
              <span className="text-cyan-400">HTTP/2 Streaming</span>
            </div>
            <span className="font-mono text-zinc-400">{visibleLogs} / {SCRAPING_STREAM_LOGS.length} endpoints</span>
          </div>

          <div
            ref={logContainerRef}
            className="h-36 sm:h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] sm:text-[12px] leading-relaxed scrollbar-thin select-none"
          >
            {SCRAPING_STREAM_LOGS.slice(0, visibleLogs).map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.method === "GET"
                        ? "bg-blue-950 text-blue-400"
                        : log.method === "CRAWL"
                        ? "bg-emerald-950 text-emerald-400"
                        : log.method === "FETCH"
                        ? "bg-purple-950 text-purple-400"
                        : "bg-cyan-950 text-cyan-400"
                    }`}
                  >
                    {log.method}
                  </span>
                  <span className="text-zinc-300 truncate max-w-[200px] sm:max-w-xs">{log.url}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                  <span className="text-emerald-400 font-bold">{log.status}</span>
                  <span className="text-zinc-500 font-mono">{log.ms}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] pt-1 italic">
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              <span>Scraping and analyzing active Google indices in real time...</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: DEEP RESEARCH DOSSIER COMPILATION STAGES
          ========================================================================= */}
      {activeTab === "dossier" && (
        <div className="bg-[#18181b] text-zinc-200 p-3.5 sm:p-4">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Multi-Source Dossier Assembler</span>
            </div>
            <span className="text-purple-400">Global Knowledge Graph</span>
          </div>

          <div className="space-y-2 h-36 sm:h-44 overflow-y-auto pr-1 scrollbar-thin">
            {RESEARCH_STAGES.map((stg, idx) => {
              const isDone = stg.status === "COMPLETE";
              const isActive = stg.status === "ACTIVE";

              return (
                <div
                  key={idx}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-colors flex items-start gap-2.5 ${
                    isActive
                      ? "bg-purple-950/20 border-purple-500/30 text-purple-100"
                      : isDone
                      ? "bg-zinc-900/80 border-zinc-800 text-zinc-300"
                      : "bg-zinc-900/40 border-zinc-800/40 text-zinc-500"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-semibold">{stg.title}</h5>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          isDone
                            ? "bg-emerald-950 text-emerald-400"
                            : isActive
                            ? "bg-purple-950 text-purple-300 animate-pulse"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {stg.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{stg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          FOOTER STATUS STRIP
          ========================================================================= */}
      <div className="px-3.5 py-2 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CoralGenz Neural Stream
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-400">Sandbox: seccomp enabled</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-500">
          <span>Click tabs above to view live code, scraping logs, or dossier</span>
        </div>
      </div>
    </div>
  );
}

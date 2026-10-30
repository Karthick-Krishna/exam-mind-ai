"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, CheckCircle2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface HighlightedAnswerProps {
  answerText: string;
  isStreaming?: boolean;
}

export function HighlightedAnswer({ answerText, isStreaming = false }: HighlightedAnswerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!answerText) return;
    navigator.clipboard.writeText(answerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!answerText.trim()) return null;

  return (
    <div className="relative mb-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-cyan-950/20 p-4 sm:p-5 shadow-xl shadow-blue-950/20 backdrop-blur-md transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-500/15">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-500/20 text-cyan-400 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300">
            Direct Answer
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono animate-pulse">
              Generating...
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Copy direct answer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Copy Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Prominently Highlighted Content */}
      <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed tracking-normal overflow-x-auto">
        <MarkdownRenderer content={answerText} />
      </div>
    </div>
  );
}

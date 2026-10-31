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

  if (!answerText.trim() && !isStreaming) return null;

  return (
    <div className="relative mb-3 sm:mb-5 rounded-xl sm:rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-cyan-950/20 p-2.5 sm:p-5 shadow-xl shadow-blue-950/20 backdrop-blur-md transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-blue-500/15">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-blue-500/20 text-cyan-400 border border-blue-400/30 flex-shrink-0">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 flex-shrink-0">
            Direct Answer
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] bg-blue-500/20 text-cyan-300 font-mono animate-pulse border border-cyan-500/30 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Generating...
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors touch-manipulation active:scale-95 flex-shrink-0"
          title="Copy direct answer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] sm:text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              <span className="text-[10px] sm:text-[11px] hidden min-[360px]:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Prominently Highlighted Content with Live Typing Animation */}
      <div className="text-xs sm:text-base text-slate-100 font-medium leading-relaxed tracking-normal overflow-x-auto relative break-words">
        {answerText.trim() ? (
          <MarkdownRenderer content={answerText} />
        ) : (
          <span className="text-slate-400 italic text-xs sm:text-sm">Formulating direct answer...</span>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 sm:w-2 sm:h-4 bg-cyan-400 rounded-sm animate-pulse ml-1 align-middle shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
        )}
      </div>
    </div>
  );
}

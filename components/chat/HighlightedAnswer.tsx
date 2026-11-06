"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
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
    <div className="relative mb-3 sm:mb-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white p-3.5 sm:p-5 shadow-xs backdrop-blur-sm transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-emerald-200/60">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-emerald-800 flex-shrink-0">
            Direct Answer
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-emerald-100/80 text-emerald-800 font-mono border border-emerald-300/60 truncate font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Synthesizing...
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-colors touch-manipulation active:scale-95 flex-shrink-0 shadow-2xs"
          title="Copy direct answer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-[10px] sm:text-[11px] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] sm:text-[11px] hidden min-[360px]:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Prominently Highlighted Content with Live Typing Animation */}
      <div className="text-xs sm:text-[15px] text-zinc-900 font-medium leading-relaxed tracking-normal overflow-x-auto relative break-words">
        {answerText.trim() ? (
          <MarkdownRenderer content={answerText} />
        ) : (
          <span className="text-zinc-500 italic text-xs sm:text-sm">Formulating direct answer...</span>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 sm:w-2 sm:h-4 bg-emerald-600 rounded-sm animate-pulse ml-1 align-middle shadow-[0_0_8px_rgba(16,163,127,0.4)]" />
        )}
      </div>
    </div>
  );
}

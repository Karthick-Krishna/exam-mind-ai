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
    <div className="relative mb-3 sm:mb-5 rounded-2xl border border-[#10a37f]/30 bg-gradient-to-br from-[#132820]/70 via-[#1e2a24]/50 to-[#171717]/80 p-3 sm:p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-[#10a37f]/20">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-[#10a37f]/20 text-[#10a37f] border border-[#10a37f]/30 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold tracking-wide uppercase text-[#10a37f] flex-shrink-0">
            Direct Answer
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] bg-[#10a37f]/15 text-emerald-300 font-mono border border-[#10a37f]/30 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-ping"></span>
              Synthesizing...
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors touch-manipulation active:scale-95 flex-shrink-0"
          title="Copy direct answer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] sm:text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
              <span className="text-[10px] sm:text-[11px] hidden min-[360px]:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Prominently Highlighted Content with Live Typing Animation */}
      <div className="text-xs sm:text-[15px] text-[#ececec] font-medium leading-relaxed tracking-normal overflow-x-auto relative break-words">
        {answerText.trim() ? (
          <MarkdownRenderer content={answerText} />
        ) : (
          <span className="text-zinc-400 italic text-xs sm:text-sm">Formulating direct answer...</span>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 sm:w-2 sm:h-4 bg-[#10a37f] rounded-sm animate-pulse ml-1 align-middle shadow-[0_0_8px_rgba(16,163,127,0.9)]" />
        )}
      </div>
    </div>
  );
}

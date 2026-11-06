"use client";

import React, { useState } from "react";
import {
  Sparkles,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCw
} from "lucide-react";
import { Message } from "@/lib/database/db";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { HighlightedAnswer } from "./HighlightedAnswer";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ResponseMode } from "@/lib/ai/prompts";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  mode?: ResponseMode;
  onRegenerate?: () => void;
  onFeedback?: (messageId: string, feedback: "LIKE" | "DISLIKE") => void;
  onFollowUpClick?: (question: string) => void;
}

/**
 * Strips raw internal thinking processes, chain-of-thought traces, or <think> tags
 */
function stripThinkingTraces(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // If the model output a raw "Thinking Process:" block before the :::answer
  if (cleaned.includes(":::answer")) {
    const idx = cleaned.indexOf(":::answer");
    cleaned = cleaned.slice(idx);
  } else if (cleaned.includes("[HIGHLIGHTED ANSWER]")) {
    const idx = cleaned.indexOf("[HIGHLIGHTED ANSWER]");
    cleaned = cleaned.slice(idx);
  } else {
    // If no :::answer tag, remove raw "Thinking Process:" prefix
    cleaned = cleaned.replace(/^Thinking Process:[\s\S]*?(?=\n\n[A-Z0-9#*-])/i, "");
  }
  return cleaned.trim();
}

/**
 * Extracts :::answer ... ::: or [HIGHLIGHTED ANSWER] block from raw markdown content
 */
function extractHighlightedAnswer(rawContent: string): {
  highlightedAnswer: string | null;
  remainingContent: string;
} {
  const content = stripThinkingTraces(rawContent);
  if (!content) return { highlightedAnswer: null, remainingContent: "" };

  // 1. Check for closed :::answer ... :::
  const closedMatch = content.match(/:::answer\s*([\s\S]*?)\s*:::\s*([\s\S]*)/i);
  if (closedMatch) {
    return {
      highlightedAnswer: closedMatch[1].trim(),
      remainingContent: closedMatch[2].trim(),
    };
  }

  // 2. Check for in-progress streaming :::answer ...
  const openMatch = content.match(/:::answer\s*([\s\S]*)/i);
  if (openMatch) {
    return {
      highlightedAnswer: openMatch[1].trim(),
      remainingContent: "",
    };
  }

  // 3. Check for [HIGHLIGHTED ANSWER] ... [SUPPORTING INFORMATION / EXPLANATION / CODE]
  const tagMatch = content.match(
    /\[HIGHLIGHTED ANSWER\]\s*([\s\S]*?)\s*(?:\[(?:SUPPORTING INFORMATION|EXPLANATION|CODE|MORE DETAILS|CONDITIONS|STEP-BY-STEP SOLUTION)\]\s*([\s\S]*)|$)/i
  );
  if (tagMatch) {
    return {
      highlightedAnswer: tagMatch[1].trim(),
      remainingContent: (tagMatch[2] || "").trim(),
    };
  }

  return {
    highlightedAnswer: null,
    remainingContent: content,
  };
}

export function ChatMessage({
  message,
  isStreaming = false,
  mode = "DEEP_SEARCH",
  onRegenerate,
  onFeedback,
  onFollowUpClick,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<"LIKE" | "DISLIKE" | null>(
    message.feedback || null
  );

  const isAssistant = message.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "LIKE" | "DISLIKE") => {
    const next = currentFeedback === type ? null : type;
    setCurrentFeedback(next);
    if (next && onFeedback) {
      onFeedback(message.id, next);
    }
  };

  const { highlightedAnswer, remainingContent } = isAssistant
    ? extractHighlightedAnswer(message.content)
    : { highlightedAnswer: null, remainingContent: message.content };

  const isCurrentlyStreaming = isAssistant && isStreaming;
  const isHighlightedStreaming = isCurrentlyStreaming && !remainingContent;
  const isRemainingStreaming = isCurrentlyStreaming && Boolean(remainingContent);

  const suggestions =
    isAssistant && message.content.length > 50
      ? [
          "Explain the key intuition in simpler terms",
          "Give another real-world application or example",
          "Show the step-by-step mathematical proof",
        ]
      : [];

  return (
    <div
      className={`py-3 sm:py-6 px-2.5 sm:px-6 md:px-8 transition-colors ${
        isAssistant ? "bg-[#040916]/50 border-y border-white/[0.04]" : "bg-transparent"
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-2 sm:gap-4 md:gap-5 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden bg-black border border-blue-500/30 shadow-md shadow-blue-500/20">
              <img
                src="/logo.png"
                alt="EXAM MIND AI"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-slate-200 text-xs flex-shrink-0">
                {isAssistant ? "EXAM MIND AI" : "You"}
              </span>
              {isAssistant && (
                <span
                  className="text-[9px] sm:text-[10px] font-mono text-cyan-300/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 truncate max-w-[110px] min-[360px]:max-w-[160px] sm:max-w-[260px]"
                  title="ExamMind AI • Engineered by CoralGenz Global"
                >
                  {message.modelUsed && !/(?:GPT-OSS|Qwen|Open-Source|Pollinations|Open Cloud)/i.test(message.modelUsed)
                    ? message.modelUsed
                    : "ExamMind AI (CoralGenz Global)"}
                </span>
              )}
              {isAssistant && message.verificationBadge && (
                <span
                  className="text-[9px] sm:text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30 truncate"
                  title="Independently verified"
                >
                  ✓ {message.verificationBadge}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 opacity-90 sm:opacity-80 sm:hover:opacity-100 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-1 sm:p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
                title="Copy entire message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isAssistant && (
                <>
                  <button
                    onClick={() => handleFeedback("LIKE")}
                    className={`p-1 sm:p-1.5 rounded hover:bg-white/5 transition-colors active:scale-95 ${
                      currentFeedback === "LIKE" ? "text-blue-400" : "text-slate-400 hover:text-white"
                    }`}
                    title="Good explanation"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback("DISLIKE")}
                    className={`p-1 sm:p-1.5 rounded hover:bg-white/5 transition-colors active:scale-95 ${
                      currentFeedback === "DISLIKE" ? "text-rose-400" : "text-slate-400 hover:text-white"
                    }`}
                    title="Needs improvement"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="p-1 sm:p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
                      title="Regenerate answer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Citations Box (if RAG / Live Web sources were retrieved) */}
          {isAssistant && message.citations && message.citations.length > 0 && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-2.5 sm:p-3 text-xs mb-3">
              <button
                onClick={() => setShowCitations(!showCitations)}
                className="w-full flex items-center justify-between text-cyan-300 font-medium"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">
                    Grounded in {message.citations.length} Verified Source
                    {message.citations.length > 1 ? "s" : ""}
                  </span>
                </div>
                {showCitations ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>

              {showCitations && (
                <div className="mt-2.5 sm:mt-3 space-y-2 pt-2 border-t border-blue-500/15">
                  {message.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-2 sm:p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1"
                    >
                      <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between font-mono text-[10px] sm:text-[11px] text-cyan-400 gap-0.5">
                        <span className="font-semibold text-slate-200 truncate">{cite.documentName}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span>{cite.sourceUrl ? "Web Source" : `Page ${cite.pageNumber}`} {cite.section ? `(§${cite.section})` : ""}</span>
                          {cite.sourceUrl && (
                            <a
                              href={cite.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-cyan-300 underline text-[10px] flex items-center gap-0.5"
                            >
                              <span>Visit</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-slate-300 italic font-serif leading-relaxed">
                        &ldquo;{cite.excerpt}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Animated Thinking Indicator when waiting for first token */}
          {isAssistant && !highlightedAnswer && !remainingContent && isStreaming && (
            <ThinkingIndicator mode={mode} />
          )}

          {/* Dedicated Highlighted Answer Card */}
          {isAssistant && highlightedAnswer !== null && (
            <HighlightedAnswer answerText={highlightedAnswer} isStreaming={isHighlightedStreaming} />
          )}

          {/* Supporting Markdown Explanation & Content with Live Typing Animation (Assistant only) */}
          {isAssistant && remainingContent && (
            <div className="text-slate-200 leading-relaxed relative">
              <MarkdownRenderer content={remainingContent} />
              {isRemainingStreaming && (
                <span className="inline-block w-2 h-4 bg-cyan-400 rounded-sm animate-pulse ml-1.5 align-middle shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              )}
            </div>
          )}

          {/* Non-assistant plain message & attached images */}
          {!isAssistant && (
            <div className="text-slate-200 leading-relaxed space-y-2">
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {message.attachments.map((att, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-white/10 max-w-xs shadow-lg bg-black/40">
                      {att.data?.startsWith("data:image/") || att.type === "image" ? (
                        <img src={att.data} alt={att.name || "Attached Image"} className="max-h-56 object-contain rounded-lg" />
                      ) : (
                        <div className="p-2 text-xs text-slate-300 font-mono">{att.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <MarkdownRenderer content={message.content} />
            </div>
          )}

          {/* Follow-up question pills */}
          {suggestions.length > 0 && onFollowUpClick && !isStreaming && (
            <div className="pt-3 flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick(s)}
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-900/80 hover:bg-blue-900/30 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

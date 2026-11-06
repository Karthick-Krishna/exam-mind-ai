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

  const displayModelName = message.modelUsed
    ? message.modelUsed.replace(/gpt-oss|qwen|openai|deepseek|anthropic/gi, "ExamMind Core")
    : "ExamMind Core v4.0 (CoralGenz Global)";

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

  // =========================================================================
  // USER MESSAGE: Iconic Right-Aligned ChatGPT Glass Bubble
  // =========================================================================
  if (!isAssistant) {
    return (
      <div className="py-2.5 sm:py-3 px-3 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto flex justify-end">
          <div className="max-w-[85%] sm:max-w-[75%] rounded-[24px] rounded-br-[8px] bg-[#2f2f2f]/95 border border-white/[0.1] text-zinc-100 px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg shadow-black/25 space-y-2 backdrop-blur-md">
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {message.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-white/10 max-w-xs shadow-md bg-black/40"
                  >
                    {att.data?.startsWith("data:image/") || att.type === "image" ? (
                      <img
                        src={att.data}
                        alt={att.name || "Attached Image"}
                        className="max-h-56 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="p-2 text-xs text-zinc-300 font-mono">{att.name}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ASSISTANT MESSAGE: Iconic ChatGPT Left-Aligned Clean Canvas
  // =========================================================================
  return (
    <div className="group py-4 sm:py-6 px-3 sm:px-6 md:px-8 border-b border-white/[0.04] bg-transparent">
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-[#171717] border border-white/15 shadow-md shadow-black/40 p-0.5">
            <img
              src="/logo.png"
              alt="EXAM MIND AI"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-white text-xs flex-shrink-0">
                ExamMind AI
              </span>
              <span
                className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 truncate max-w-[120px] min-[360px]:max-w-[180px] sm:max-w-[280px]"
                title="ExamMind AI • Engineered by CoralGenz Global"
              >
                {displayModelName}
              </span>
              {message.verificationBadge && (
                <span
                  className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 truncate"
                  title="Independently verified"
                >
                  ✓ {message.verificationBadge}
                </span>
              )}
            </div>

            {/* Quick Actions (ChatGPT Hover Icons) */}
            <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
                title="Copy entire message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleFeedback("LIKE")}
                className={`p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors active:scale-95 ${
                  currentFeedback === "LIKE" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
                }`}
                title="Good explanation"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback("DISLIKE")}
                className={`p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors active:scale-95 ${
                  currentFeedback === "DISLIKE" ? "text-rose-400" : "text-zinc-400 hover:text-white"
                }`}
                title="Needs improvement"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
                  title="Regenerate answer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Citations Box (if RAG / Live Web sources were retrieved) */}
          {message.citations && message.citations.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#1e1e1e]/60 p-2.5 sm:p-3 text-xs mb-3 shadow-md backdrop-blur-md">
              <button
                onClick={() => setShowCitations(!showCitations)}
                className="w-full flex items-center justify-between text-zinc-300 font-medium"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    Grounded in {message.citations.length} Verified Source
                    {message.citations.length > 1 ? "s" : ""}
                  </span>
                </div>
                {showCitations ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>

              {showCitations && (
                <div className="mt-2.5 sm:mt-3 space-y-2 pt-2 border-t border-white/10">
                  {message.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1"
                    >
                      <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between font-mono text-[10px] sm:text-[11px] text-zinc-400 gap-0.5">
                        <span className="font-semibold text-zinc-200 truncate">{cite.documentName}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span>{cite.sourceUrl ? "Web Source" : `Page ${cite.pageNumber}`} {cite.section ? `(§${cite.section})` : ""}</span>
                          {cite.sourceUrl && (
                            <a
                              href={cite.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 underline text-[10px] flex items-center gap-0.5"
                            >
                              <span>Visit</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-zinc-300 italic font-serif leading-relaxed">
                        &ldquo;{cite.excerpt}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Animated Thinking Indicator when waiting for first token */}
          {!highlightedAnswer && !remainingContent && isStreaming && (
            <ThinkingIndicator mode={mode} />
          )}

          {/* Dedicated Highlighted Answer Card */}
          {highlightedAnswer !== null && (
            <HighlightedAnswer answerText={highlightedAnswer} isStreaming={isHighlightedStreaming} />
          )}

          {/* Supporting Markdown Explanation & Content with Live Typing Animation */}
          {remainingContent && (
            <div className="text-[#ececec] leading-relaxed relative">
              <MarkdownRenderer content={remainingContent} />
              {isRemainingStreaming && (
                <span className="inline-block w-2 h-4 bg-emerald-400 rounded-sm animate-pulse ml-1.5 align-middle shadow-[0_0_8px_rgba(16,163,127,0.9)]" />
              )}
            </div>
          )}

          {/* Follow-up question pills */}
          {suggestions.length > 0 && onFollowUpClick && !isStreaming && (
            <div className="pt-3 flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick(s)}
                  className="px-3 py-1 rounded-full text-xs bg-[#2f2f2f] hover:bg-[#383838] text-zinc-300 hover:text-white border border-white/10 transition-all text-left shadow-sm"
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

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
  mode = "QUICK_ANSWER",
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

  const isMessageStreaming = isAssistant && isStreaming && (!message.content || !message.content.includes(":::"));

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
      className={`py-6 px-4 md:px-8 transition-colors ${
        isAssistant ? "bg-[#040916]/50 border-y border-white/[0.04]" : "bg-transparent"
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-5 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#050b14] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {isAssistant ? "EXAM MIND AI" : "You"}
              </span>
              {isAssistant && message.modelUsed && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                  {message.modelUsed}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
              <button
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Copy entire message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isAssistant && (
                <>
                  <button
                    onClick={() => handleFeedback("LIKE")}
                    className={`p-1 rounded hover:bg-white/5 transition-colors ${
                      currentFeedback === "LIKE" ? "text-blue-400" : "text-slate-400 hover:text-white"
                    }`}
                    title="Good explanation"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback("DISLIKE")}
                    className={`p-1 rounded hover:bg-white/5 transition-colors ${
                      currentFeedback === "DISLIKE" ? "text-rose-400" : "text-slate-400 hover:text-white"
                    }`}
                    title="Needs improvement"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
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
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs mb-3">
              <button
                onClick={() => setShowCitations(!showCitations)}
                className="w-full flex items-center justify-between text-cyan-300 font-medium"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Grounded in {message.citations.length} Verified Source
                    {message.citations.length > 1 ? "s" : ""}
                  </span>
                </div>
                {showCitations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCitations && (
                <div className="mt-3 space-y-2 pt-2 border-t border-blue-500/15">
                  {message.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-cyan-400">
                        <span className="font-semibold text-slate-200">{cite.documentName}</span>
                        <div className="flex items-center gap-2">
                          <span>{cite.sourceUrl ? "Web Knowledge" : `Page ${cite.pageNumber}`} {cite.section ? `(§${cite.section})` : ""}</span>
                          {cite.sourceUrl && (
                            <a
                              href={cite.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-cyan-300 underline text-[10px] flex items-center gap-0.5"
                            >
                              <span>Visit Source</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-[12px] text-slate-300 italic font-serif">
                        &ldquo;{cite.excerpt}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Animated Thinking Indicator when waiting for first token */}
          {isAssistant && !message.content && isStreaming && (
            <ThinkingIndicator mode={mode} />
          )}

          {/* Dedicated Highlighted Answer Card */}
          {isAssistant && highlightedAnswer && (
            <HighlightedAnswer answerText={highlightedAnswer} isStreaming={isMessageStreaming} />
          )}

          {/* Supporting Markdown Explanation & Content */}
          {remainingContent && (
            <div className="text-slate-200 leading-relaxed">
              <MarkdownRenderer content={remainingContent} />
            </div>
          )}

          {/* Non-assistant plain message */}
          {!isAssistant && (
            <div className="text-slate-200 leading-relaxed">
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

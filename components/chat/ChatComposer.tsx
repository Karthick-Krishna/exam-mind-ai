"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Square,
  Paperclip,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Zap,
  Brain,
  X,
  FileText
} from "lucide-react";
import { ResponseMode } from "@/lib/ai/prompts";
import { Document } from "@/lib/database/db";

interface ChatComposerProps {
  onSendMessage: (
    message: string,
    attachments?: { type: string; data: string; name: string }[],
    model?: string
  ) => void;
  isStreaming: boolean;
  onStop: () => void;
  currentMode: ResponseMode;
  onSelectMode: (mode: ResponseMode) => void;
  availableDocuments: Document[];
  selectedDocumentIds: string[];
  onToggleDocument: (docId: string) => void;
  onDocumentUploaded?: (doc: Document) => void;
}

export function ChatComposer({
  onSendMessage,
  isStreaming,
  onStop,
  currentMode,
  onSelectMode,
  availableDocuments,
  selectedDocumentIds,
  onToggleDocument,
  onDocumentUploaded,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; url: string } | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const isSubmittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !attachedImage) || isStreaming || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    const textToSend = input.trim();
    const attachments = attachedImage
      ? [{ type: "image", data: attachedImage.url, name: attachedImage.name }]
      : undefined;

    setInput("");
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    onSendMessage(textToSend, attachments, undefined);

    // Release submit lock after small timeout to prevent rapid double-clicks
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage({
          name: file.name,
          url: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.document) {
          onDocumentUploaded?.(data.document);
          onToggleDocument(data.document.id);
        }
      }
    } catch (err) {
      console.error("Failed to upload document from chat:", err);
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-safe pt-1.5 sm:pt-2">
      {/* Attached Image Preview */}
      {attachedImage && (
        <div className="mb-2 p-2 rounded-xl bg-slate-900/80 border border-white/10 inline-flex items-center gap-2 max-w-full">
          <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs text-slate-200 truncate max-w-[200px] sm:max-w-xs">{attachedImage.name}</span>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-white rounded flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Textbooks Grounding Badges */}
      {selectedDocumentIds.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-cyan-400 font-medium flex items-center gap-1 text-[11px] sm:text-xs">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Grounded in {selectedDocumentIds.length} doc{selectedDocumentIds.length > 1 ? "s" : ""}:</span>
          </span>
          <div className="flex flex-wrap gap-1">
            {selectedDocumentIds.map((id) => {
              const doc = availableDocuments.find((d) => d.id === id);
              return (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-500/30 text-blue-300 text-[10px] sm:text-[11px] flex items-center gap-1 max-w-[140px] truncate"
                >
                  <span className="truncate">{doc?.name || "Textbook"}</span>
                  <button onClick={() => onToggleDocument(id)}>
                    <X className="w-3 h-3 hover:text-white flex-shrink-0" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl border border-white/10 bg-[#070e1e]/95 backdrop-blur-xl shadow-2xl focus-within:border-blue-500/50 focus-within:shadow-blue-500/10 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            currentMode === "QUICK_ANSWER"
              ? "Ask anything for a fast, verified answer (e.g. formula, definition, code)..."
              : currentMode === "THINKING"
              ? "Ask a complex derivation, math proof, or algorithm trade-off..."
              : "Ask any question (Deep Search across Google & live web active)..."
          }
          rows={1}
          className="w-full pt-3 pb-2 px-3.5 sm:px-4 bg-transparent text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-36 sm:max-h-48 leading-relaxed"
        />

        {/* Toolbar Row */}
        <div className="flex items-center justify-between px-2 sm:px-3 pb-2 sm:pb-2.5 pt-1 border-t border-white/[0.04] gap-1">
          {/* Left: 3-Mode Intelligent Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => onSelectMode("QUICK_ANSWER")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                currentMode === "QUICK_ANSWER"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Quick Answer mode: Fast, direct, concise, verified answers"
            >
              <Zap className="w-3 h-3 flex-shrink-0" />
              <span className="hidden min-[480px]:inline">Quick</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode("THINKING")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                currentMode === "THINKING"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Thinking mode: Step-by-step reasoning, mathematical proofs, derivations"
            >
              <Brain className="w-3 h-3 flex-shrink-0" />
              <span className="hidden min-[480px]:inline">Thinking</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode("DEEP_SEARCH")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                currentMode === "DEEP_SEARCH"
                  ? "bg-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Deep Search mode: Real-time search across all Google sites & live web"
            >
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="hidden min-[480px]:inline">Deep Search</span>
            </button>
          </div>

          {/* Right: Attachments & Send Action */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
            {/* Textbook Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDocPicker(!showDocPicker)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors relative touch-manipulation active:scale-95"
                title="Ground answer in uploaded textbooks (RAG)"
              >
                <BookOpen className="w-4 h-4" />
                {selectedDocumentIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan-500 text-black font-bold text-[9px] flex items-center justify-center">
                    {selectedDocumentIds.length}
                  </span>
                )}
              </button>

              {showDocPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDocPicker(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 bottom-full mb-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-72 rounded-xl border border-white/15 bg-[#050b18] shadow-2xl p-3 z-50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <span>Select Textbook (RAG)</span>
                      <a href="/documents" className="text-cyan-400 hover:underline">
                        Library +
                      </a>
                    </div>
                    {availableDocuments.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">
                        No textbooks uploaded yet. Use the paperclip icon or visit Library to upload.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {availableDocuments.map((doc) => {
                          const isChecked = selectedDocumentIds.includes(doc.id);
                          return (
                            <div
                              key={doc.id}
                              onClick={() => onToggleDocument(doc.id)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                                isChecked
                                  ? "bg-blue-950/60 border-blue-500/40 text-white"
                                  : "border-white/5 text-slate-400 hover:bg-white/5"
                              }`}
                            >
                              <div className="truncate flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                <span className="truncate">{doc.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                                {doc.pageCount}p
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Document Upload Input (.pdf, .txt, .docx, .md) */}
            <input
              type="file"
              ref={docInputRef}
              onChange={handleDocUpload}
              accept=".pdf,.txt,.md,.csv,.docx"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingDoc}
              onClick={() => docInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors disabled:opacity-50 active:scale-95"
              title="Upload PDF or notes to ground in conversation"
            >
              {isUploadingDoc ? (
                <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            {/* Image Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors active:scale-95"
              title="Upload diagram image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all ml-0.5 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden min-[360px]:inline">Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() && !attachedImage}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-blue-600/30 transition-all ml-0.5 active:scale-95"
                title="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { Conversation, Document, Message } from "@/lib/database/db";
import { ResponseMode } from "@/lib/ai/prompts";
import { Download, Trash2, Zap, Brain, Globe } from "lucide-react";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<ResponseMode>("QUICK_ANSWER");
  const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  const isSubmittingRef = useRef(false);
  const justCreatedConvIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and documents on mount
  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, []);

  // When active conversation changes, load its messages
  useEffect(() => {
    if (justCreatedConvIdRef.current === activeConversationId) {
      // Skip refetching if this conversation was just initialized by our local streaming flow
      justCreatedConvIdRef.current = null;
      return;
    }

    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  }

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setAvailableDocuments(data.documents || []);
      }
    } catch (e) {
      console.error("Failed to load documents:", e);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.conversation?.teachingMode) {
          const mode = data.conversation.teachingMode;
          if (mode === "QUICK_ANSWER" || mode === "THINKING" || mode === "DEEP_SEARCH") {
            setCurrentMode(mode as ResponseMode);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  const handleNewChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPin }),
      });
      fetchConversations();
    } catch (e) {
      console.error("Failed to toggle pin:", e);
    }
  };

  const handleToggleDocument = (docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Main Send Message Handler with strict single-response and idempotency locking
  const handleSendMessage = async (
    text: string,
    attachments?: { type: string; data: string; name: string }[],
    isRegeneration = false
  ) => {
    if (!text.trim() || isStreaming || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsStreaming(true);

    const now = Date.now();
    const requestId = "req-" + now + "-" + Math.random().toString(36).substring(2, 7);

    // If NOT regenerating, add the optimistic user message
    if (!isRegeneration) {
      const tempUserMsg: Message = {
        id: "user-" + now,
        conversationId: activeConversationId || "temp",
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
    }

    // Add exactly one placeholder for the streaming assistant response
    const tempAssistantId = "ast-" + now;
    setCurrentStreamingId(tempAssistantId);

    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      conversationId: activeConversationId || "temp",
      role: "assistant",
      content: "",
      modelUsed: "Astra 6 (URL Inference)",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempAssistantMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          prompt: text,
          mode: currentMode,
          documentIds: selectedDocumentIds,
          regenerate: isRegeneration,
          requestId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat API request failed with status ${response.status}`);
      }

      const returnedConvId = response.headers.get("X-Conversation-Id");
      if (returnedConvId && returnedConvId !== activeConversationId) {
        justCreatedConvIdRef.current = returnedConvId;
        setActiveConversationId(returnedConvId);
        fetchConversations();
      }

      const rawCitations = response.headers.get("X-Citations");
      let parsedCitations = [];
      if (rawCitations) {
        try {
          parsedCitations = JSON.parse(decodeURIComponent(rawCitations));
        } catch {
          // ignore parsing error
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantId
                ? {
                    ...msg,
                    content: streamedContent,
                    citations: parsedCitations.length > 0 ? parsedCitations : undefined,
                  }
                : msg
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Streaming error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "An error occurred while connecting to the inference engine. Please check model connectivity in Admin settings.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setCurrentStreamingId(null);
      isSubmittingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  // Regeneration: Replaces the existing assistant response without duplicating user message
  const handleRegenerate = (assistantMsgId: string) => {
    if (isStreaming || isSubmittingRef.current) return;

    const assistantIdx = messages.findIndex((m) => m.id === assistantMsgId);
    if (assistantIdx === -1) return;

    // Find previous user message
    const priorUser = messages
      .slice(0, assistantIdx)
      .reverse()
      .find((m) => m.role === "user");

    if (!priorUser) return;

    // Remove the assistant message from state
    setMessages((prev) => prev.filter((_, idx) => idx !== assistantIdx));

    // Re-issue with regenerate flag
    handleSendMessage(priorUser.content, undefined, true);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setCurrentStreamingId(null);
      isSubmittingRef.current = false;
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const text = messages
      .map(
        (m) =>
          `[${m.role.toUpperCase()}] (${new Date(m.createdAt).toLocaleTimeString()}):\n${
            m.content
          }\n\n`
      )
      .join("---\n\n");

    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic-session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-[#030712] overflow-hidden text-slate-200">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => setActiveConversationId(id)}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
          onTogglePin={handleTogglePin}
          selectedMode={currentMode}
          onSelectMode={(m) => setCurrentMode(m as ResponseMode)}
        />

        {/* Main Conversation Canvas */}
        <main className="flex-1 flex flex-col bg-[#030712] relative overflow-hidden bg-grid-pattern">
          {/* Radiant Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] radiant-glow pointer-events-none opacity-40" />

          {/* Top Bar for active session */}
          {messages.length > 0 && (
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06] bg-[#050b18]/70 backdrop-blur-md z-10 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white truncate max-w-sm">
                  {conversations.find((c) => c.id === activeConversationId)?.title ||
                    "Current Session"}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  {currentMode === "QUICK_ANSWER" && <Zap className="w-3 h-3 text-cyan-400" />}
                  {currentMode === "THINKING" && <Brain className="w-3 h-3 text-cyan-400" />}
                  {currentMode === "DEEP_SEARCH" && <Globe className="w-3 h-3 text-cyan-400" />}
                  <span>{currentMode.replace(/_/g, " ")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportChat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  title="Export Markdown transcript"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>
          )}

          {/* Conversation Stream or Welcome Screen */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <WelcomeScreen
                onSelectPrompt={(p, m) => {
                  if (m) setCurrentMode(m);
                  handleSendMessage(p);
                }}
                currentMode={currentMode}
                onSelectMode={(m) => setCurrentMode(m)}
              />
            ) : (
              <div className="divide-y divide-white/[0.02]">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreaming && msg.id === currentStreamingId}
                    mode={currentMode}
                    onRegenerate={() => handleRegenerate(msg.id)}
                    onFollowUpClick={(q) => handleSendMessage(q)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer Input Area */}
          <ChatComposer
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStop={handleStopStreaming}
            currentMode={currentMode}
            onSelectMode={(m) => setCurrentMode(m)}
            availableDocuments={availableDocuments}
            selectedDocumentIds={selectedDocumentIds}
            onToggleDocument={handleToggleDocument}
            onDocumentUploaded={(doc) => setAvailableDocuments((prev) => [doc, ...prev])}
          />
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  MessageSquarePlus,
  Search,
  Pin,
  Trash2,
  Bookmark,
  X,
  Layers,
  ChevronLeft
} from "lucide-react";
import { Conversation } from "@/lib/database/db";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onTogglePin,
  selectedMode,
  isOpenMobile = false,
  onCloseMobile,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.isPinned);
  const recent = filtered.filter((c) => !c.isPinned);

  const handleSelectConv = (id: string) => {
    onSelect(id);
    onCloseMobile?.();
  };

  const handleCreateNew = () => {
    onNewChat();
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="w-full h-full flex flex-col justify-between bg-[#040814] text-slate-200">
      {/* Top Header & Actions */}
      <div className="p-3.5 sm:p-4 space-y-3">
        {/* Mobile top bar with close button */}
        <div className="flex md:hidden items-center justify-between pb-1 border-b border-white/5">
          <span className="font-semibold text-xs text-white">Academic Sessions</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all group"
        >
          <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>New Academic Session</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 sm:top-2.5" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 sm:py-1.5 rounded-lg bg-slate-900/60 border border-white/10 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {/* Pinned section */}
        {pinned.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pin className="w-3 h-3 text-cyan-400" />
              <span>Pinned Discussions</span>
            </div>
            {pinned.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onSelect={() => handleSelectConv(conv.id)}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                onTogglePin={(e) => {
                  e.stopPropagation();
                  onTogglePin(conv.id, conv.isPinned);
                }}
              />
            ))}
          </div>
        )}

        {/* Recent Section */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Bookmark className="w-3 h-3 text-blue-400" />
            <span>Recent Sessions</span>
          </div>

          {recent.length === 0 && pinned.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations yet. Start a new session!
            </div>
          ) : (
            recent.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onSelect={() => handleSelectConv(conv.id)}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                onTogglePin={(e) => {
                  e.stopPropagation();
                  onTogglePin(conv.id, conv.isPinned);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-3 pb-safe border-t border-white/[0.08] bg-slate-950/40 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-slate-400 px-1">
          <span className="text-[11px]">Active Mode</span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
            {selectedMode.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-500 px-1 text-[10px]">
          <span>Architecture</span>
          <span className="font-mono text-slate-400">CoralGenz Global</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 flex-shrink-0 h-full border-r border-white/[0.08]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-In Overlay Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <aside className="relative w-4/5 max-w-xs h-[100dvh] bg-[#040814] border-r border-white/10 z-10 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 pb-safe">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2.5 rounded-lg cursor-pointer text-xs transition-all ${
        isActive
          ? "bg-blue-600/20 text-white border border-blue-500/30 font-medium"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
      }`}
    >
      <div className="truncate pr-2 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-cyan-400" : "bg-slate-600"}`}></span>
        <span className="truncate">{conversation.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          className="p-1.5 text-slate-500 hover:text-cyan-400 rounded"
          title={conversation.isPinned ? "Unpin" : "Pin"}
        >
          <Pin className={`w-3.5 h-3.5 ${conversation.isPinned ? "fill-cyan-400 text-cyan-400" : ""}`} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-500 hover:text-red-400 rounded"
          title="Delete session"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

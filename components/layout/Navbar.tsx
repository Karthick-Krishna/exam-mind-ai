"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  Activity,
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  CheckSquare
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/documents", label: "Textbooks (RAG)", icon: GraduationCap },
    { href: "/admin", label: "Model Settings", icon: Activity },
    { href: "/dashboard", label: "Workspace", icon: LayoutDashboard },
    { href: "/quizzes", label: "Assessments", icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#212121]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between">
        {/* Brand Crest & ChatGPT-style Model Pill */}
        <div className="flex items-center gap-3">
          <Link href="/chat" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-[#171717] border border-white/10 shadow-lg shadow-black/40 group-hover:border-emerald-500/50 transition-all flex-shrink-0">
              <img
                src="/logo.png"
                alt="EXAM MIND AI Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold tracking-tight text-white text-sm sm:text-base">ExamMind</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex-shrink-0">
                AI 4.0
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav - ChatGPT Glassmorphic Buttons */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#2f2f2f] text-white border border-white/10 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info Badges (Desktop) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2f2f2f]/80 hover:bg-[#383838] border border-white/10 text-xs transition-colors shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-zinc-300">CoralGenz Neural Engine</span>
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-md transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-1.5">
          {pathname !== "/chat" && (
            <Link
              href="/chat"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs shadow-md active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 active:scale-95 transition-transform"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#171717]/95 backdrop-blur-2xl px-3 sm:px-4 pt-3 pb-safe space-y-2 max-h-[calc(100dvh-3.5rem)] overflow-y-auto animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#2f2f2f] text-white border border-white/10"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#212121] border border-white/5 text-xs">
              <span className="text-zinc-400 font-mono text-[11px]">Neural Engine</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CoralGenz Active
              </span>
            </div>

            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black font-semibold text-xs shadow-lg active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>New Academic Chat</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

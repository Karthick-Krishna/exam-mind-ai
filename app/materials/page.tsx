"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  FileText,
  Sparkles,
  Download,
  Trash2,
  BookOpen,
  Layers,
  Zap,
  Bookmark,
  Share2
} from "lucide-react";
import { StudyMaterial } from "@/lib/database/db";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { formatDate } from "@/lib/utils";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("Electromagnetism & Maxwell Equations");
  const [type, setType] = useState<"NOTES" | "FLASHCARDS" | "REVISION" | "MINDMAP" | "FORMULASHEET">("FORMULASHEET");

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
        if (data.materials?.length > 0 && !activeMaterial) {
          setActiveMaterial(data.materials[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveMaterial(data.material);
        fetchMaterials();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (activeMaterial?.id === id) {
        setActiveMaterial(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!activeMaterial) return;
    const blob = new Blob([activeMaterial.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeMaterial.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Academic Study Material Generator
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Instantly synthesize LaTeX formula sheets, high-yield examination notes, flashcards, and conceptual mind maps.
            </p>
          </div>
        </div>

        {/* Generator Form & Active Material Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Box */}
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-slate-950/60 p-6 space-y-5 h-fit">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Generate Academic Material</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Academic Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Topic Name</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Material Format</label>
                <div className="space-y-1.5">
                  {[
                    { id: "FORMULASHEET", label: "Formula Sheet (LaTeX Tables)" },
                    { id: "REVISION", label: "High-Yield Revision Notes" },
                    { id: "FLASHCARDS", label: "Active Recall Flashcards" },
                    { id: "MINDMAP", label: "Conceptual Mind Map" },
                    { id: "NOTES", label: "Comprehensive Lecture Notes" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setType(item.id as any)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        type === item.id
                          ? "bg-blue-600/30 border-cyan-400 text-cyan-300 font-semibold"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-40 transition-all"
              >
                {generating ? "Synthesizing Material..." : "Generate Study Material"}
              </button>
            </form>

            {/* List of previously generated materials */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Saved Materials ({materials.length})
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setActiveMaterial(m)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      activeMaterial?.id === m.id
                        ? "bg-blue-950/60 border-blue-500/40 text-white font-medium"
                        : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate pr-2">{m.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(m.id);
                      }}
                      className="p-1 hover:text-red-400 text-slate-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Material Viewer */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-6 md:p-8 space-y-6 shadow-2xl min-h-[500px]">
            {activeMaterial ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeMaterial.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{activeMaterial.subject}</span>
                      <span>•</span>
                      <span>Format: {activeMaterial.type}</span>
                      <span>•</span>
                      <span>{formatDate(activeMaterial.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.md)</span>
                  </button>
                </div>

                {/* If flashcards format */}
                {activeMaterial.type === "FLASHCARDS" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      try {
                        const cards = JSON.parse(activeMaterial.content);
                        return cards.map((c: any, i: number) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl border border-blue-500/20 bg-[#050b18] space-y-3"
                          >
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                              {c.tag || "Card"} {i + 1}
                            </span>
                            <div className="font-semibold text-sm text-white">{c.front}</div>
                            <div className="pt-2 border-t border-white/5 text-xs text-slate-300">
                              <MarkdownRenderer content={c.back} />
                            </div>
                          </div>
                        ));
                      } catch {
                        return <MarkdownRenderer content={activeMaterial.content} />;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <MarkdownRenderer content={activeMaterial.content} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-medium">Select or generate study material to preview.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

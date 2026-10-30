"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  BookOpen,
  Target
} from "lucide-react";

export default function LearnPage() {
  const [subject, setSubject] = useState("Mathematics");
  const [goal, setGoal] = useState("Master Linear Algebra & Vector Calculus for Machine Learning");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, goal, difficulty, weeks }),
      });
      if (res.ok) {
        const data = await res.json();
        setLearningPath(data.learningPath);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-white/10 pb-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Personalized Academic Learning Paths
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Construct structured, milestone-driven study roadmaps calibrated to your current knowledge and target mastery timeline.
          </p>
        </div>

        {/* Generator Form */}
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl space-y-4">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
              <label className="block text-slate-400 mb-1 font-medium">Target Learning Goal / Exam</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Foundational">Foundational / Beginner</option>
                <option value="Intermediate">Intermediate (Undergraduate)</option>
                <option value="Advanced">Advanced (Graduate / Research)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Timeline Duration</label>
              <select
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value={2}>2 Weeks (Intensive Sprint)</option>
                <option value={4}>4 Weeks (Standard Month)</option>
                <option value={8}>8 Weeks (Full Semester)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-blue-600/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Synthesizing Roadmap..." : "Generate Custom Learning Roadmap"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Roadmap Display */}
        {learningPath && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/30 to-slate-950/40 border border-blue-500/20 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{learningPath.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Duration: {learningPath.durationWeeks} Weeks</span>
                  <span>•</span>
                  <span>Target: {learningPath.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Modules Timeline */}
            <div className="space-y-4">
              {learningPath.modules.map((mod: any) => (
                <div
                  key={mod.week}
                  className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                        W{mod.week}
                      </span>
                      <div>
                        <h3 className="font-semibold text-sm text-white">{mod.title}</h3>
                        <p className="text-xs text-slate-400">{mod.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      Target: {mod.masteryTarget}% Mastery
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Weekly Milestones:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {mod.milestones.map((m: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

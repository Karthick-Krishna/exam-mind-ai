"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  BarChart3,
  TrendingUp,
  Flame,
  BrainCircuit,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/learning");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const radarData = data?.subjectRadarData || [
    { subject: "Mathematics", mastery: 88, fullMark: 100 },
    { subject: "Computer Science", mastery: 92, fullMark: 100 },
    { subject: "Physics", mastery: 74, fullMark: 100 },
    { subject: "Engineering", mastery: 80, fullMark: 100 },
    { subject: "Humanities & Law", mastery: 68, fullMark: 100 },
    { subject: "Chemistry & Bio", mastery: 65, fullMark: 100 },
  ];

  const activityData = data?.activityTrend || [
    { day: "Mon", questions: 12, hours: 1.5 },
    { day: "Tue", questions: 18, hours: 2.1 },
    { day: "Wed", questions: 9, hours: 1.0 },
    { day: "Thu", questions: 24, hours: 3.0 },
    { day: "Fri", questions: 15, hours: 1.8 },
    { day: "Sat", questions: 22, hours: 2.7 },
    { day: "Sun", questions: 19, hours: 2.4 },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Academic Intelligence Workspace
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Track multi-disciplinary topic mastery, learning streak velocity, and diagnostic concept retention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/learn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Generate Study Roadmap</span>
            </a>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Overall Concept Mastery</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {data?.averageMastery || 82}%
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+6.4% from last assessment</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Academic Inquiries Solved</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {data?.totalQuestionsAnswered || 119}
            </div>
            <div className="text-[11px] text-slate-400">Across 14 major subject domains</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Active Learning Streak</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-3xl font-extrabold text-orange-400">
              {data?.currentStreak || 5} Days
            </div>
            <div className="text-[11px] text-slate-400">Consistent daily study cadence</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Academic Level Target</span>
              <BrainCircuit className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white truncate">
              {data?.user?.academicLevel || "UNDERGRADUATE"}
            </div>
            <div className="text-[11px] text-purple-300">Calibrated difficulty scaling</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart: Multidisciplinary Mastery */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Discipline Mastery Radar</h3>
                <p className="text-xs text-slate-400">Cross-domain competency score</p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded">
                Normalized Score (0-100)
              </span>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
                  <Radar
                    name="Mastery"
                    dataKey="mastery"
                    stroke="#38bdf8"
                    fill="#2563eb"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Chart: Activity Cadence */}
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Weekly Learning Inquiries</h3>
                <p className="text-xs text-slate-400">Questions solved per day</p>
              </div>
              <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/20 px-2 py-0.5 rounded">
                Past 7 Days
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#050b18",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="questions"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#blueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Topic Mastery Progress List */}
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-950/60 space-y-4">
          <h3 className="text-base font-semibold text-white">Verified Concept Retention by Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.progress?.map((p: any) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{p.topic}</span>
                  <span className="font-mono text-cyan-400 font-bold">{p.masteryLevel}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${p.masteryLevel}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{p.subject}</span>
                  <span>{p.questionsAnswered} questions solved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

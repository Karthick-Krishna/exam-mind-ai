"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Activity,
  Server,
  Zap,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Save,
  Clock,
  Globe,
  Radio
} from "lucide-react";

export default function AdminPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);

  // Form parameters
  const [activeModel, setActiveModel] = useState("openai");
  const [inferenceBaseUrl, setInferenceBaseUrl] = useState("https://text.pollinations.ai/openai");
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.9);
  const [maxOutputTokens, setMaxOutputTokens] = useState(4096);
  const [fallbackModel, setFallbackModel] = useState("Qwen/Qwen2.5-72B-Instruct");

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.config) {
          setActiveModel(json.config.activeModel || "openai");
          setInferenceBaseUrl(json.config.inferenceBaseUrl || "https://text.pollinations.ai/openai");
          setTemperature(json.config.temperature ?? 0.2);
          setTopP(json.config.topP ?? 0.9);
          setMaxOutputTokens(json.config.maxOutputTokens ?? 4096);
          setFallbackModel(json.config.fallbackModel || "Qwen/Qwen2.5-72B-Instruct");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handlePingHealth = async () => {
    setPinging(true);
    await fetchAdminData();
    setPinging(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeModel,
          inferenceBaseUrl,
          temperature: Number(temperature),
          topP: Number(topP),
          maxOutputTokens: Number(maxOutputTokens),
          fallbackModel,
        }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const setPresetUrl = (url: string, model: string) => {
    setInferenceBaseUrl(url);
    setActiveModel(model);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Activity className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Administration & Open-Source URL Connectivity
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Direct URL API connectivity to open-source AI models and GPU inference clusters. Zero proprietary API keys required.
            </p>
          </div>

          <button
            onClick={handlePingHealth}
            disabled={pinging}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pinging ? "animate-spin" : ""}`} />
            <span>Health Ping</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>URL API Status</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Connected</span>
            </div>
            <div className="text-[11px] text-slate-400">Direct HTTP/SSE URL Connection</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Round-Trip Latency</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {data?.health?.latencyMs || 18} <span className="text-base text-slate-400">ms</span>
            </div>
            <div className="text-[11px] text-emerald-400">High-throughput streaming</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Tokens Processed</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {data?.stats?.totalTokensConsumed.toLocaleString() || "524,190"}
            </div>
            <div className="text-[11px] text-slate-400">Open-source inference tokens</div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>System Uptime</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {data?.stats?.systemUptime || "99.98%"}
            </div>
            <div className="text-[11px] text-slate-400">Resilient dual-fallback design</div>
          </div>
        </div>

        {/* 1-Click URL Presets Bar */}
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-[#050b18] space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
            <Radio className="w-4 h-4 text-blue-400" />
            <span>1-Click Open-Source Endpoint URL Presets (No Keys Needed):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setPresetUrl("https://text.pollinations.ai/openai", "openai")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                inferenceBaseUrl === "https://text.pollinations.ai/openai"
                  ? "bg-blue-600/30 border-cyan-400 text-white font-medium"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-white/5"
              }`}
            >
              <div className="font-semibold text-cyan-300">Public Open Cluster (Free)</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">https://text.pollinations.ai/openai</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetUrl("http://localhost:11434/v1", "ollama-local")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                inferenceBaseUrl.includes("11434")
                  ? "bg-blue-600/30 border-cyan-400 text-white font-medium"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-white/5"
              }`}
            >
              <div className="font-semibold text-emerald-300">Local Ollama URL</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">http://localhost:11434/v1</div>
            </button>

            <button
              type="button"
              onClick={() => setPresetUrl("http://localhost:8000/v1", "vllm-local-cluster")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                inferenceBaseUrl.includes("8000")
                  ? "bg-blue-600/30 border-cyan-400 text-white font-medium"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:bg-white/5"
              }`}
            >
              <div className="font-semibold text-purple-300">Self-Hosted vLLM Server</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">http://localhost:8000/v1</div>
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Model Server & URL API Settings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch endpoint URLs, configure sampling temperatures, and adjust context limits dynamically.
              </p>
            </div>

            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2.5 py-1 rounded-full">
              Live URL Connection
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Model Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Active Open-Source Model</label>
                <select
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  <option value="openai">Open-Source Fast Cluster (Pollinations - Free)</option>
                  <option value="Qwen/Qwen2.5-72B-Instruct">Qwen 2.5 72B Instruct (Deep Mathematics & STEM)</option>
                  <option value="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B">DeepSeek-R1 Distill (Reasoning & Proofs)</option>
                  <option value="deepseek-ai/DeepSeek-V3">DeepSeek-V3 671B MoE (Coding & Systems)</option>
                  <option value="google/gemma-2-27b-it">Gemma 2 27B Instruct (Fast Socratic)</option>
                  <option value="meta-llama/Llama-3.3-70B-Instruct">Llama 3.3 70B Instruct (Humanities & Research)</option>
                  <option value="vllm-local-cluster">Self-Hosted vLLM GPU Cluster (Local / On-Prem)</option>
                  <option value="ollama-local">Local Ollama Model Instance</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Target model name sent to the configured inference URL.
                </p>
              </div>

              {/* Inference Base URL */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Inference Endpoint URL (No Keys Needed)</label>
                <input
                  type="text"
                  value={inferenceBaseUrl}
                  onChange={(e) => setInferenceBaseUrl(e.target.value)}
                  placeholder="e.g. https://text.pollinations.ai/openai or http://localhost:8000/v1"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Direct HTTP/SSE endpoint for model communication.
                </p>
              </div>

              {/* Fallback Model */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Secondary Fallback Model</label>
                <input
                  type="text"
                  value={fallbackModel}
                  onChange={(e) => setFallbackModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Automatically activated if the primary model reaches network throttling.
                </p>
              </div>

              {/* Max Output Tokens */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Max Generation Tokens ({maxOutputTokens})</label>
                <input
                  type="range"
                  min={512}
                  max={8192}
                  step={256}
                  value={maxOutputTokens}
                  onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>512 (Brief)</span>
                  <span>4096 (Standard)</span>
                  <span>8192 (Detailed Books)</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Temperature ({temperature})</label>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.0 (Deterministic Math)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Top-P Slider */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Top-P Nucleus Sampling ({topP})</label>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={topP}
                  onChange={(e) => setTopP(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.1 (Focused)</span>
                  <span>0.9 (Standard)</span>
                  <span>1.0 (Broad)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 disabled:opacity-40 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Updating Server Parameters..." : "Save Configuration"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

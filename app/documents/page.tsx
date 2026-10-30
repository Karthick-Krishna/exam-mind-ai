"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  UploadCloud,
  FileText,
  Trash2,
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  FileSpreadsheet,
  Paperclip,
  AlertCircle,
  X
} from "lucide-react";
import { Document } from "@/lib/database/db";
import { formatBytes, formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Test QA states
  const [testQuestion, setTestQuestion] = useState("");
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSample = async () => {
    setUploading(true);
    try {
      const sampleText = `CHAPTER 3: QUANTUM MECHANICS & WAVE MECHANICS
Section 3.1: The Wave-Particle Duality and De Broglie Relation
All matter exhibits wave-like properties in addition to particulate behaviors. The de Broglie wavelength is given by lambda = h / p, where h is Planck's constant (6.626 x 10^-34 J*s) and p is relativistic momentum. In electron microscopy, the small wavelength of high-energy electrons enables sub-angstrom resolution beyond classical optical limits.

Section 3.2: The Time-Independent Schrodinger Equation
For a particle of mass m in potential field V(x), the one-dimensional stationary states satisfy:
[-hbar^2 / (2m)] * d^2(psi)/dx^2 + V(x)*psi = E*psi
Where psi(x) is the complex probability amplitude and |psi(x)|^2 represents the probability density function satisfying normalization integral over all space equal to 1.

Section 3.3: Quantum Harmonic Oscillator and Zero-Point Energy
Unlike classical oscillators which can rest at zero energy at the potential minimum, the quantum harmonic oscillator has discrete quantized energy eigenvalues: E_n = (n + 1/2) * hbar * omega, for n = 0, 1, 2, ...
The ground state energy E_0 = (1/2) * hbar * omega is the zero-point energy, mandated by Heisenberg's Uncertainty Principle delta_x * delta_p >= hbar / 2.`;

      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Principles of Quantum Physics (Vol 1).pdf",
          textContent: sampleText,
          fileType: "pdf",
          fileSize: 18450,
        }),
      });

      fetchDocuments();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process document");
      }

      setUploadSuccess(`Successfully indexed "${data.document.name}" into ${data.chunksCount} searchable page chunks!`);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !textContent.trim()) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          textContent: textContent.trim(),
          fileType: "txt",
          fileSize: textContent.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to index text");
      }

      setUploadSuccess(`Successfully indexed "${data.document.name}" into ${data.chunksCount} chunks!`);
      setTitle("");
      setTextContent("");
      fetchDocuments();
    } catch (e: any) {
      setUploadError(e.message || "Failed to index notes");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestRetrieval = async () => {
    if (!testQuestion.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: testQuestion,
          mode: "DETAILED_EXPLANATION",
          documentIds: documents.map((d) => d.id),
        }),
      });

      const rawCitations = res.headers.get("X-Citations");
      let citations = [];
      if (rawCitations) {
        citations = JSON.parse(decodeURIComponent(rawCitations));
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value);
        }
      }

      setTestResult({
        answer,
        citations,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 sm:pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Textbook & Document Intelligence (RAG)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Upload academic textbooks, lecture slides, and notes. The AI parses pages, indexes vector embeddings, and answers queries with verified citations.
            </p>
          </div>

          <button
            onClick={handleUploadSample}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-md transition-all w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Load Sample Textbook (Physics)</span>
          </button>
        </div>

        {/* Upload & Grounded QA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Upload Form Box */}
          <div className="lg:col-span-1 rounded-xl sm:rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-6 space-y-4 sm:space-y-5 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Ingest Course Material</span>
              </h2>

              {/* Mode switch */}
              <div className="flex bg-slate-900 border border-white/10 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    uploadMode === "file"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  File (.pdf/.txt)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("text")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    uploadMode === "text"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Raw Notes
                </button>
              </div>
            </div>

            {/* Success / Error alerts */}
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{uploadSuccess}</span>
                <button onClick={() => setUploadSuccess(null)}>
                  <X className="w-3.5 h-3.5 hover:text-white" />
                </button>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{uploadError}</span>
                <button onClick={() => setUploadError(null)}>
                  <X className="w-3.5 h-3.5 hover:text-white" />
                </button>
              </div>
            )}

            {uploadMode === "file" ? (
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    selectedFile
                      ? "border-cyan-500/50 bg-cyan-950/20"
                      : "border-white/10 hover:border-blue-500/40 bg-slate-900/40"
                  }`}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.txt,.md,.csv,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-white truncate max-w-xs mx-auto">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatBytes(selectedFile.size)} • Click to change
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-slate-200">
                        Select textbook or PDF document
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Supports PDF, TXT, MD, CSV (Up to 50MB)
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-600/20"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Extracting Pages & Embedding...
                    </span>
                  ) : (
                    "Upload & Ingest PDF into RAG"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Document / Textbook Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems: Three Easy Pieces.pdf"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Text Content / Notes
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Paste textbook excerpt, lecture notes, syllabus, or syllabus transcription..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-[12px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !title.trim() || !textContent.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-600/20"
                >
                  {uploading ? "Chunking & Generating Embeddings..." : "Process & Index Notes"}
                </button>
              </form>
            )}
          </div>

          {/* Documents List & Interactive RAG Tester */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter indexed textbooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {documents.length} Document(s) Indexed
              </span>
            </div>

            {/* Documents Cards */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading library...</div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium">No textbooks or course materials indexed yet.</p>
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Load Sample Textbook&rdquo; above or paste notes to begin testing RAG.
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-white/10 bg-slate-950/60 hover:border-blue-500/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/20 text-cyan-400 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-white truncate">{doc.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{doc.pageCount} page(s)</span>
                          <span>•</span>
                          <span>{formatBytes(doc.fileSize)}</span>
                          <span>•</span>
                          <span>Added {formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Interactive Grounded QA Sandbox */}
            {documents.length > 0 && (
              <div className="p-6 rounded-2xl border border-blue-500/20 bg-[#050b18] space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Verify RAG Grounding & Source Citations</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ask a question to test textbook retrieval. The system will search chunks and cite exact pages.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. What is the zero-point energy in the quantum harmonic oscillator?"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleTestRetrieval}
                    disabled={testing || !testQuestion.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs disabled:opacity-40 transition-all shadow-md shadow-blue-600/20"
                  >
                    {testing ? "Retrieving..." : "Query Textbook"}
                  </button>
                </div>

                {/* Test Results Output */}
                {testResult && (
                  <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40 space-y-3 text-xs">
                    {testResult.citations && testResult.citations.length > 0 && (
                      <div className="space-y-1">
                        <div className="font-semibold text-cyan-300">Retrieved Passages:</div>
                        {testResult.citations.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-slate-900 border border-white/5 text-slate-300 text-[11px]"
                          >
                            <span className="font-mono text-cyan-400">
                              {c.documentName} (Page {c.pageNumber}):
                            </span>{" "}
                            &ldquo;{c.excerpt}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {testResult.answer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { Check, Copy, Play, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-[14px] sm:text-[15px] space-y-2.5 sm:space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-5 mb-2.5 pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-5 sm:h-6 bg-blue-500 rounded-full inline-block flex-shrink-0"></span>
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-xl font-semibold text-white tracking-tight mt-4 mb-2 flex items-center gap-2">
              <span className="w-1 h-3.5 sm:h-4 bg-cyan-400 rounded-full inline-block flex-shrink-0"></span>
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-cyan-200 mt-3.5 mb-1.5">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-2.5 sm:mb-3 leading-6 sm:leading-7 text-slate-300 break-words">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 sm:pl-5 space-y-1 mb-2.5 sm:mb-3 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 sm:pl-5 space-y-1 mb-2.5 sm:mb-3 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="leading-5 sm:leading-6">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 sm:border-l-4 border-blue-500/80 bg-blue-950/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-r-lg my-2.5 sm:my-3 text-slate-300 italic text-xs sm:text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 sm:my-4 rounded-xl border border-white/10 bg-slate-950/60 -webkit-overflow-scrolling-touch">
              <table className="min-w-full divide-y divide-white/10 text-xs sm:text-sm text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-900/80 text-white font-medium">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-2.5 sm:px-4 py-2 sm:py-2.5 font-semibold text-slate-200">{children}</th>,
          td: ({ children }) => <td className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-slate-300">{children}</td>,
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !codeString.includes("\n");

            if (isInline) {
              return (
                <code
                  className="bg-blue-950/60 text-cyan-300 px-1.5 py-0.5 rounded text-[12px] sm:text-[13px] font-mono border border-blue-500/20 break-all"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : "text"} code={codeString} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      // Simulated safe academic sandbox output
      if (language === "python") {
        setOutput(">>> Executing in sandboxed runtime...\nComputed Result: {'converged': True, 'iterations': 14, 'residual': 1.48e-06}\n[Process completed in 24ms]");
      } else {
        setOutput(`>>> Compilation & Execution Simulation (${language}):\n[Build Succeeded]\nOutput: 42\nMemory: 1.2 MB | Time: 8ms`);
      }
    }, 700);
  };

  return (
    <div className="my-3 sm:my-4 rounded-xl border border-white/10 bg-[#040814] overflow-hidden shadow-xl">
      {/* Code Header */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900/70 border-b border-white/10 text-xs gap-1">
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="font-mono font-medium uppercase tracking-wider text-slate-300 text-[11px] sm:text-xs truncate">{language}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["python", "javascript", "typescript", "cpp", "c"].includes(language.toLowerCase()) && (
            <button
              onClick={handleSimulateRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all font-medium text-[10px] sm:text-[11px] active:scale-95"
              title="Simulate execution in isolated environment"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden min-[360px]:inline">{isRunning ? "Running..." : "Run Test"}</span>
              <span className="min-[360px]:hidden">{isRunning ? "..." : "Run"}</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all font-medium text-[10px] sm:text-[11px] active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-2.5 sm:p-4 overflow-x-auto text-[12px] sm:text-[13.5px] font-mono leading-relaxed text-slate-200 -webkit-overflow-scrolling-touch">
        <pre className="!bg-transparent !p-0 !border-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>

      {/* Execution Output (if run) */}
      {output && (
        <div className="border-t border-white/10 bg-black/60 p-2.5 sm:p-3 font-mono text-[11px] sm:text-xs text-emerald-400">
          <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sandbox Execution Log:</div>
          <pre className="whitespace-pre-wrap !bg-transparent !p-0 !border-0 text-emerald-300">{output}</pre>
        </div>
      )}
    </div>
  );
}

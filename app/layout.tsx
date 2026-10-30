import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "AETHER ACADEMY | Universal Educational AI & Academic Companion",
  description:
    "Next-generation open-source educational AI chatbot powered by vLLM, DeepSeek, Qwen 2.5, pgvector textbook RAG, KaTeX mathematics rendering, and university examination modes.",
  keywords: [
    "Educational AI",
    "Academic Chatbot",
    "Open-Source LLM",
    "vLLM",
    "DeepSeek R1",
    "Qwen 2.5",
    "LaTeX Math Solver",
    "Textbook RAG",
    "College Exam Preparation",
  ],
  authors: [{ name: "Aether Academic Intelligence" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

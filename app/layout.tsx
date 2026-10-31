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
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "EXAM MIND AI | Elite Educational AI Tutor & Real-Time Academic Engine",
  description:
    "EXAM MIND AI is an advanced educational AI tutor and academic reasoning engine with Google Gemini-level intelligence, live Google search, textbook RAG, and KaTeX mathematical proofs.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "EXAM MIND AI",
    "Educational AI",
    "Academic Chatbot",
    "Open-Source LLM",
    "Gemma 3",
    "DeepSeek R1",
    "Qwen 2.5",
    "Google Web Search",
    "LaTeX Math Solver",
    "Textbook RAG",
    "Exam Preparation",
  ],
  authors: [{ name: "EXAM MIND AI" }],
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

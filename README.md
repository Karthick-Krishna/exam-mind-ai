# 🌌 AETHER ACADEMY | Universal Educational AI & Academic Companion

> **Core Philosophy**: *"Understanding first. Answers backed by knowledge. Learning without limits."*  
> **Headline**: *"Your intelligence. Expanded."*

A complete, production-ready, next-generation educational AI application powered by open-source models, vLLM acceleration, pgvector textbook RAG, and an advanced pedagogical reasoning engine. Inspired by the visual prestige and dark luxury aesthetic of **Unuman Corps**.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["Next.js App Router Client (React 19 / Tailwind / KaTeX / Recharts)"]
    API["Next.js API Gateway (/api/chat, /api/documents, /api/quizzes, /api/admin)"]
    
    subgraph "Educational Reasoning Layer"
        PromptEngine["System Prompt & Pedagogy Calibrator (9 Teaching Modes)"]
        Solver["Mathematical Equation Solver & Step Verifier"]
        CodeSandbox["Code Explainer & Asymptotic Complexity Engine"]
        QuizGen["Interactive Examination & Diagnostic Evaluator"]
    end

    subgraph "AI Inference Pipeline"
        Adapter["Universal Model Adapter (vLLM / Ollama / OpenAI-Compatible)"]
        vLLM["Self-Hosted GPU Cluster (vLLM: Qwen 2.5 / DeepSeek-R1 / Gemma 3)"]
        Fallback["Autonomous Built-in Educational Synthesizer"]
    end

    subgraph "RAG & Storage Layer"
        Ingestion["Page-Aware Document Chunking & Text Extraction"]
        Embeddings["High-Dimensional Embeddings Service"]
        VectorDB["PostgreSQL with pgvector (Cosine & BM25 Hybrid Retrieval)"]
        Persistence["Persistent DB (Conversations, Messages, Quizzes, Progress)"]
    end

    Client <--> API
    API --> PromptEngine
    PromptEngine --> Adapter
    Adapter --> vLLM
    Adapter -.-> Fallback
    API --> Ingestion
    Ingestion --> Embeddings --> VectorDB
    API --> Persistence
```

---

## ✨ Core Product Capabilities

### 1. 🎓 Universal Academic Intelligence
Answers educational questions across all disciplines:
- **Mathematics**: Calculus, Linear Algebra, Differential Equations, Discrete Math, Numerical Methods, Geometry.
- **Computer Science**: Data Structures, Algorithms, Operating Systems, Networks, Compilers, Distributed Systems.
- **Science & Physics**: Quantum Mechanics, Electromagnetism, Thermodynamics, Organic Chemistry, Molecular Biology.
- **Engineering**: Electrical, Mechanical, Civil, Electronics, Systems Engineering.
- **Humanities & Law**: Economics, Jurisprudence, Philosophy, Cognitive Psychology, History.
- **7 Academic Levels**: Primary, Secondary, Higher Secondary, Diploma, Undergraduate, Postgraduate, and PhD/Research.

### 2. 🧠 9 Dedicated Teaching Modes
Switch modes on the fly during any discussion:
1. **Simple Explanation**: Everyday analogies and intuitive metaphors.
2. **Detailed Explanation**: Comprehensive breakdowns with definitions, theory, and real-world systems.
3. **College Examination Mode**: Formatted specifically for university papers:
   - Definition & Statement
   - Working Principle / Mechanism
   - Schematic / Architecture Diagram
   - Mathematical Derivation (LaTeX)
   - Practical Example Calculation
   - Advantages vs. Limitations
   - Industrial / Research Applications
   - Examination Key Takeaways
4. **Step-by-Step Solver**: Numbered phases showing formulas, substitutions, intermediate arithmetic, and verification checks.
5. **Socratic Tutor**: Probing guiding questions that lead the learner to self-discovery without spoilers.
6. **Quick Answer**: High-density factual answers without preamble.
7. **Research Mode**: Rigorous peer-reviewed literature perspective with theoretical frameworks.
8. **Beginner Mode**: Paced from first principles with zero assumptions.
9. **Advanced Mode**: Formal mathematical proofs, tensor notation, boundary conditions.

### 3. 📚 Textbook & Document Intelligence (RAG)
- Ingest **PDF, TXT, DOCX, Markdown, CSV**, or lecture notes.
- Page-aware chunking with overlap and section heading extraction.
- High-dimensional vector embeddings with hybrid semantic & keyword retrieval.
- Exact source citations with document title, page number, and section (e.g. `[Physics Vol 1, Page 14, §3.2]`).
- Clear distinction between direct textbook citations and general supplementary knowledge.

### 4. 📝 Interactive Quiz & Examination Generator
- Generates **Multiple Choice, True/False, and Short Answer** questions.
- Configurable Subject, Topic, Difficulty (Easy, Medium, Hard, Olympiad), Question Count, and Time Limit.
- Option to ground quiz questions strictly in an uploaded textbook.
- Interactive quiz interface with real-time countdown clock and instant option feedback.
- Automated grading with diagnostic insights:
  - Concept Mastery Percentage
  - Strong Concepts Demonstrated
  - Identified Weak Concepts
  - Tailored Study Recommendations
- Retake Quiz and Export Results.

### 5. 📊 Learning Workspace & Analytics
- Multi-discipline mastery radar chart built with **Recharts**.
- Weekly inquiry activity tracking and study hour metrics.
- Active daily streak counter.
- Personalized multi-week learning roadmaps with syllabus milestones and checkpoints.

### 6. ⚡ Administration & Model Health Dashboard
- Real-time model health ping and sub-50ms latency tracker.
- Hot-swap inference models without frontend redeployments:
  - `Qwen/Qwen2.5-72B-Instruct`
  - `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B`
  - `deepseek-ai/DeepSeek-V3`
  - `google/gemma-2-27b-it`
  - `meta-llama/Llama-3.3-70B-Instruct`
  - Custom vLLM cluster endpoint (`http://localhost:8000/v1`)
- Configurable inference parameters: Temperature, Top-P, Max Output Tokens, Fallback Model.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd "all ai"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your inference and database settings:
```ini
# PostgreSQL with pgvector (Supabase, Neon, or local)
DATABASE_URL="postgresql://postgres:password@localhost:5432/aether_academy"

# Open-Source Inference Endpoint (vLLM, Ollama, Together, DeepSeek, Groq)
INFERENCE_BASE_URL="http://localhost:8000/v1"
INFERENCE_API_KEY=""
INFERENCE_MODEL="Qwen/Qwen2.5-72B-Instruct"
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖥️ Deploying vLLM on a GPU Server

To run your own high-throughput GPU model server for Aether Academy:

```bash
docker run --gpus all \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model Qwen/Qwen2.5-72B-Instruct-GPTQ-Int4 \
    --max-model-len 32768 \
    --gpu-memory-utilization 0.95 \
    --enable-chunked-prefill
```

Then in `.env.local`, set:
```ini
INFERENCE_BASE_URL="http://<your-gpu-server-ip>:8000/v1"
INFERENCE_MODEL="Qwen/Qwen2.5-72B-Instruct-GPTQ-Int4"
```

---

## ☁️ Deploying to Vercel

The application is structured for instant zero-configuration deployment to **Vercel**:

1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, select **New Project** and import the repository.
3. Under **Environment Variables**, provide:
   - `INFERENCE_BASE_URL`
   - `INFERENCE_API_KEY` (if using an authenticated endpoint)
   - `INFERENCE_MODEL`
   - `DATABASE_URL` (e.g. Supabase or Neon PostgreSQL connection string)
4. Click **Deploy**.
5. Run database migrations:
   ```bash
   npx prisma db push
   ```

---

## 📁 Repository Structure

```
├── app/
│   ├── page.tsx                  # Landing page (Unuman Corps inspired luxury dark aesthetic)
│   ├── layout.tsx                # Global layout, fonts & metadata
│   ├── globals.css               # Design tokens, glassmorphism, KaTeX styles
│   ├── chat/page.tsx             # Main educational chatbot workspace
│   ├── dashboard/page.tsx        # Learning analytics with Recharts radar & activity charts
│   ├── documents/page.tsx        # Textbook & document library (RAG with citations)
│   ├── quizzes/page.tsx          # Interactive quiz taking & assessment generator
│   ├── materials/page.tsx        # Study materials vault (formula sheets, notes, flashcards)
│   ├── learn/page.tsx            # Multi-week personalized study roadmap generator
│   ├── admin/page.tsx            # Administration & model health dashboard
│   └── api/                      # Next.js API Routes (chat, docs, quizzes, learning, admin)
├── components/
│   ├── chat/                     # ChatSidebar, ChatMessage, ChatComposer, WelcomeScreen, MarkdownRenderer
│   ├── layout/                   # Navbar, navigation drawer
├── lib/
│   ├── ai/                       # model-adapter.ts, prompts.ts, streaming.ts
│   ├── rag/                      # embeddings.ts, ingestion.ts, retrieval.ts
│   ├── education/                # assessment.ts, study-materials.ts
│   ├── database/                 # db.ts, persistent repository
│   └── utils.ts                  # formatting & styling utilities
└── prisma/
    └── schema.prisma             # PostgreSQL + pgvector schema
```

---

## 🛡️ Security & Reliability
- **Input Sanitization**: Markdown output is rendered securely with sanitized HTML elements.
- **RAG Untrusted Boundary**: Retrieved document text is treated strictly as unprivileged context, preventing prompt injection overrides.
- **Isolated Execution**: Simulated sandboxed runtime for student programming problems.
- **Zero Hallucination Grounding**: Clear disclaimers and citations when source materials do not contain the requested information.

---

## 📄 License
MIT License. Built for universal access to quality education.

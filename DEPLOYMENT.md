# 🚀 EXAM MIND AI: PRODUCTION DEPLOYMENT & OPERATION GUIDE

This guide details the complete process for deploying **EXAM MIND AI** to production on **Vercel** backed by a **PostgreSQL (pgvector)** database, dual open-source inference models (**GPT-OSS** and **Qwen 2.5**), multi-source live web search, and hybrid RAG retrieval.

---

## 1. Prerequisites Checklist

| Component | Recommended Provider | Purpose |
| :--- | :--- | :--- |
| **Frontend & API Gateway** | [Vercel](https://vercel.com) | Edge-accelerated Next.js App Router deployment with streaming |
| **Primary Model (GPT-OSS)** | Self-hosted vLLM / Groq / OpenRouter | General knowledge, academic explanations, essays & dossiers |
| **Secondary Model (Qwen 2.5)** | Self-hosted vLLM / Groq / Ollama | Advanced programming, debugging, mathematics & formal proofs |
| **Search Engine** | Self-hosted SearXNG / Google CSE | Metasearch engine discovering pages across the wider public web |
| **Relational & Vector Database** | [Supabase](https://supabase.com) or [Neon](https://neon.tech) | PostgreSQL with `pgvector` extension enabled |

---

## 2. Environment Variables Specification

Set the following environment variables in your Vercel project settings:

```ini
# ------------------------------------------------------------------------------
# Model 1: GPT-OSS (Primary General-Purpose, Academic & Deep Search Engine)
# Supports any OpenAI-compatible endpoint: vLLM, Groq, OpenRouter, Ollama, or Pollinations
# ------------------------------------------------------------------------------
GPT_OSS_BASE_URL="https://text.pollinations.ai"
GPT_OSS_API_KEY=""
GPT_OSS_MODEL="openai-fast"

# ------------------------------------------------------------------------------
# Model 2: Qwen (Programming, Mathematics, Technical Reasoning & Fallback)
# Supports any OpenAI-compatible endpoint: vLLM, Groq, OpenRouter, Ollama, or Pollinations
# ------------------------------------------------------------------------------
QWEN_BASE_URL="https://text.pollinations.ai"
QWEN_API_KEY=""
QWEN_MODEL="qwen-coder"

# ------------------------------------------------------------------------------
# Live Web Search & Metasearch Engine
# If omitted, EXAM MIND AI automatically scrapes Google & DuckDuckGo across all domains
# ------------------------------------------------------------------------------
SEARCH_PROVIDER_URL=""
GOOGLE_SEARCH_API_KEY=""
GOOGLE_SEARCH_CX=""

# ------------------------------------------------------------------------------
# Vector Embeddings & Hybrid RAG Knowledge Base
# ------------------------------------------------------------------------------
EMBEDDING_MODEL="text-embedding-3-small"

# ------------------------------------------------------------------------------
# PostgreSQL Database with pgvector
# When omitted, runs with built-in persistent storage in .data/db.json
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"

# ------------------------------------------------------------------------------
# Application Security
# ------------------------------------------------------------------------------
AUTH_SECRET="a-secure-32-byte-hex-string-for-session-signing"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

---

## 3. Database Migration Steps

1. Enable the `vector` extension in your PostgreSQL instance (Supabase or Neon SQL editor):

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Run Prisma schema generation and push:

```bash
npx prisma generate
npx prisma db push
```

3. Verified schema models:
- `User`
- `Conversation`
- `Message`
- `Document`
- `DocumentChunk`
- `Quiz`
- `QuizAttempt`
- `LearningProgress`
- `StudyMaterial`
- `SystemConfig`

---

## 4. Deploying to Vercel

### Step 1: Push Code to GitHub / GitLab
```bash
git add .
git commit -m "feat: complete dual open-source model, multi-source search and RAG upgrade"
git push origin main
```

### Step 2: Import into Vercel
1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Select your repository.
3. In **Environment Variables**, paste the variables from Section 2 (`GPT_OSS_*`, `QWEN_*`, `DATABASE_URL`, etc.).
4. Click **Deploy**.

### Step 3: Verify Streaming & Routes
Once deployed, test:
- `https://your-domain.vercel.app/chat`: Send a question (verify immediate token streaming).
- `https://your-domain.vercel.app/admin`: Click **Health Ping Both Models** to confirm both GPT-OSS and Qwen 2.5 connections.

---

## 5. Self-Hosting Qwen 2.5 on GPU with vLLM

For ultra-low latency, deploy Qwen 2.5 on an A100 or 2x L40S GPU server using Docker:

```bash
docker run --gpus all \
    --name qwen-vllm \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model Qwen/Qwen2.5-72B-Instruct-GPTQ-Int4 \
    --tensor-parallel-size 1 \
    --max-model-len 32768 \
    --gpu-memory-utilization 0.95 \
    --max-num-batched-tokens 8192 \
    --enable-chunked-prefill
```

Then in Vercel settings, point `QWEN_BASE_URL="http://[YOUR-GPU-SERVER-IP]:8000/v1"`.

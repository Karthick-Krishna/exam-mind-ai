# 🚀 AETHER ACADEMY: PRODUCTION DEPLOYMENT & OPERATION GUIDE

This guide details the complete process for deploying **Aether Academy** to production on **Vercel** backed by a **PostgreSQL (pgvector)** database and a high-performance **vLLM GPU cluster**.

---

## 1. Prerequisites Checklist

| Component | Recommended Provider | Purpose |
| :--- | :--- | :--- |
| **Frontend & API Gateway** | [Vercel](https://vercel.com) | Edge-accelerated Next.js App Router deployment |
| **Relational & Vector Database** | [Supabase](https://supabase.com) or [Neon](https://neon.tech) | PostgreSQL with `pgvector` extension enabled |
| **GPU Inference Server** | [RunPod](https://runpod.io), [Lambda Labs](https://lambdalabs.com), or AWS EC2 | Self-hosted vLLM engine for Qwen 2.5 / DeepSeek-R1 |
| **Distributed Cache & Rate Limiting** | [Upstash Redis](https://upstash.com) | Request queuing and token consumption protection |

---

## 2. Environment Variables Specification

Set the following environment variables in your Vercel project settings:

```ini
# Database (PostgreSQL + pgvector)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"

# Model Inference Gateway
INFERENCE_BASE_URL="http://[YOUR-GPU-SERVER-IP]:8000/v1"
INFERENCE_API_KEY=""
INFERENCE_MODEL="Qwen/Qwen2.5-72B-Instruct"
FALLBACK_MODEL="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"

# Embedding Model for Document RAG
EMBEDDING_MODEL="text-embedding-3-small"

# Application Security
AUTH_SECRET="a-secure-32-byte-hex-string-for-session-signing"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

---

## 3. Database Migration Steps

Enable the `vector` extension in your PostgreSQL instance:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run Prisma schema synchronization:

```bash
npx prisma generate
npx prisma db push
```

Verify your tables:
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

## 4. Self-Hosting vLLM on a GPU Server

For production inference, deploy an A100 (80GB) or 2x L40S instance running vLLM:

### Docker Launch Command:
```bash
docker run --gpus all \
    --name aether-vllm \
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

### Health Check:
```bash
curl http://localhost:8000/v1/models
```

---

## 5. Troubleshooting Common Production Issues

### Issue 1: Streaming timeout on Vercel Serverless Functions
- **Cause**: Vercel Hobby tier caps function execution at 10 seconds.
- **Solution**: Upgrade to Vercel Pro (allows 300s streaming), or ensure token-by-token streaming flushes data chunks immediately within 500ms using Server-Sent Events (SSE).

### Issue 2: Cross-Origin Resource Sharing (CORS) with self-hosted vLLM
- **Cause**: Browser cannot directly reach non-HTTPS GPU ports.
- **Architecture Guarantee**: All client requests in Aether Academy route securely through Next.js server-side API endpoints (`/api/chat`). Your vLLM server credentials and IP are never exposed to client browsers.

### Issue 3: pgvector extension not found
- **Solution**: Execute `CREATE EXTENSION IF NOT EXISTS vector;` in your Supabase or Neon SQL console prior to running `prisma db push`.

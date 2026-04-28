# AI Text Summarizer

Production-ready AI text summarizer built for Vercel with Next.js App Router, TypeScript, Tailwind CSS, and free summarization via Hugging Face Inference API.

## Features

- Summary modes: short, bullet points, detailed
- Input validation and sanitization
- Basic in-memory rate limiting
- Responsive, polished UI with loading and error states
- Copy-to-clipboard support
- Free API-first summarization with graceful fallback
- No paid APIs and no billing setup

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Hugging Face Inference API (free tier)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Optional `.env.local` (improves free-tier reliability but not required):

```env
HF_API_TOKEN=your_free_huggingface_token
```

3. Run development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```text
src/
  app/
    api/summarize/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    summarizer/
      SummarizerForm.tsx
      SummaryOutput.tsx
      SummaryTypeSelect.tsx
      TextInput.tsx
  lib/
    free-summarizer.ts
    rate-limit.ts
    sanitization.ts
  types/
    summarizer.ts
```

## API Endpoint

`POST /api/summarize`

Request body:

```json
{
  "text": "Text to summarize",
  "summaryType": "short"
}
```

Valid `summaryType` values:

- `short`
- `bullets`
- `detailed`

The endpoint validates text, sanitizes input, rate limits requests, tries Hugging Face summarization, and gracefully falls back to a lightweight extractive summary if the free API is slow or unavailable.

## Vercel Deployment Notes

- Works on Vercel serverless (no heavy model download at runtime)
- Fast path uses external free inference API with short timeout
- Fallback path ensures endpoint still returns a summary instead of crashing
- No paid services required

import { NextRequest, NextResponse } from "next/server";

import { summarizeTextLocally } from "@/lib/local-summarizer";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/sanitization";
import { SUMMARY_TYPES, type SummarizeRequestBody } from "@/types/summarizer";

const MAX_TEXT_LENGTH = 5000;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return "unknown";
}

function createJsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest): Promise<Response> {
  const clientId = getClientIdentifier(req);
  const limitResult = checkRateLimit(clientId);

  if (!limitResult.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Try again in ${limitResult.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limitResult.retryAfterSeconds) },
      },
    );
  }

  let payload: SummarizeRequestBody;

  try {
    payload = (await req.json()) as SummarizeRequestBody;
  } catch (error) {
    console.error("Invalid JSON payload.", error);
    return createJsonError("Invalid JSON body.", 400);
  }

  const rawText = typeof payload?.text === "string" ? payload.text : "";
  const text = sanitizeInput(rawText);
  const summaryType = payload?.summaryType;

  if (!text) {
    return createJsonError("Text is required.", 400);
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return createJsonError(
      `Text exceeds max length of ${MAX_TEXT_LENGTH} characters.`,
      400,
    );
  }

  if (!SUMMARY_TYPES.includes(summaryType)) {
    return createJsonError("Invalid summary type.", 400);
  }

  try {
    const summary = await summarizeTextLocally(text, summaryType);

    if (!summary) {
      return createJsonError("No summary was generated.", 502);
    }

    return NextResponse.json({
      summary,
    });
  } catch (error) {
    console.error("Local summarization failed.", error);
    return createJsonError("Unable to generate summary right now.", 500);
  }
}

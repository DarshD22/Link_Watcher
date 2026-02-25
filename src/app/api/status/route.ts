// src/app/api/status/route.ts
// Health check endpoint. Called by the /status page.
// Checks: server uptime, MongoDB connectivity, Gemini API reachability.

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

async function checkMongo(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const client = await clientPromise;
    await client.db("linkwatcher").command({ ping: 1 });
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message };
  }
}

async function checkGemini(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, latencyMs: 0, error: "GEMINI_API_KEY not set" };

  const start = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, latencyMs: Date.now() - start, error: `HTTP ${res.status}: ${text.slice(0, 100)}` };
    }
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message };
  }
}

export async function GET() {
  const [mongo, gemini] = await Promise.all([checkMongo(), checkGemini()]);

  const allOk = mongo.ok && gemini.ok;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checkedAt: new Date().toISOString(),
      services: {
        server: { ok: true, note: "Next.js API responding" },
        database: {
          ok: mongo.ok,
          latencyMs: mongo.latencyMs,
          ...(mongo.error ? { error: mongo.error } : {}),
        },
        llm: {
          ok: gemini.ok,
          provider: "Gemini 1.5 Flash",
          latencyMs: gemini.latencyMs,
          ...(gemini.error ? { error: gemini.error } : {}),
        },
      },
    },
    { status: allOk ? 200 : 503 }
  );
}
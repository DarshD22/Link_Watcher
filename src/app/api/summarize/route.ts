import { NextRequest, NextResponse } from "next/server";
import { summarizeChange } from "@/lib/summarize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, checkedAt, snippets, diffSummary } = body;

    if (!url || !snippets) {
      return NextResponse.json({ error: "url and snippets are required" }, { status: 400 });
    }

    const result = await summarizeChange({ url, checkedAt, snippets, diffSummary });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
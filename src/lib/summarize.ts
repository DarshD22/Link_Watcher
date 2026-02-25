import { Snippet } from "./models";

interface SummaryResult {
  summary: string;
  highlights: { title: string; snippet: string; context: string }[];
  severity: "minor" | "moderate" | "major";
}

const FALLBACK: SummaryResult = {
  summary: "No meaningful content changes detected.",
  highlights: [],
  severity: "minor",
};

export async function summarizeChange(params: {
  url: string;
  checkedAt: string;
  snippets: Snippet[];
  diffSummary?: string;
}): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No GEMINI_API_KEY set — returning fallback summary.");
    return FALLBACK;
  }

  const prompt = `You are a concise change summarizer. Output MUST be valid JSON only. No markdown, no extra text.

Given:
- url: ${params.url}
- checkedAt: ${params.checkedAt}
- snippets: ${JSON.stringify(params.snippets, null, 2)}
- diffSummary: ${params.diffSummary ?? ""}

Produce JSON in exactly this shape:
{
  "summary": "<1-2 sentence summary of the main change>",
  "highlights": [
    {"title": "short title", "snippet": "<=80 chars", "context": "where on page"}
  ],
  "severity": "minor|moderate|major"
}

Rules:
- If changes are trivial (whitespace, date roll-over), return summary "No meaningful content changes detected." and severity "minor".
- When in doubt pick "moderate".
- highlights array can be empty if nothing notable.
- Output strictly valid JSON only. No commentary, no markdown fences.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return FALLBACK;
    }

    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip possible markdown fences just in case
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed: SummaryResult = JSON.parse(clean);

    return parsed;
  } catch (err) {
    console.error("Summarize error:", err);
    return FALLBACK;
  }
}
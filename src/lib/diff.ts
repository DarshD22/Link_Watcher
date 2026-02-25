import { diff_match_patch } from "diff-match-patch";
import { Snippet } from "./models";

const dmp = new diff_match_patch();

export function computeDiff(oldText: string, newText: string): {
  diffHtml: string;
  snippets: Snippet[];
  changeType: "modified" | "no-change";
} {
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  const hasChanges = diffs.some(([op]) => op !== 0);

  if (!hasChanges) {
    return { diffHtml: "", snippets: [], changeType: "no-change" };
  }

  const diffHtml = buildDiffHtml(diffs);
  const snippets = extractSnippets(diffs);

  return { diffHtml, snippets, changeType: "modified" };
}

function buildDiffHtml(diffs: [number, string][]): string {
  return diffs
    .map(([op, text]) => {
      const escaped = escapeHtml(text);
      if (op === 1) return `<ins class="diff-added">${escaped}</ins>`;
      if (op === -1) return `<del class="diff-removed">${escaped}</del>`;
      return `<span class="diff-equal">${escaped}</span>`;
    })
    .join("");
}

function extractSnippets(diffs: [number, string][]): Snippet[] {
  const snippets: Snippet[] = [];
  const CONTEXT_CHARS = 80;

  for (let i = 0; i < diffs.length && snippets.length < 5; i++) {
    const [op, text] = diffs[i];
    if (op === 0) continue;

    const label = op === 1 ? "Added" : "Removed";

    // Grab context: peek at neighbors
    const before = diffs[i - 1]?.[1]?.slice(-CONTEXT_CHARS) ?? "";
    const after = diffs[i + 1]?.[1]?.slice(0, CONTEXT_CHARS) ?? "";

    const snippet = text.slice(0, 140).replace(/\s+/g, " ").trim();
    const context = `${label}: ...${before.trim()} → ${after.trim()}...`
      .slice(0, 200)
      .trim();

    if (snippet.length > 0) {
      snippets.push({ text: snippet, context });
    }
  }

  return snippets;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
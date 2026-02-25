const SEVERITY_KEYWORDS: Record<"major" | "moderate", string[]> = {
  major: [
    "price", "pricing", "cost", "fee", "payment", "billing",
    "terms", "policy", "privacy", "security", "breach",
    "deprecated", "discontinue", "shutdown", "removed", "delete",
    "breaking", "critical", "vulnerability", "exploit",
    "ban", "suspend", "illegal", "lawsuit",
  ],
  moderate: [
    "update", "change", "new", "added", "feature",
    "limit", "quota", "rate limit", "plan", "tier",
    "beta", "launch", "release", "version",
    "warning", "notice", "important",
  ],
};

export function detectKeywords(text: string): {
  triggers: string[];
  suggestedSeverity: "minor" | "moderate" | "major";
} {
  const lower = text.toLowerCase();
  const triggers: string[] = [];
  let suggestedSeverity: "minor" | "moderate" | "major" = "minor";

  for (const kw of SEVERITY_KEYWORDS.major) {
    if (lower.includes(kw)) {
      triggers.push(kw);
      suggestedSeverity = "major";
    }
  }

  if (suggestedSeverity !== "major") {
    for (const kw of SEVERITY_KEYWORDS.moderate) {
      if (lower.includes(kw)) {
        triggers.push(kw);
        suggestedSeverity = "moderate";
      }
    }
  }

  return { triggers: [...new Set(triggers)], suggestedSeverity };
}

export function mergeSeverity(
  llmSeverity: "minor" | "moderate" | "major",
  keywordSeverity: "minor" | "moderate" | "major"
): "minor" | "moderate" | "major" {
  const rank = { minor: 0, moderate: 1, major: 2 };
  return rank[llmSeverity] >= rank[keywordSeverity] ? llmSeverity : keywordSeverity;
}
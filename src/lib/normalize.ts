import * as cheerio from "cheerio";
import * as crypto from "crypto";

export async function fetchAndNormalize(url: string): Promise<{
  normalized: string;
  hash: string;
  error?: string;
}> {
  let html: string;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkWatcher/1.0)",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        normalized: "",
        hash: "",
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    html = await res.text();
  } catch (err: any) {
    return {
      normalized: "",
      hash: "",
      error: err?.message ?? "Fetch failed",
    };
  }

  // Truncate to 200k chars before parsing
  if (html.length > 200_000) {
    html = html.slice(0, 200_000);
  }

  const $ = cheerio.load(html);

  // Remove noise elements
  $("script, style, noscript, iframe, svg, img, video, audio, head").remove();
  $("[style]").removeAttr("style");
  $("*").each((_, el) => {
    const elem = el as any;
    if (elem.attribs) {
      Object.keys(elem.attribs).forEach((attr) => {
        if (attr.startsWith("on")) delete elem.attribs[attr];
      });
    }
  });

  const bodyText = $("body").text();

  // Collapse whitespace
  const normalized = bodyText
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const hash = crypto.createHash("sha256").update(normalized).digest("hex");

  return { normalized, hash };
}
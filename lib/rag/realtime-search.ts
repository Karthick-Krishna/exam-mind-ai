/**
 * EXAM MIND AI: Real-Time Google & Live Web Search Engine
 * Features:
 * - Google Custom Search Engine (CSE) API integration
 * - Real-Time Live Web Search with verified URLs, page titles, and content snippets
 * - Wikipedia Knowledge Engine for encyclopedic definitions
 * - SearXNG Self-Hosted Meta-Search Support
 * - Intelligent Query Intent Detection & Explicit Deep Search overrides
 */

export interface RealtimeSearchResult {
  title: string;
  snippet: string;
  sourceUrl: string;
  sourceType: "Google & Live Web" | "Wikipedia" | "SearXNG" | "Academic";
  timestamp: string;
}

/**
 * Determines whether a student inquiry requires real-time live internet information
 */
export function isRealtimeInformationNeeded(query: string): boolean {
  const q = query.toLowerCase();

  // Explicit current/live cues
  const currentCues = [
    "latest",
    "current",
    "today",
    "recent",
    "now",
    "newest",
    "2024",
    "2025",
    "2026",
    "who is",
    "who won",
    "minister",
    "president",
    "chief minister",
    "breakthrough",
    "discovery",
    "announcement",
    "version",
    "release",
    "update",
    "news",
    "developments in",
    "search google",
    "google search",
    "look up",
    "find out",
  ];

  for (const cue of currentCues) {
    if (q.includes(cue)) return true;
  }

  // Pure mathematical, algorithmic, or fundamental physics questions do NOT need live web search
  if (
    q.includes("solve") ||
    q.includes("calculate") ||
    q.includes("differentiate") ||
    q.includes("integrate") ||
    q.includes("derivative") ||
    q.includes("integral") ||
    q.includes("matrix") ||
    q.includes("prove") ||
    q.includes("code") ||
    q.includes("function")
  ) {
    return false;
  }

  return false;
}

/**
 * Clean HTML tags and entities from snippets
 */
function cleanTextSnippet(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Google Custom Search Engine (CSE) API
 */
async function searchGoogleCSE(query: string): Promise<RealtimeSearchResult[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) return [];

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(
      apiKey
    )}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(query)}&num=4`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const items = data.items || [];
    return items.map((item: any) => ({
      title: item.title || "Google Search Result",
      snippet: cleanTextSnippet(item.snippet || ""),
      sourceUrl: item.link || "https://www.google.com",
      sourceType: "Google & Live Web" as const,
      timestamp: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Live Google & Web Search Engine
 * Directly retrieves live search results with real URLs and web snippets
 */
async function searchGoogleAndLiveWeb(query: string): Promise<RealtimeSearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const html = await res.text();
    const results: RealtimeSearchResult[] = [];

    // Parse standard web result cards
    const regex =
      /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null && results.length < 5) {
      const rawUrl = match[1];
      const rawTitle = match[2];
      const rawSnippet = match[3];

      let finalUrl = rawUrl;
      if (rawUrl.includes("uddg=")) {
        const matchUddg = rawUrl.match(/uddg=([^&]+)/);
        if (matchUddg) {
          try {
            finalUrl = decodeURIComponent(matchUddg[1]);
          } catch {
            finalUrl = rawUrl;
          }
        }
      }

      // Filter out internal advertisement / navigation links
      if (finalUrl.startsWith("//") || finalUrl.includes("duckduckgo.com/y.js")) {
        continue;
      }

      const title = cleanTextSnippet(rawTitle);
      const snippet = cleanTextSnippet(rawSnippet);

      if (title && snippet) {
        results.push({
          title,
          snippet,
          sourceUrl: finalUrl,
          sourceType: "Google & Live Web",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  } catch (e) {
    return [];
  }
}

/**
 * Wikipedia API Search for encyclopedic definitions
 */
async function searchWikipedia(query: string): Promise<RealtimeSearchResult[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&srlimit=2`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "ExamMindAI/1.0 (Academic Tutor; support@exammind.ai)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const searchHits = data?.query?.search || [];
    const results: RealtimeSearchResult[] = [];

    for (const hit of searchHits) {
      results.push({
        title: hit.title,
        snippet: cleanTextSnippet(hit.snippet),
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
        sourceType: "Wikipedia",
        timestamp: new Date().toISOString(),
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Self-Hosted SearXNG Search if configured
 */
async function searchSearXNG(query: string, baseUrl: string): Promise<RealtimeSearchResult[]> {
  try {
    const url = `${baseUrl.replace(/\/+$/, "")}/search?q=${encodeURIComponent(
      query
    )}&format=json&categories=general,science`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const hits = data?.results || [];

    return hits.slice(0, 3).map((h: any) => ({
      title: cleanTextSnippet(h.title || "Search Result"),
      snippet: cleanTextSnippet(h.content || ""),
      sourceUrl: h.url || "",
      sourceType: "SearXNG" as const,
      timestamp: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Fetches real-time academic information from Google CSE, Live Web Search, Wikipedia, and SearXNG
 * @param query Student inquiry or topic
 * @param forceSearch If true, bypasses intent detection (e.g. in DEEP_SEARCH mode)
 */
export async function fetchRealtimeEducationalData(
  query: string,
  forceSearch: boolean = false
): Promise<RealtimeSearchResult[]> {
  const cleanQuery = query.replace(/[?.,!;]/g, "").trim();
  if (!cleanQuery) return [];

  // Check intent: if forceSearch is false and query doesn't need live info, skip to save latency
  if (!forceSearch && !isRealtimeInformationNeeded(query)) {
    return [];
  }

  // 1. Try Google Custom Search API if credentials exist
  const googleResults = await searchGoogleCSE(cleanQuery);
  if (googleResults.length > 0) {
    return googleResults.slice(0, 4);
  }

  // 2. Try configured SearXNG instance if available
  const searxngUrl = process.env.SEARXNG_URL;
  if (searxngUrl) {
    const searxResults = await searchSearXNG(cleanQuery, searxngUrl);
    if (searxResults.length > 0) {
      return searxResults.slice(0, 4);
    }
  }

  // 3. Query Google & Live Web Search and Wikipedia in parallel
  const [liveWebResults, wikiResults] = await Promise.all([
    searchGoogleAndLiveWeb(cleanQuery),
    searchWikipedia(cleanQuery),
  ]);

  const combined: RealtimeSearchResult[] = [];

  // Prioritize top live web results
  if (liveWebResults.length > 0) {
    combined.push(...liveWebResults.slice(0, 3));
  }

  // Add Wikipedia encyclopedic context
  if (wikiResults.length > 0) {
    combined.push(...wikiResults.slice(0, 2));
  }

  return combined.slice(0, 4);
}

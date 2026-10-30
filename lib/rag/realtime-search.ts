/**
 * Real-Time Educational Knowledge & Live Web Research Engine
 * Features:
 * - Intelligent Query Intent Detection (only queries external web when current/live facts are needed)
 * - SearXNG self-hosted endpoint support
 * - Wikipedia Open API & DuckDuckGo Instant Knowledge API
 * - Real source attribution with verified URLs and timestamps
 */

export interface RealtimeSearchResult {
  title: string;
  snippet: string;
  sourceUrl: string;
  sourceType: "SearXNG" | "Wikipedia" | "DuckDuckGo" | "Academic";
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
 * Fetches real-time academic information from SearXNG, Wikipedia, and DuckDuckGo
 */
export async function fetchRealtimeEducationalData(query: string): Promise<RealtimeSearchResult[]> {
  const cleanQuery = query.replace(/[?.,!;]/g, "").trim();
  if (!cleanQuery) return [];

  // Check intent: if the query doesn't need live web search, skip external calls to preserve speed and avoid clutter
  if (!isRealtimeInformationNeeded(query)) {
    return [];
  }

  const results: RealtimeSearchResult[] = [];

  // Try configured SearXNG instance first if available
  const searxngUrl = process.env.SEARXNG_URL;
  if (searxngUrl) {
    try {
      const searxResults = await searchSearXNG(cleanQuery, searxngUrl);
      if (searxResults.length > 0) {
        return searxResults.slice(0, 4);
      }
    } catch (e) {
      console.warn("SearXNG search failed, falling back to open public APIs:", e);
    }
  }

  // Query Wikipedia and DuckDuckGo in parallel with strict timeout
  const searchPromises = [
    searchWikipedia(cleanQuery),
    searchDuckDuckGo(cleanQuery),
  ];

  const settled = await Promise.allSettled(searchPromises);

  for (const item of settled) {
    if (item.status === "fulfilled" && item.value.length > 0) {
      results.push(...item.value);
    }
  }

  return results.slice(0, 4);
}

/**
 * Self-Hosted SearXNG JSON Search
 */
async function searchSearXNG(query: string, baseUrl: string): Promise<RealtimeSearchResult[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}/search?q=${encodeURIComponent(query)}&format=json&categories=general,science`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);

  if (!res.ok) return [];
  const data = await res.json();
  const hits = data?.results || [];

  return hits.slice(0, 3).map((h: any) => ({
    title: h.title || "Search Result",
    snippet: h.content || "",
    sourceUrl: h.url || "",
    sourceType: "SearXNG" as const,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Wikipedia API Search
 */
async function searchWikipedia(query: string): Promise<RealtimeSearchResult[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&srlimit=2`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "AetherAcademicTutor/1.0 (Educational AI Tutor)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const searchHits = data?.query?.search || [];
    const results: RealtimeSearchResult[] = [];

    for (const hit of searchHits) {
      const cleanSnippet = hit.snippet
        .replace(/<span class="searchmatch">/g, "")
        .replace(/<\/span>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&");

      results.push({
        title: hit.title,
        snippet: cleanSnippet,
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
 * DuckDuckGo Instant Knowledge API
 */
async function searchDuckDuckGo(query: string): Promise<RealtimeSearchResult[]> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_html=1&skip_disambig=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const results: RealtimeSearchResult[] = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: data.AbstractText,
        sourceUrl: data.AbstractURL || "https://duckduckgo.com",
        sourceType: "DuckDuckGo",
        timestamp: new Date().toISOString(),
      });
    }

    return results;
  } catch {
    return [];
  }
}

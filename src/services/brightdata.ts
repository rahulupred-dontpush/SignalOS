import type { ResearchItem, SerpResearchResults } from "@/lib/research-types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const BRIGHT_DATA_API_URL = "https://api.brightdata.com/request";
const MAX_RESULTS = 10;
const CACHE_TTL_HOURS = 24;

/**
 * Maps to the possible fields returned by Bright Data SERP API (Google Search)
 */
interface BrightDataOrganicItem {
  title?: string;
  link?: string;
  source?: string;
  description?: string;
  display_link?: string;
  date?: string;
  snippet?: string; // Sometimes snippet is used instead of description
}

interface BrightDataSerpPayload {
  organic?: BrightDataOrganicItem[];
  news?: BrightDataOrganicItem[];
  organic_results?: BrightDataOrganicItem[]; // Common alternative key
  news_results?: BrightDataOrganicItem[]; // Common alternative key
  related?: Array<{ text?: string; link?: string }>;
  related_queries?: Array<{ query?: string; link?: string }>;
}

function getCredentials() {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const zone = process.env.BRIGHT_DATA_SERP_ZONE;

  if (!apiKey) {
    throw new Error("BRIGHT_DATA_API_KEY is not configured");
  }
  if (!zone) {
    throw new Error("BRIGHT_DATA_SERP_ZONE is not configured");
  }

  return { apiKey, zone };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function mapOrganicItem(item: BrightDataOrganicItem): ResearchItem | null {
  const title = item.title?.trim();
  const link = item.link?.trim();
  
  if (!title || !link) return null;

  return {
    title,
    link,
    source: item.source?.trim() || item.display_link?.trim() || extractDomain(link),
    snippet: item.description?.trim() || item.snippet?.trim() || "",
  };
}

function parseSerpPayload(payload: BrightDataSerpPayload): ResearchItem[] {
  // Combine all possible result lists, being flexible with keys
  const lists = [
    payload.organic, 
    payload.organic_results,
    payload.news,
    payload.news_results
  ].filter(Boolean);

  const seen = new Set<string>();
  const results: ResearchItem[] = [];

  for (const list of lists) {
    for (const item of list ?? []) {
      const mapped = mapOrganicItem(item);
      if (!mapped || seen.has(mapped.link)) continue;
      seen.add(mapped.link);
      results.push(mapped);
      if (results.length >= MAX_RESULTS) return results;
    }
  }

  return results;
}

function parseRelatedCompetitors(payload: BrightDataSerpPayload): ResearchItem[] {
  const relatedItems = [
    ...(payload.related ?? []),
    ...(payload.related_queries ?? []).map(q => ({ text: q.query, link: q.link }))
  ];

  return relatedItems
    .filter((item) => item.text?.trim() && item.link?.trim())
    .slice(0, 5)
    .map((item) => ({
      title: item.text!.trim(),
      link: item.link!.trim(),
      source: "Google Related",
      snippet: "Related search suggestion",
    }));
}

async function parseBrightDataResponse(response: Response): Promise<BrightDataSerpPayload> {
  const text = await response.text();

  try {
    const data = JSON.parse(text);

    // Bright Data sometimes wraps the SERP JSON in a 'body' string within an envelope
    if (data && typeof data === "object" && "body" in data && typeof data.body === "string") {
      try {
        return JSON.parse(data.body) as BrightDataSerpPayload;
      } catch (innerError) {
        console.error("[Bright Data] Failed to parse stringified 'body' field:", innerError);
        // Fallback to the outer object if it looks like it might contain results anyway
        return data as BrightDataSerpPayload;
      }
    }

    return data as BrightDataSerpPayload;
  } catch (error) {
    const snippet = text.slice(0, 200);
    console.error("[Bright Data] JSON Parse Error. Response snippet:", snippet);
    throw new Error(`Bright Data returned non-JSON response: ${snippet}`);
  }
}

export async function searchGoogle(
  query: string,
  options: { news?: boolean } = {}
): Promise<ResearchItem[]> {
  const { apiKey, zone } = getCredentials();

  const params = new URLSearchParams({
    q: query,
    hl: "en",
    gl: "us",
    brd_json: "1",
  });

  if (options.news) {
    params.set("tbm", "nws");
  }

  const targetUrl = `https://www.google.com/search?${params.toString()}`;

  const response = await fetch(BRIGHT_DATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone,
      url: targetUrl,
      format: "json",
      country: "us",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Bright Data SERP request failed (${response.status}): ${detail}`);
  }

  const payload = await parseBrightDataResponse(response);
  return parseSerpPayload(payload);
}

export async function searchCompetitors(company: string): Promise<ResearchItem[]> {
  const { apiKey, zone } = getCredentials();

  const params = new URLSearchParams({
    q: `${company} competitors`,
    hl: "en",
    gl: "us",
    brd_json: "1",
  });

  const targetUrl = `https://www.google.com/search?${params.toString()}`;

  const response = await fetch(BRIGHT_DATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone,
      url: targetUrl,
      format: "json",
      country: "us",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Bright Data SERP request failed (${response.status}): ${detail}`);
  }

  const payload = await parseBrightDataResponse(response);
  const organic = parseSerpPayload(payload);
  const related = parseRelatedCompetitors(payload);

  const seen = new Set<string>();
  const merged: ResearchItem[] = [];

  for (const item of [...related, ...organic]) {
    if (seen.has(item.link)) continue;
    seen.add(item.link);
    merged.push(item);
    if (merged.length >= MAX_RESULTS) break;
  }

  return merged;
}

export async function researchCompany(company: string): Promise<SerpResearchResults> {
  const trimmed = company.trim();
  if (!trimmed) {
    throw new Error("Company name is required");
  }

  // 1. Check Cache
  try {
    const cached = await prisma.researchCache.findUnique({
      where: { company: trimmed }
    });

    if (cached) {
      const ageInHours = (Date.now() - new Date(cached.updated_at).getTime()) / (1000 * 60 * 60);
      if (ageInHours < CACHE_TTL_HOURS) {
        console.log(`[Cache] Hit for ${trimmed} (Age: ${ageInHours.toFixed(1)}h)`);
        return cached.results_json as unknown as SerpResearchResults;
      }
      console.log(`[Cache] Expired for ${trimmed}`);
    }
  } catch (cacheError) {
    console.warn("[Cache] Error reading cache:", cacheError);
  }

  console.log(`[Research] Fetching fresh data for ${trimmed}...`);
  const [news, competitors, hiring_signals, product_signals, linkedin, twitter, reddit] = await Promise.all([
    searchGoogle(`${trimmed} latest news`, { news: true }),
    searchCompetitors(trimmed),
    searchGoogle(`${trimmed} hiring jobs`),
    searchGoogle(`${trimmed} new product launches features`),
    searchGoogle(`site:linkedin.com/posts "${trimmed}"`),
    searchGoogle(`site:twitter.com "${trimmed}"`),
    searchGoogle(`site:reddit.com "${trimmed}"`),
  ]);

  const results: SerpResearchResults = {
    company: trimmed,
    news,
    competitors,
    hiring_signals,
    product_signals,
    social_mentions: [...linkedin, ...twitter, ...reddit].slice(0, 10),
  };

  // 2. Update Cache (Background)
  prisma.researchCache.upsert({
    where: { company: trimmed },
    create: { company: trimmed, results_json: results as unknown as Prisma.InputJsonValue },
    update: { results_json: results as unknown as Prisma.InputJsonValue, updated_at: new Date() }
  }).catch(e => console.error("[Cache] Error updating cache:", e));

  return results;
}

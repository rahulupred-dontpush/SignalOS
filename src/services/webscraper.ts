import { ConfidenceScore } from "@/lib/research-types";

const BRIGHT_DATA_SCRAPER_URL = "https://api.brightdata.com/dca/trigger";

interface ScraperItem {
  title: string;
  url: string;
  date?: string;
  description?: string;
}

export interface WebScraperResults {
  blog: ScraperItem[];
  careers: ScraperItem[];
  pricing: string;
  product_updates: ScraperItem[];
}

function getCredentials() {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const collectorId = process.env.BRIGHT_DATA_SCRAPER_COLLECTOR_ID;
  if (!apiKey || !collectorId) return null;
  return { apiKey, collectorId };
}

export async function scrapeDeepSite(company: string, signal?: AbortSignal): Promise<WebScraperResults | null> {
  const creds = getCredentials();
  if (!creds) return null;

  try {
    const response = await fetch(`${BRIGHT_DATA_SCRAPER_URL}?collector=${creds.collectorId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creds.apiKey}`,
      },
      body: JSON.stringify({ company }),
      signal,
    });

    if (!response.ok) return null;
    
    // Bright Data Scraper response mapping
    const data = await response.json();
    return {
      blog: data.blog || [],
      careers: data.careers || [],
      pricing: data.pricing_summary || "Pricing data not found via scraper.",
      product_updates: data.product_updates || [],
    };
  } catch (error) {
    console.error("[scrapeDeepSite]", error);
    return null;
  }
}

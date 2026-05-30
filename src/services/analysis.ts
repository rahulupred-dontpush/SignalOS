import type { GTMIntelligenceReport, SerpResearchResults, ConfidenceScore } from "@/lib/research-types";
import { WebScraperResults } from "./webscraper";

const NVIDIA_NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-8b-instruct";

const REPORT_SCHEMA = `{
  "company": "string",
  "enrichment": { "ind": "string", "web": "string", "hq": "string", "size": "string", "desc": "string" },
  "exec": "2-para summary",
  "comp": { "sum": "string", "list": [{ "n": "string", "t": "h|m|l", "a": "string", "u": "string" }] },
  "soc": { "sum": "string", "sent": "pos|neu|neg", "sig": [{ "p": "li|rd|tw", "i": "string" }] },
  "hire": { "sum": "string", "sig": [{ "t": "string", "i": "string", "u": "h|m|l" }] },
  "prod": { "sum": "string", "launch": [{ "t": "string", "i": "string", "time": "string" }] },
  "mkt": {
    "sum": "string",
    "trend": [{ "s": "string", "i": "string" }],
    "intent": [{ "s": "string", "e": "string", "score": "h|m|l" }]
  },
  "risk": [{ "t": "string", "d": "string", "s": "h|m|l" }],
  "opp": [{ "t": "string", "d": "string", "p": "h|m|l" }],
  "action": [{ "a": "string", "p": "imm|st|lt" }]
}`;

const SYSTEM_PROMPT = `GTM Strategist: JSON only.
Data Enrichment: ind, web, hq, size, desc.
Intent: hiring, funding, expansion.
Social: brand sentiment.
SCHEMA: ${REPORT_SCHEMA}`;

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY is not configured");
  return key;
}

function trimItems(items: any[], limit = 2) {
  return (items ?? []).slice(0, limit).map(({ title, source, snippet, link }: any) => ({
    t: (title ?? "").slice(0, 50),
    sn: (snippet ?? "").slice(0, 80),
    u: link
  }));
}

function buildAnalysisPayload(serp: SerpResearchResults, scraper: WebScraperResults | null) {
  return {
    c: serp.company,
    s: {
      n: trimItems(serp.news, 2),
      cp: trimItems(serp.competitors, 2),
      h: trimItems(serp.hiring_signals, 2),
      p: trimItems(serp.product_signals, 2),
      sc: trimItems(serp.social_mentions, 3),
      w: {
        b: (scraper?.blog || []).slice(0, 1),
        c: (scraper?.careers || []).slice(0, 1),
        pr: (scraper?.pricing || "").slice(0, 50)
      }
    }
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateReport(data: unknown, company: string): GTMIntelligenceReport {
  const raw = (data && typeof data === "object" ? data : {}) as any;

  const repairConfidence = (val: any): ConfidenceScore => 
    ["high", "medium", "low"].includes(val) ? val : "low";

  const repairList = (list: any[], repairItem: (item: any, index: number) => any) => 
    Array.isArray(list) ? list.map((item, index) => repairItem(item, index)).filter(Boolean) : [];

  return {
    company: raw.company || company,
    generated_at: new Date().toISOString(),
    enrichment: {
      industry: raw.enrichment?.ind || "Enterprise Tech",
      website: raw.enrichment?.web || "",
      hq: raw.enrichment?.hq || "Global",
      size: raw.enrichment?.size || "Unknown",
      description: raw.enrichment?.desc || "Strategic overview unavailable."
    },
    executive_summary: isNonEmptyString(raw.exec) 
      ? raw.exec 
      : "Summary unavailable due to insufficient source data.",
    competitor_landscape: {
      summary: raw.comp?.sum || "Insufficient evidence for competitor analysis.",
      confidence: "medium",
      competitors: repairList(raw.comp?.list, (c, i) => ({
        name: c.n || `Competitor ${i + 1}`,
        threat_level: c.t === "h" ? "high" : c.t === "m" ? "medium" : "low",
        analysis: c.a || "No analysis available.",
        recent_moves: [],
        source_title: "Search",
        source_url: c.u || ""
      }))
    },
    social_intelligence: {
      summary: raw.soc?.sum || "Social signal analysis unavailable.",
      sentiment: raw.soc?.sent === "pos" ? "positive" : raw.soc?.sent === "neg" ? "negative" : "neutral",
      signals: repairList(raw.soc?.sig, (s) => ({
        platform: s.p === "li" ? "linkedin" : s.p === "rd" ? "reddit" : s.p === "tw" ? "twitter" : "unknown",
        insight: s.i || "Mention detected.",
        url: ""
      }))
    },
    hiring_activity: {
      summary: raw.hire?.sum || "Insufficient evidence for hiring activity.",
      confidence: "medium",
      signals: repairList(raw.hire?.sig, (s, i) => ({
        title: s.t || `Hiring Signal ${i + 1}`,
        insight: s.i || "No insight available.",
        urgency: s.u === "h" ? "high" : s.u === "m" ? "medium" : "low",
        source_title: "Careers",
        source_url: ""
      }))
    },
    product_activity: {
      summary: raw.prod?.sum || "Insufficient evidence for product activity.",
      confidence: "medium",
      launches: repairList(raw.prod?.launch, (l, i) => ({
        title: l.t || `Product Launch ${i + 1}`,
        impact: l.i || "No impact data available.",
        timing: l.time || "Timing unknown",
        source_title: "News",
        source_url: ""
      }))
    },
    market_signals: {
      summary: raw.mkt?.sum || "Insufficient evidence for market signals.",
      confidence: "medium",
      trends: repairList(raw.mkt?.trend, (t, i) => ({
        signal: t.s || `Market Trend ${i + 1}`,
        implication: t.i || "No implication available.",
        strength: "emerging",
        source_title: "Search",
        source_url: ""
      })),
      buying_intent: repairList(raw.mkt?.intent, (b, i) => ({
        signal: b.s || `Intent Signal ${i + 1}`,
        evidence: b.e || "No evidence provided.",
        score: b.score === "h" ? "high" : b.score === "m" ? "medium" : "low",
        source_title: "Signal",
        source_url: ""
      }))
    },
    risks: repairList(raw.risk, (r, i) => ({
      title: r.t || `Identified Risk ${i + 1}`,
      description: r.d || "Risk details unavailable.",
      severity: r.s === "h" ? "high" : r.s === "m" ? "medium" : "low",
      source_title: "Audit",
      source_url: ""
    })),
    opportunities: repairList(raw.opp, (o, i) => ({
      title: o.t || `Opportunity ${i + 1}`,
      description: o.d || "Opportunity details unavailable.",
      potential: o.p === "h" ? "high" : o.p === "m" ? "medium" : "low",
      source_title: "Audit",
      source_url: ""
    })),
    recommended_actions: repairList(raw.action, (a) => ({
      action: a.a || "Recommended Action",
      priority: "short-term",
      rationale: "Rationale unavailable."
    }))
  };
}

function getFallbackReport(company: string): GTMIntelligenceReport {
  return {
    company,
    generated_at: new Date().toISOString(),
    enrichment: { 
      industry: "Unknown", 
      website: "", 
      hq: "Unknown", 
      size: "Unknown", 
      description: "Fallback report generated due to service interruption." 
    },
    executive_summary: "A temporary report was generated due to an analysis service interruption.",
    competitor_landscape: { summary: "Analysis unavailable.", confidence: "low", competitors: [] },
    social_intelligence: { summary: "Social analysis unavailable.", sentiment: "neutral", signals: [] },
    hiring_activity: { summary: "Analysis unavailable.", confidence: "low", signals: [] },
    product_activity: { summary: "Analysis unavailable.", confidence: "low", launches: [] },
    market_signals: { summary: "Analysis unavailable.", confidence: "low", trends: [], buying_intent: [] },
    risks: [],
    opportunities: [],
    recommended_actions: [
      { 
        action: "Retry research", 
        priority: "immediate", 
        rationale: "The analysis engine returned an invalid response." 
      }
    ]
  };
}

function robustParseJSON(content: string): any {
  let cleaned = content.trim();
  
  // 1. Strip markdown markers
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```json\n?|```/g, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn("[Synthesis Audit] Initial JSON parse failed. Attempting robust repair...");
    
    // 2. Handle truncation by stripping the tail until we find a comma or start of an object/array
    // This is a crude but effective way to find a "safe" breaking point in truncated JSON
    let repaired = cleaned;
    
    // Ensure all open strings are closed
    const quoteCount = (repaired.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      repaired += '"';
    }

    // Attempt to recursively strip the tail until it parses or we run out of characters
    // We look for structural markers to trim back to
    const markers = [",", "{", "[", ":"];
    let lastMarkerIndex = -1;
    for (const marker of markers) {
      lastMarkerIndex = Math.max(lastMarkerIndex, repaired.lastIndexOf(marker));
    }

    if (lastMarkerIndex !== -1) {
      // Try stripping back to the last marker and closing structure
      let candidate = repaired.substring(0, lastMarkerIndex);
      
      // Close open structures
      const openBraces = (candidate.match(/\{/g) || []).length;
      const closeBraces = (candidate.match(/\}/g) || []).length;
      if (openBraces > closeBraces) candidate += "}".repeat(openBraces - closeBraces);

      const openBrackets = (candidate.match(/\[/g) || []).length;
      const closeBrackets = (candidate.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) candidate += "]".repeat(openBrackets - closeBrackets);

      try {
        return JSON.parse(candidate);
      } catch (e) {
        // If still fails, try even more aggressive trimming
      }
    }

    // Fallback: Simple brace matching as a last resort
    let simpleRepair = cleaned;
    const openBraces = (simpleRepair.match(/\{/g) || []).length;
    const closeBraces = (simpleRepair.match(/\}/g) || []).length;
    if (openBraces > closeBraces) simpleRepair += "}".repeat(openBraces - closeBraces);
    
    try {
      return JSON.parse(simpleRepair);
    } catch (e) {
      throw new Error(`JSON Repair failed. Final tail: ${cleaned.slice(-50)}`);
    }
  }
}

export async function generateGTMReport(
  serp: SerpResearchResults,
  scraper: WebScraperResults | null,
  retryCount = 0
): Promise<GTMIntelligenceReport> {
  try {
    const apiKey = getApiKey();
    const payload = buildAnalysisPayload(serp, scraper);
    const payloadJson = JSON.stringify(payload);
    const promptContext = `Analyze the provided search results and deep-site data for "${serp.company}" and return a GTM Intelligence Report JSON.\n${payloadJson}`;
    
    const response = await fetch(NVIDIA_NIM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: retryCount > 0 ? "GTM Strategist: JSON ONLY. Use ultra-short descriptions." : SYSTEM_PROMPT },
          {
            role: "user",
            content: promptContext,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`NVIDIA NIM analysis failed (${response.status}): ${detail}`);
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("NVIDIA NIM returned empty analysis");
    }

    // FORENSIC LOGGING
    if (process.env.NODE_ENV === "development") {
      try {
        const fs = require("fs");
        const path = require("path");
        const logDir = path.join(process.cwd(), "src/scratch/logs");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(path.join(logDir, `${serp.company}_raw_llm.txt`), content);
      } catch (e) {}
    }

    const parsed = robustParseJSON(content);
    return validateReport(parsed, serp.company);
  } catch (error) {
    if (retryCount < 1) {
      console.warn(`[Synthesis] Attempting retry for ${serp.company} due to: ${(error as any).message}`);
      return generateGTMReport(serp, scraper, retryCount + 1);
    }
    console.error("[generateGTMReport]", error);
    return getFallbackReport(serp.company);
  }
}

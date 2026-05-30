import type { GTMIntelligenceReport, SerpResearchResults, ConfidenceScore } from "@/lib/research-types";
import { WebScraperResults } from "./webscraper";

const NVIDIA_NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-70b-instruct";

const REPORT_SCHEMA = `{
  "company": "string",
  "enrichment": {
    "industry": "string",
    "website": "string",
    "hq": "string",
    "size": "string",
    "description": "1-sentence overview"
  },
  "executive_summary": "2-3 paragraph strategic overview for a GTM leader",
  "competitor_landscape": {
    "summary": "string",
    "confidence": "high|medium|low",
    "competitors": [{ 
      "name": "string", 
      "threat_level": "high|medium|low", 
      "analysis": "string", 
      "recent_moves": ["string"],
      "source_title": "string",
      "source_url": "string"
    }]
  },
  "social_intelligence": {
    "summary": "string",
    "sentiment": "positive|neutral|negative",
    "signals": [{ "platform": "linkedin|reddit|twitter", "insight": "string", "url": "string" }]
  },
  "hiring_activity": {
    "summary": "string",
    "confidence": "high|medium|low",
    "signals": [{ 
      "title": "string", 
      "insight": "string", 
      "urgency": "high|medium|low",
      "source_title": "string",
      "source_url": "string"
    }]
  },
  "product_activity": {
    "summary": "string",
    "confidence": "high|medium|low",
    "launches": [{ 
      "title": "string", 
      "impact": "string", 
      "timing": "string",
      "source_title": "string",
      "source_url": "string"
    }]
  },
  "market_signals": {
    "summary": "string",
    "confidence": "high|medium|low",
    "trends": [{ 
      "signal": "string", 
      "implication": "string", 
      "strength": "strong|moderate|emerging",
      "source_title": "string",
      "source_url": "string"
    }],
    "buying_intent": [{ 
      "signal": "string", 
      "evidence": "string", 
      "score": "high|medium|low",
      "source_title": "string",
      "source_url": "string"
    }]
  },
  "risks": [{ 
    "title": "string", 
    "description": "string", 
    "severity": "high|medium|low",
    "source_title": "string",
    "source_url": "string"
  }],
  "opportunities": [{ 
    "title": "string", 
    "description": "string", 
    "potential": "high|medium|low",
    "source_title": "string",
    "source_url": "string"
  }],
  "recommended_actions": [{ "action": "string", "priority": "immediate|short-term|long-term", "rationale": "string" }]
}`;

const SYSTEM_PROMPT = `You are a world-class GTM strategist. Synthesize search data into a high-density strategic JSON report.
CRITICAL INSTRUCTIONS:
1. USE ONLY PROVIDED DATA. If data is sparse, set confidence to "low" and provide a brief, honest summary.
2. ENRICHMENT: Extract industry, website, hq, size, and a 1-sentence description.
3. INTENT: Look for hiring velocity, funding, and expansion as high-intent triggers.
4. COMPETITORS: Identify direct threats and their recent strategic moves.
5. SOCIAL: Summarize brand sentiment from LinkedIn/Reddit/Twitter mentions.
6. FORMAT: Return ONLY valid JSON matching the schema exactly. Keep summaries concise.

SCHEMA:
${REPORT_SCHEMA}`;

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY is not configured");
  return key;
}

function trimItems(items: any[], limit = 5) {
  return (items ?? []).slice(0, limit).map(({ title, source, snippet, link }: any) => ({
    t: (title ?? "").slice(0, 80),
    s: (source ?? "").slice(0, 40),
    sn: (snippet ?? "").slice(0, 120),
    u: link
  }));
}

function buildAnalysisPayload(serp: SerpResearchResults, scraper: WebScraperResults | null) {
  return {
    c: serp.company,
    src: {
      n: trimItems(serp.news),
      comp: trimItems(serp.competitors),
      h: trimItems(serp.hiring_signals),
      p: trimItems(serp.product_signals),
      soc: trimItems(serp.social_mentions, 8),
      w: {
        b: (scraper?.blog || []).slice(0, 2),
        c: (scraper?.careers || []).slice(0, 2),
        pr: (scraper?.pricing || "").slice(0, 150)
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
      industry: raw.enrichment?.industry || "Enterprise Tech",
      website: raw.enrichment?.website || "",
      hq: raw.enrichment?.hq || "Global",
      size: raw.enrichment?.size || "Unknown",
      description: raw.enrichment?.description || "Strategic overview unavailable."
    },
    executive_summary: isNonEmptyString(raw.executive_summary) 
      ? raw.executive_summary 
      : "Summary unavailable due to insufficient source data.",
    competitor_landscape: {
      summary: raw.competitor_landscape?.summary || "Insufficient evidence for competitor analysis.",
      confidence: repairConfidence(raw.competitor_landscape?.confidence),
      competitors: repairList(raw.competitor_landscape?.competitors, (c, i) => ({
        name: c.name || `Competitor ${i + 1}`,
        threat_level: c.threat_level || "low",
        analysis: c.analysis || "No analysis available.",
        recent_moves: Array.isArray(c.recent_moves) ? c.recent_moves : [],
        source_title: c.source_title || "",
        source_url: c.source_url || ""
      }))
    },
    social_intelligence: {
      summary: raw.social_intelligence?.summary || "Social signal analysis unavailable.",
      sentiment: ["positive", "neutral", "negative"].includes(raw.social_intelligence?.sentiment) 
        ? raw.social_intelligence.sentiment 
        : "neutral",
      signals: repairList(raw.social_intelligence?.signals, (s) => ({
        platform: s.platform || "unknown",
        insight: s.insight || "Mention detected.",
        url: s.url || ""
      }))
    },
    hiring_activity: {
      summary: raw.hiring_activity?.summary || "Insufficient evidence for hiring activity.",
      confidence: repairConfidence(raw.hiring_activity?.confidence),
      signals: repairList(raw.hiring_activity?.signals, (s, i) => ({
        title: s.title || `Hiring Signal ${i + 1}`,
        insight: s.insight || "No insight available.",
        urgency: s.urgency || "low",
        source_title: s.source_title || "",
        source_url: s.source_url || ""
      }))
    },
    product_activity: {
      summary: raw.product_activity?.summary || "Insufficient evidence for product activity.",
      confidence: repairConfidence(raw.product_activity?.confidence),
      launches: repairList(raw.product_activity?.launches, (l, i) => ({
        title: l.title || `Product Launch ${i + 1}`,
        impact: l.impact || "No impact data available.",
        timing: l.timing || "Timing unknown",
        source_title: l.source_title || "",
        source_url: l.source_url || ""
      }))
    },
    market_signals: {
      summary: raw.market_signals?.summary || "Insufficient evidence for market signals.",
      confidence: repairConfidence(raw.market_signals?.confidence),
      trends: repairList(raw.market_signals?.trends, (t, i) => ({
        signal: t.signal || `Market Trend ${i + 1}`,
        implication: t.implication || "No implication available.",
        strength: t.strength || "emerging",
        source_title: t.source_title || "",
        source_url: t.source_url || ""
      })),
      buying_intent: repairList(raw.market_signals?.buying_intent, (b, i) => ({
        signal: b.signal || `Intent Signal ${i + 1}`,
        evidence: b.evidence || "No evidence provided.",
        score: b.score || "low",
        source_title: b.source_title || "",
        source_url: b.source_url || ""
      }))
    },
    risks: repairList(raw.risks, (r, i) => ({
      title: r.title || `Identified Risk ${i + 1}`,
      description: r.description || "Risk details unavailable.",
      severity: r.severity || "low",
      source_title: r.source_title || "",
      source_url: r.source_url || ""
    })),
    opportunities: repairList(raw.opportunities, (o, i) => ({
      title: o.title || `Opportunity ${i + 1}`,
      description: o.description || "Opportunity details unavailable.",
      potential: o.potential || "low",
      source_title: o.source_title || "",
      source_url: o.source_url || ""
    })),
    recommended_actions: repairList(raw.recommended_actions, (a) => ({
      action: a.action || "Recommended Action",
      priority: a.priority || "short-term",
      rationale: a.rationale || "Rationale unavailable."
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

export async function generateGTMReport(
  serp: SerpResearchResults,
  scraper: WebScraperResults | null
): Promise<GTMIntelligenceReport> {
  try {
    const apiKey = getApiKey();
    const payload = buildAnalysisPayload(serp, scraper);

    const response = await fetch(NVIDIA_NIM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze the provided search results and deep-site data for "${serp.company}" and return a GTM Intelligence Report JSON.\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 4096,
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON from NVIDIA NIM response");
      }
    }

    return validateReport(parsed, serp.company);
  } catch (error) {
    console.error("[generateGTMReport]", error);
    return getFallbackReport(serp.company);
  }
}

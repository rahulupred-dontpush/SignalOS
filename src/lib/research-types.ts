export type SignalType = "hiring" | "funding" | "product" | "intent" | "news" | "leadership";

export interface ResearchItem {
  title: string;
  link: string;
  source: string;
  snippet: string;
}

/** Raw SERP payload — internal use between Bright Data and analysis */
export interface SerpResearchResults {
  company: string;
  news: ResearchItem[];
  competitors: ResearchItem[];
  hiring_signals: ResearchItem[];
  product_signals: ResearchItem[];
  social_mentions: ResearchItem[];
}

export type ConfidenceScore = "high" | "medium" | "low";

export interface GTMIntelligenceReport {
  company: string;
  generated_at: string;
  executive_summary: string;
  competitor_landscape: {
    summary: string;
    confidence: ConfidenceScore;
    competitors: Array<{
      name: string;
      threat_level: "high" | "medium" | "low";
      analysis: string;
      recent_moves: string[];
      source_title?: string;
      source_url?: string;
    }>;
  };
  social_intelligence?: {
    summary: string;
    sentiment: "positive" | "neutral" | "negative";
    signals: Array<{ platform: string; insight: string; url?: string }>;
  };
  hiring_activity: {
    summary: string;
    confidence: ConfidenceScore;
    signals: Array<{
      title: string;
      insight: string;
      urgency: "high" | "medium" | "low";
      source_title?: string;
      source_url?: string;
    }>;
  };
  product_activity: {
    summary: string;
    confidence: ConfidenceScore;
    launches: Array<{
      title: string;
      impact: string;
      timing: string;
      source_title?: string;
      source_url?: string;
    }>;
  };
  market_signals: {
    summary: string;
    confidence: ConfidenceScore;
    trends: Array<{
      signal: string;
      implication: string;
      strength: "strong" | "moderate" | "emerging";
      source_title?: string;
      source_url?: string;
      type?: string;
    }>;
    buying_intent: Array<{
      signal: string;
      evidence: string;
      score: "high" | "medium" | "low";
      source_title?: string;
      source_url?: string;
    }>;
  };
  risks: Array<{
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    source_title?: string;
    source_url?: string;
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    potential: "high" | "medium" | "low";
    source_title?: string;
    source_url?: string;
  }>;
  recommended_actions: Array<{
    action: string;
    priority: "immediate" | "short-term" | "long-term";
    rationale: string;
  }>;
  enrichment?: {
    industry?: string;
    website?: string;
    hq?: string;
    size?: string;
    description?: string;
  };
}

export interface ResearchErrorResponse {
  error: string;
}

import { NextResponse } from "next/server";
import { researchCompany } from "@/services/brightdata";
import { generateGTMReport } from "@/services/analysis";
import { scrapeDeepSite } from "@/services/webscraper";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startTime = performance.now();
  try {
    const body = (await request.json()) as { company?: string };
    const company = body.company?.trim();

    if (!company) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    console.log(`[Pipeline] Starting research for: ${company}`);

    // Step 1: Web Research (Parallel with Scraper timeout)
    const researchStart = performance.now();

    // Scraper is optional and shouldn't block for more than 5 seconds
    const scraperWithTimeout = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const result = await scrapeDeepSite(company, controller.signal);
        clearTimeout(timeout);
        return result;
      } catch (e) {
        console.warn(`[Scraper] Timed out or failed for ${company}`);
        return null;
      }
    };

    const [serpResults, scraperResults] = await Promise.all([
      researchCompany(company),
      scraperWithTimeout()
    ]);

    const researchEnd = performance.now();
    const researchTime = ((researchEnd - researchStart) / 1000).toFixed(2);
    console.log(`[Pipeline] Research phase took: ${researchTime}s`);

    // Step 2: Strategic Synthesis via NVIDIA NIM
    const synthesisStart = performance.now();
    const report = await generateGTMReport(serpResults, scraperResults);
    const synthesisEnd = performance.now();
    const synthesisTime = ((synthesisEnd - synthesisStart) / 1000).toFixed(2);
    console.log(`[Pipeline] Synthesis phase took: ${synthesisTime}s`);

    // Step 3 & 4: Persistence & Signal Extraction (Non-blocking)
    const backgroundTasks = (async () => {
      const dbStart = performance.now();
      try {
        const reportRecord = await prisma.researchReport.create({
          data: {
            company: report.company,
            report_json: report as unknown as Prisma.InputJsonValue,
          }
        });

        // Enrich Tracked Company if exists
        await prisma.trackedCompany.updateMany({
          where: { name: { equals: report.company, mode: "insensitive" } },
          data: {
            industry: report.enrichment?.industry,
            description: report.enrichment?.description,
            website: report.enrichment?.website,
            hq: report.enrichment?.hq,
            size: report.enrichment?.size,
          }
        });

        // Create notification
        await prisma.notification.create({
          data: {
            title: "Research Completed",
            message: `Strategic synthesis for ${report.company} is now available (${researchTime}s research, ${synthesisTime}s analysis).`,
            type: "success",
            reportId: reportRecord.id
          }
        });

        const signals = [
          ...report.hiring_activity.signals.map(s => ({ type: "hiring", title: s.title, source: s.source_title || "Search", link: s.source_url, confidence: report.hiring_activity.confidence })),
          ...report.product_activity.launches.map(l => ({ type: "product", title: l.title, source: l.source_title || "Search", link: l.source_url, confidence: report.product_activity.confidence })),
          ...(report.social_intelligence?.signals || []).map(s => ({ type: "social", title: s.insight, source: s.platform, link: s.url, confidence: "medium" })),
          ...report.market_signals.trends.map(t => ({ 
            type: t.type || "news", 
            title: t.signal, 
            source: t.source_title || "Search", 
            link: t.source_url, 
            confidence: report.market_signals.confidence 
          }))
        ];

        if (signals.length > 0) {
          await prisma.marketSignal.createMany({
            data: signals.map(s => ({
              company: report.company,
              type: s.type,
              title: s.title,
              source: s.source,
              link: s.link,
              confidence: s.confidence
            }))
          });
        }
        const dbEnd = performance.now();
        console.log(`[Pipeline] Background DB tasks took: ${((dbEnd - dbStart) / 1000).toFixed(2)}s`);
      } catch (dbError) {
        console.error("[Pipeline] Background DB Error:", dbError);
      }
    })();

    // Return report immediately
    const totalTime = performance.now() - startTime;
    console.log(`[Pipeline] Total time to response: ${(totalTime / 1000).toFixed(2)}s`);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[POST /api/research] Fatal Error:", error);
    const message = error instanceof Error ? error.message : "Failed to complete research pipeline";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

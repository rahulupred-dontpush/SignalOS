import { prisma } from "@/lib/prisma";
import { researchCompany } from "@/services/brightdata";
import { generateGTMReport } from "@/services/analysis";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const trackedCompanies = await prisma.trackedCompany.findMany({
      where: { monitoring_status: "active" }
    });

    console.log(`[Monitoring] Starting cycle for ${trackedCompanies.length} companies...`);

    const results = await Promise.all(trackedCompanies.map(async (company) => {
      try {
        console.log(`[Monitoring] Checking ${company.name}...`);
        
        // 1. Fetch latest signals (using cache if < 24h)
        const serpResults = await researchCompany(company.name);
        
        // 2. Identify new signals
        const existingSignals = await prisma.marketSignal.findMany({
          where: { company: company.name },
          select: { title: true }
        });
        const existingTitles = new Set(existingSignals.map(s => s.title));

        const allNewSignals = [
          ...serpResults.news,
          ...serpResults.hiring_signals,
          ...serpResults.product_signals,
          ...serpResults.social_mentions
        ].filter(s => !existingTitles.has(s.title));

        if (allNewSignals.length > 0) {
          // Save new signals
          await prisma.marketSignal.createMany({
            data: allNewSignals.map(s => {
              const lowTitle = s.title.toLowerCase();
              const type = lowTitle.includes("hiring") || lowTitle.includes("career") ? "hiring" : 
                           lowTitle.includes("launch") || lowTitle.includes("feature") ? "product" : 
                           lowTitle.includes("funding") || lowTitle.includes("round") ? "funding" :
                           lowTitle.includes("partnership") || lowTitle.includes("collab") ? "partnership" :
                           lowTitle.includes("linkedin") || lowTitle.includes("twitter") || lowTitle.includes("reddit") ? "social" : "news";
              
              return {
                company: company.name,
                type,
                title: s.title,
                source: s.source,
                link: s.link,
                confidence: "medium"
              };
            })
          });

          // Trigger notification
          await prisma.notification.create({
            data: {
              title: `New Signals for ${company.name}`,
              message: `Detected ${allNewSignals.length} new strategic movements.`,
              type: "info"
            }
          });
        }

        // Update last checked
        await prisma.trackedCompany.update({
          where: { id: company.id },
          data: { last_checked: new Date() }
        });

        return { company: company.name, newSignals: allNewSignals.length, status: "success" };
      } catch (error) {
        console.error(`[Monitoring] Failed for ${company.name}:`, error);
        return { company: company.name, status: "failed", error: (error as any).message };
      }
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("[Monitoring Service] Fatal Error:", error);
    return NextResponse.json({ error: "Monitoring cycle failed" }, { status: 500 });
  }
}

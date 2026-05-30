import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reports = await prisma.researchReport.findMany({
      orderBy: { created_at: "desc" },
      take: 50
    });
    return Response.json(reports);
  } catch (error) {
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

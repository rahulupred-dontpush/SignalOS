import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const signals = await prisma.marketSignal.findMany({
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return Response.json(signals);
  } catch (error) {
    return Response.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}

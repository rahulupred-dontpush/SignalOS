import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.trackedCompany.findMany({
      orderBy: { created_at: "desc" },
    });
    return Response.json(companies);
  } catch (error) {
    return Response.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) return Response.json({ error: "Name required" }, { status: 400 });

    const company = await prisma.trackedCompany.create({
      data: { name },
    });
    return Response.json(company);
  } catch (error) {
    return Response.json({ error: "Failed to track company" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.trackedCompany.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to remove company" }, { status: 500 });
  }
}

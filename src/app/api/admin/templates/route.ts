import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const email = session.user.email ?? "";
  if (!process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const templates = await prisma.channelTemplate.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { channels: true } } },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, models, modelMapping } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!models || typeof models !== "string" || !models.trim()) {
    return NextResponse.json({ error: "Models are required" }, { status: 400 });
  }
  if (modelMapping !== undefined && modelMapping !== null && typeof modelMapping !== "string") {
    return NextResponse.json({ error: "Model mapping must be a string" }, { status: 400 });
  }
  if (modelMapping && typeof modelMapping === "string") {
    try {
      JSON.parse(modelMapping);
    } catch {
      return NextResponse.json({ error: "Model mapping must be valid JSON" }, { status: 400 });
    }
  }

  try {
    const template = await prisma.channelTemplate.create({
      data: {
        name: name.trim(),
        models: models.trim(),
        modelMapping: modelMapping ? (modelMapping as string).trim() || null : null,
      },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 409 });
    }
    console.error("Failed to create template:", err);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

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
    return NextResponse.json({ error: "Models is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.channelTemplate.update({
      where: { id },
      data: {
        name: (name as string).trim(),
        models: (models as string).trim(),
        modelMapping: modelMapping && typeof modelMapping === "string" && (modelMapping as string).trim()
          ? (modelMapping as string).trim()
          : null,
      },
    });
    return NextResponse.json({ template: updated });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Template name already exists" }, { status: 409 });
    }
    console.error("Failed to update template:", err);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.channelTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    console.error("Failed to delete template:", err);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

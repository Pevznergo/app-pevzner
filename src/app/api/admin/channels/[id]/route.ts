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

  const { status } = body as Record<string, unknown>;
  if (status !== "active" && status !== "archived") {
    return NextResponse.json({ error: "status must be 'active' or 'archived'" }, { status: 400 });
  }

  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  // Sync with newapi if we have a newapiId
  if (channel.newapiId != null) {
    const newapiUrl = process.env.NEWAPI_URL;
    const newapiToken = process.env.NEWAPI_TOKEN;
    if (newapiUrl && newapiToken) {
      try {
        await fetch(`${newapiUrl}/api/channel`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newapiToken}`,
          },
          body: JSON.stringify({
            id: channel.newapiId,
            status: status === "active" ? 1 : 0,
          }),
        });
      } catch (err) {
        console.error("Failed to sync channel status with newapi:", err);
        // Don't fail the local update if newapi sync fails
      }
    }
  }

  const updated = await prisma.channel.update({
    where: { id },
    data: { status: status as string },
    include: { template: { select: { name: true } } },
  });

  return NextResponse.json({ channel: updated });
}

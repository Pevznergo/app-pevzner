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

const VALID_STATUSES = ["pending", "done", "archived", "banned"] as const;

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
  if (!VALID_STATUSES.includes(status as any)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.portalCredential.update({
    where: { id },
    data: { status: status as string },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

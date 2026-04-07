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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const channel = await prisma.channel.findUnique({ where: { id } });
  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }
  if (!channel.newapiId) {
    return NextResponse.json({ error: "Channel has no newapi ID" }, { status: 400 });
  }

  const newapiUrl = process.env.NEWAPI_URL;
  const newapiToken = process.env.NEWAPI_TOKEN;
  if (!newapiUrl || !newapiToken) {
    return NextResponse.json({ error: "NEWAPI_URL or NEWAPI_TOKEN not configured" }, { status: 500 });
  }

  const start = Date.now();
  try {
    const res = await fetch(`${newapiUrl}/api/channel/test/${channel.newapiId}`, {
      headers: {
        Authorization: `Bearer ${newapiToken}`,
        "New-Api-User": "1",
      },
      signal: AbortSignal.timeout(30_000),
    });

    const ms = Date.now() - start;
    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.message || `${res.status}`;
      await prisma.channel.update({
        where: { id },
        data: { lastTestAt: new Date(), lastTestOk: false, lastTestMs: ms, lastTestError: errorMsg },
      });
      return NextResponse.json({ ok: false, ms, error: errorMsg });
    }

    // new-api returns time in seconds — convert to ms for display
    const reportedMs = data.time != null ? Math.round(data.time * 1000) : ms;
    await prisma.channel.update({
      where: { id },
      data: { lastTestAt: new Date(), lastTestOk: true, lastTestMs: reportedMs, lastTestError: null },
    });
    return NextResponse.json({ ok: true, ms: reportedMs });
  } catch (err: any) {
    const ms = Date.now() - start;
    const message = err?.name === "TimeoutError" ? "Timeout (30s)" : (err?.message ?? "Request failed");
    await prisma.channel.update({
      where: { id },
      data: { lastTestAt: new Date(), lastTestOk: false, lastTestMs: ms, lastTestError: message },
    }).catch(() => {});
    return NextResponse.json({ ok: false, ms, error: message });
  }
}

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

const TEST_MODEL = "google/gemini-3.1-flash-lite-preview";

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

  const newapiUrl = process.env.NEWAPI_URL;
  const newapiToken = process.env.NEWAPI_TOKEN;
  if (!newapiUrl || !newapiToken) {
    return NextResponse.json({ error: "NEWAPI_URL or NEWAPI_TOKEN not configured" }, { status: 500 });
  }

  // Route to specific channel via channel_id param (one-api admin feature)
  const url = channel.newapiId
    ? `${newapiUrl}/v1/chat/completions?channel_id=${channel.newapiId}`
    : `${newapiUrl}/v1/chat/completions`;

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newapiToken}`,
        "New-Api-User": "1",
      },
      body: JSON.stringify({
        model: TEST_MODEL,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const ms = Date.now() - start;

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return NextResponse.json({ ok: false, ms, error: `${res.status}: ${text}` });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ ok: true, ms, content });
  } catch (err: any) {
    const ms = Date.now() - start;
    const message = err?.name === "TimeoutError" ? "Timeout (30s)" : (err?.message ?? "Request failed");
    return NextResponse.json({ ok: false, ms, error: message });
  }
}

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

  const channels = await prisma.channel.findMany({
    include: { template: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch live status + quota from newapi and merge
  const newapiUrl = process.env.NEWAPI_URL;
  const newapiToken = process.env.NEWAPI_TOKEN;
  const liveMap = new Map<number, { newapiStatus: number; usedQuota: number }>();

  if (newapiUrl && newapiToken) {
    try {
      const res = await fetch(`${newapiUrl}/api/channel?page_size=500`, {
        headers: { Authorization: `Bearer ${newapiToken}` },
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const data = await res.json();
        const items: any[] = data?.data?.items ?? data?.data ?? [];
        for (const item of items) {
          if (item.id != null) {
            liveMap.set(item.id, {
              newapiStatus: item.status ?? 1,
              usedQuota: item.used_quota ?? 0,
            });
          }
        }
      }
    } catch {
      // Live data unavailable — return local data only
    }
  }

  const enriched = channels.map((ch) => {
    const live = ch.newapiId != null ? liveMap.get(ch.newapiId) : undefined;
    return {
      ...ch,
      newapiStatus: live?.newapiStatus ?? null,
      usedQuota: live?.usedQuota ?? null,
    };
  });

  return NextResponse.json({ channels: enriched });
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

  const { name: rawName, templateId, apiKey, baseUrl, proxy, channelType } = body as Record<string, unknown>;

  const TYPE_LABELS: Record<number, string> = {
    20: "openrouter", 1: "openai", 3: "azure", 14: "anthropic", 24: "gemini", 0: "custom",
  };
  const typeNum = typeof channelType === "number" ? channelType : 20;
  const autoName = `${TYPE_LABELS[typeNum] ?? "channel"}-${Date.now().toString(36).slice(-5)}`;
  const name = rawName && typeof rawName === "string" && rawName.trim() ? rawName.trim() : autoName;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }
  if (!baseUrl || typeof baseUrl !== "string" || !baseUrl.trim()) {
    return NextResponse.json({ error: "Base URL is required" }, { status: 400 });
  }

  const type = typeof channelType === "number" ? channelType : typeNum;

  // Get models + mapping from template if provided
  let models = "";
  let modelMapping: string | null = null;
  if (templateId && typeof templateId === "string") {
    const template = await prisma.channelTemplate.findUnique({ where: { id: templateId } });
    if (template) {
      models = template.models;
      modelMapping = template.modelMapping ?? null;
    }
  }

  const newapiUrl = process.env.NEWAPI_URL;
  const newapiToken = process.env.NEWAPI_TOKEN;

  if (!newapiUrl || !newapiToken) {
    return NextResponse.json({ error: "NEWAPI_URL or NEWAPI_TOKEN not configured" }, { status: 500 });
  }

  // Create channel in newapi
  let newapiId: number | null = null;
  try {
    const newapiRes = await fetch(`${newapiUrl}/api/channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newapiToken}`,
      },
      body: JSON.stringify({
        name,
        type,
        key: (apiKey as string).trim(),
        models,
        model_mapping: modelMapping ?? "",
        base_url: (baseUrl as string).trim(),
        proxy: proxy && typeof proxy === "string" ? proxy.trim() : "",
        status: 1,
      }),
    });

    if (newapiRes.ok) {
      const newapiData = await newapiRes.json();
      if (newapiData.success && newapiData.data?.id) {
        newapiId = newapiData.data.id;
      }
    } else {
      const errText = await newapiRes.text();
      console.error("newapi channel creation failed:", newapiRes.status, errText);
      return NextResponse.json(
        { error: `newapi responded with ${newapiRes.status}: ${errText}` },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Failed to call newapi:", err);
    return NextResponse.json({ error: "Failed to reach newapi" }, { status: 502 });
  }

  const channel = await prisma.channel.create({
    data: {
      name: (name as string).trim(),
      templateId: templateId && typeof templateId === "string" ? templateId : null,
      apiKey: (apiKey as string).trim(),
      baseUrl: (baseUrl as string).trim(),
      proxy: proxy && typeof proxy === "string" ? proxy.trim() || null : null,
      channelType: type,
      newapiId,
      status: "active",
    },
    include: { template: { select: { name: true } } },
  });

  return NextResponse.json({ channel }, { status: 201 });
}

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

  return NextResponse.json({ channels });
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

  const { name, templateId, apiKey, baseUrl, proxy, channelType } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }
  if (!baseUrl || typeof baseUrl !== "string" || !baseUrl.trim()) {
    return NextResponse.json({ error: "Base URL is required" }, { status: 400 });
  }

  const type = typeof channelType === "number" ? channelType : 20;

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
        channel: {
          name: (name as string).trim(),
          type,
          key: (apiKey as string).trim(),
          models,
          model_mapping: modelMapping ?? "",
          base_url: (baseUrl as string).trim(),
          proxy: proxy && typeof proxy === "string" ? proxy.trim() : "",
          status: 1,
        },
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

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

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // optional body, defaults apply
  }

  const country = (body.country as string) || "in";
  const period = Number(body.period) || 1;
  const version = Number(body.version) || 4;
  const proxyProtocol = (body.type as string) || "socks5";

  const setting = await prisma.adminSetting.findUnique({ where: { key: "proxy6_key" } });
  if (!setting?.value) {
    return NextResponse.json({ error: "Proxy6 API key not configured. Set it in Settings." }, { status: 400 });
  }

  const apiKey = setting.value;
  const url = `https://px6.link/api/${apiKey}/buy?count=1&period=${period}&country=${country}&version=${version}&type=${proxyProtocol}`;

  let data: any;
  try {
    const res = await fetch(url, { method: "GET" });
    data = await res.json();
  } catch (err) {
    console.error("proxy6.net request failed:", err);
    return NextResponse.json({ error: "Failed to reach proxy6.net API" }, { status: 502 });
  }

  if (data.status !== "yes") {
    return NextResponse.json(
      { error: data.error ?? "proxy6.net returned an error" },
      { status: 400 }
    );
  }

  // Response: { list: { "proxy_id": { id, ip, host, port, user, pass, type, ... } } }
  const proxyList = data.list as Record<string, any>;
  const firstProxy = Object.values(proxyList)[0];
  if (!firstProxy) {
    return NextResponse.json({ error: "No proxy returned from proxy6.net" }, { status: 500 });
  }

  // Use the requested protocol — don't trust proxy6's returned type field
  const proxy = `${proxyProtocol}://${firstProxy.user}:${firstProxy.pass}@${firstProxy.host}:${firstProxy.port}`;

  return NextResponse.json({ proxy });
}

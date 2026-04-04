import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

const VALID_PORTALS = ["aws", "google-vertex", "azure", "replit", "custom"] as const;
type Portal = (typeof VALID_PORTALS)[number];

const DOCUMENT_VERSION = "tos-v1.0";

function getClientIp(req: NextRequest): string {
  // x-forwarded-for is the real IP when behind nginx/proxy.
  // Take the first entry (leftmost = original client).
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    return normalizeIp(ip);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp);
  return "unknown";
}

// Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const email = session.user.email ?? "";

  if (!(session.user as any).emailVerified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { portal, portalLabel, username, password, consentChecked } = body as Record<string, unknown>;

  // Belt-and-suspenders: reject if consent flag is not explicitly true
  if (consentChecked !== true) {
    return NextResponse.json(
      { error: "Consent is required. Please check the agreement checkbox." },
      { status: 400 }
    );
  }

  if (!portal || !VALID_PORTALS.includes(portal as Portal)) {
    return NextResponse.json({ error: "Invalid portal selection" }, { status: 400 });
  }

  if (portal === "custom" && (!portalLabel || typeof portalLabel !== "string" || !portalLabel.trim())) {
    return NextResponse.json({ error: "Custom portal name is required" }, { status: 400 });
  }

  if (!username || typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  let encrypted: { enc: string; iv: string; tag: string };
  try {
    encrypted = encrypt(password as string);
  } catch (err) {
    console.error("Encryption failed:", err);
    return NextResponse.json({ error: "Encryption service unavailable" }, { status: 500 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert credential — @@unique([userId, portal]) handles duplicate portals as updates
      const credential = await tx.portalCredential.upsert({
        where: { userId_portal: { userId, portal: portal as string } },
        update: {
          portalLabel: portal === "custom" ? (portalLabel as string).trim() : null,
          username: (username as string).trim(),
          passwordEnc: encrypted.enc,
          passwordIv: encrypted.iv,
          passwordTag: encrypted.tag,
        },
        create: {
          userId,
          portal: portal as string,
          portalLabel: portal === "custom" ? (portalLabel as string).trim() : null,
          username: (username as string).trim(),
          passwordEnc: encrypted.enc,
          passwordIv: encrypted.iv,
          passwordTag: encrypted.tag,
        },
      });

      // Create new consent log (always create, even on update — each submission = new consent)
      await tx.consentLog.create({
        data: {
          userId,
          email,
          ipAddress: ip,
          userAgent,
          documentVersion: DOCUMENT_VERSION,
          action: "portal_credential_submission",
          credentialId: credential.id,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save credential:", err);
    return NextResponse.json({ error: "Failed to save credentials. Please try again." }, { status: 500 });
  }
}

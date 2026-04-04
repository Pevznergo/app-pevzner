import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const email = session.user.email ?? "";
  if (!process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const statusFilter = searchParams.get("status"); // "pending" | "done" | "archived" | null (all)

  const where = statusFilter ? { status: statusFilter } : {};

  const [total, credentials] = await Promise.all([
    prisma.portalCredential.count({ where }),
    prisma.portalCredential.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        consentLogs: { orderBy: { timestamp: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  // Duplicate detection: (portal + username) pairs that appear more than once across all users
  const dupeGroups = await prisma.portalCredential.groupBy({
    by: ["portal", "username"],
    _count: { id: true },
    having: { id: { _count: { gt: 1 } } },
  });
  const dupeKeys = new Set(dupeGroups.map((r) => `${r.portal}::${r.username}`));

  // Account counter: how many portals each user has submitted
  const userCounts = await prisma.portalCredential.groupBy({
    by: ["userId"],
    _count: { id: true },
  });
  const userCountMap = new Map(userCounts.map((r) => [r.userId, r._count.id]));

  const result = credentials.map((cred) => {
    let password = "";
    try {
      password = decrypt(cred.passwordEnc, cred.passwordIv, cred.passwordTag);
    } catch {
      password = "[decryption error]";
    }

    return {
      id: cred.id,
      portal: cred.portal,
      portalLabel: cred.portalLabel,
      username: cred.username,
      password,
      status: cred.status,
      isDuplicate: dupeKeys.has(`${cred.portal}::${cred.username}`),
      totalPortals: userCountMap.get(cred.userId) ?? 1,
      createdAt: cred.createdAt,
      userEmail: cred.user.email,
      userName: cred.user.name,
      latestConsent: cred.consentLogs[0]
        ? {
            timestamp: cred.consentLogs[0].timestamp,
            ipAddress: cred.consentLogs[0].ipAddress,
            documentVersion: cred.consentLogs[0].documentVersion,
          }
        : null,
    };
  });

  return NextResponse.json({
    credentials: result,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

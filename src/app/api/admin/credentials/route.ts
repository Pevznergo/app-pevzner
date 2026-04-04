import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email ?? "";
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail || userEmail !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const credentials = await prisma.portalCredential.findMany({
    include: {
      user: { select: { email: true, name: true } },
      consentLogs: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

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

  return NextResponse.json({ credentials: result });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const email = session.user.email ?? "";
  if (!process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalCredentials,
    pendingCredentials,
    doneCredentials,
    totalChannels,
    activeChannels,
  ] = await Promise.all([
    prisma.portalCredential.count(),
    prisma.portalCredential.count({ where: { status: "pending" } }),
    prisma.portalCredential.count({ where: { status: "done" } }),
    prisma.channel.count(),
    prisma.channel.count({ where: { status: "active" } }),
  ]);

  return NextResponse.json({
    credentials: { total: totalCredentials, pending: pendingCredentials, done: doneCredentials },
    channels: { total: totalChannels, active: activeChannels },
  });
}

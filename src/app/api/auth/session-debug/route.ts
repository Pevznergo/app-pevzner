import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({ 
      session,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
        AUTH_URL: process.env.AUTH_URL || null,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || null,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

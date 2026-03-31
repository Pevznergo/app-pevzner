import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

/**
 * Pre-login check: validates credentials and returns whether email is verified.
 * This is needed because next-auth v5 does not expose the original error text
 * from authorize() — all failures come back as "CredentialsSignin".
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ status: "UNVERIFIED" }, { status: 200 });
    }

    return NextResponse.json({ status: "OK" }, { status: 200 });
  } catch (error) {
    console.error("check-login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    const email = rawData.email?.toLowerCase().trim();
    const password = rawData.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Send verification code directly (avoid unreliable internal HTTP fetch)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({ data: { identifier: email, token: otp, expires } });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Pevzner Foundation <noreply@aporto.tech>",
        to: email,
        subject: "Your verification code",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verification Code</h2>
            <p>Your one-time login code:</p>
            <h1 style="letter-spacing: 5px; font-size: 36px; color: #3b82f6;">${otp}</h1>
            <p>This code is valid for 10 minutes.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send verification email:", e);
    }

    return NextResponse.json({ success: true, user: { email: user.email } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

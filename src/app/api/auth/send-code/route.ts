import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Save/Update in database
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: { identifier: email, token: otp }, // Fallback if exists by chance
      },
      update: {
        token: otp,
        expires,
      },
      create: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    // To prevent upsert collision with composite strictness, many use deleteMany first
    // then create to safely overwrite existing active tokens for the same identifier:
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    // Send the email via Resend
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Pevzner Foundation <noreply@aporto.tech>",
      to: email,
      subject: "Ваш код подтверждения / Your verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Код авторизации</h2>
          <p>Ваш одноразовый код для входа:</p>
          <h1 style="letter-spacing: 5px; font-size: 36px; color: #3b82f6;">${otp}</h1>
          <p>Код действителен в течение 10 минут.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("send-code error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email) throw new Error("Email required");

        const email = (credentials.email as string).toLowerCase().trim();
        const user = await prisma.user.findUnique({ 
          where: { email },
          include: { accounts: true }
        });

        // 1. Handle OTP Verification if 'code' is provided
        if (credentials.code) {
          const code = credentials.code as string;
          console.log(`Verifying OTP for ${email}`);
          const tokenRecord = await prisma.verificationToken.findFirst({
            where: { identifier: email, token: code },
          });

          if (!tokenRecord || tokenRecord.expires < new Date()) {
            console.error(`Invalid/expired code for ${email}`);
            throw new Error("Invalid or expired code");
          }

          // Mark user as verified
          console.log(`Setting ${email} to verified...`);
          const updatedUser = await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
          });

          // Clean up token safely without risking composite key constraint errors
          await prisma.verificationToken.deleteMany({
            where: { identifier: email },
          });

          console.log(`Successfully verified user ${email}`);
          return updatedUser;
        }

        // 2. Standard Password Login
        if (!credentials.password) throw new Error("Password required");
        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // If password is valid but email not verified, redirect to verify flow
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
});

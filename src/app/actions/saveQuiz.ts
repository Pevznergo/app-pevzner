"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveQuizAnswers(answers: Record<number, boolean | null>) {
  try {
    const session = await auth();
    
    // Attempting to save whether the user is logged in or not? 
    // Wait, the quiz can be taken by unauthenticated users?
    // Let's check if the quiz is only for authenticated users. The user said "в бд нужно фиксировать ответы юзеров" 
    // Usually only logged-in users are in the DB.
    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const email = session.user?.email || "";

    await prisma.user.update({
      where: { email },
      data: {
         quizAnswers: JSON.stringify(answers),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save quiz answers:", error);
    return { success: false, error: "Internal server error" };
  }
}

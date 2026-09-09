import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.redirect(new URL("/forgot-password?error=missing-email", request.url), 303);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal whether an account exists — land on the same "sent" page either way.
    return NextResponse.redirect(new URL("/forgot-password/sent", request.url), 303);
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return NextResponse.redirect(new URL(`/forgot-password/sent?token=${token}`, request.url), 303);
}

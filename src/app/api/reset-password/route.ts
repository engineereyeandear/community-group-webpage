import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  if (!token) {
    return NextResponse.redirect(new URL("/forgot-password?error=invalid-link", request.url), 303);
  }
  if (!password || password.length < 8) {
    return NextResponse.redirect(
      new URL(`/reset-password/${token}?error=weak-password`, request.url),
      303
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.redirect(
      new URL(`/reset-password/${token}?error=mismatch`, request.url),
      303
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/forgot-password?error=invalid-link", request.url), 303);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/login?reset=success", request.url), 303);
}

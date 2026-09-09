import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getSessionUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  if (!password || password.length < 8) {
    return NextResponse.redirect(new URL("/profile?error=weak-password", request.url), 303);
  }
  if (password !== confirmPassword) {
    return NextResponse.redirect(new URL("/profile?error=mismatch", request.url), 303);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });

  return NextResponse.redirect(new URL("/profile?success=password-set", request.url), 303);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing-fields", request.url), 303);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.redirect(new URL("/login?error=invalid-credentials", request.url), 303);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=invalid-credentials", request.url), 303);
  }

  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL("/profile", request.url), 303);
}

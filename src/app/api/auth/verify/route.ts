import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid-link", request.url), 303);
  }

  const loginToken = await prisma.loginToken.findUnique({ where: { token } });

  if (!loginToken || loginToken.usedAt || loginToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/?error=invalid-link", request.url), 303);
  }

  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { usedAt: new Date() },
  });

  await setSessionCookie(loginToken.userId);

  return NextResponse.redirect(new URL("/profile", request.url), 303);
}

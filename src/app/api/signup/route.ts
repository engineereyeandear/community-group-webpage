import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const displayName = String(form.get("displayName") || "").trim();

  if (!email) {
    return NextResponse.redirect(new URL("/?error=missing-email", request.url), 303);
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (!displayName) {
      return NextResponse.redirect(new URL("/?error=missing-name", request.url), 303);
    }
    user = await prisma.user.create({ data: { email, displayName } });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  await prisma.loginToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return NextResponse.redirect(new URL(`/signup/sent?token=${token}`, request.url), 303);
}

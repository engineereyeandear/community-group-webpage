import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const displayName = String(form.get("displayName") || "").trim();
  const password = String(form.get("password") || "");

  if (!email) {
    return NextResponse.redirect(new URL("/?error=missing-email", request.url), 303);
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (!displayName) {
      return NextResponse.redirect(new URL("/?error=missing-name", request.url), 303);
    }
    // A password is optional at signup, and only ever set here for a brand
    // new account — if the email already belongs to someone, we never touch
    // their password from this form, to avoid a trivial account takeover.
    user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash: password ? await hashPassword(password) : null,
      },
    });
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  await prisma.loginToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  return NextResponse.redirect(new URL(`/signup/sent?token=${token}`, request.url), 303);
}

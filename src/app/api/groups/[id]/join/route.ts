import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: id } },
  });

  if (!existing) {
    await prisma.membership.create({
      data: { userId: user.id, groupId: id, role: "MEMBER", status: "PENDING" },
    });
  }

  return NextResponse.redirect(new URL("/groups", request.url), 303);
}

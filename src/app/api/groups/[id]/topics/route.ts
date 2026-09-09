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

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: id } },
  });

  if (membership?.status !== "ACTIVE") {
    return NextResponse.redirect(new URL(`/groups/${id}`, request.url), 303);
  }

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();

  if (title) {
    await prisma.topic.create({
      data: {
        groupId: id,
        suggestedById: user.id,
        title,
        description: description || null,
      },
    });
  }

  return NextResponse.redirect(new URL(`/groups/${id}`, request.url), 303);
}

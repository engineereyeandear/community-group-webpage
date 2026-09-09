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

  if (membership?.status === "ACTIVE") {
    const group = await prisma.group.findUnique({ where: { id } });
    const votingOpen = !!group?.votingClosesAt && group.votingClosesAt > new Date();

    const form = await request.formData();
    const topicId = String(form.get("topicId") || "");

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });

    if (votingOpen && topic && topic.groupId === id && topic.status === "SUGGESTED") {
      await prisma.vote.upsert({
        where: { userId_groupId: { userId: user.id, groupId: id } },
        update: { topicId },
        create: { userId: user.id, groupId: id, topicId },
      });
    }
  }

  return NextResponse.redirect(new URL(`/groups/${id}`, request.url), 303);
}

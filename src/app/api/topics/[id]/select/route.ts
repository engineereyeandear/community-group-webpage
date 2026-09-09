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

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.redirect(new URL("/groups", request.url), 303);
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: topic.groupId } },
  });
  const isLeader = membership?.status === "ACTIVE" && membership.role === "LEADER";

  if (isLeader) {
    const form = await request.formData();
    const sessionAtRaw = String(form.get("sessionAt") || "");
    const sessionAt = sessionAtRaw ? new Date(sessionAtRaw) : null;

    if (sessionAt && !isNaN(sessionAt.getTime())) {
      const updated = await prisma.topic.update({
        where: { id },
        data: { status: "SELECTED", sessionAt },
      });

      const group = await prisma.group.findUnique({
        where: { id: updated.groupId },
        include: { memberships: { where: { status: "ACTIVE" } } },
      });

      if (group) {
        const when = sessionAt.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });
        await prisma.notification.createMany({
          data: group.memberships.map((m) => ({
            userId: m.userId,
            topicId: updated.id,
            message: `${group.name} will discuss "${updated.title}" on ${when}.`,
          })),
        });
      }
    }
  }

  return NextResponse.redirect(new URL(`/groups/${topic.groupId}`, request.url), 303);
}

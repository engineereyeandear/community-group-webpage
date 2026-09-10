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

  // The group leader can delete a topic while it's still just a suggestion,
  // or after it's been selected (in which case members already have a
  // notification about it, so we send a cancellation notice before removing
  // it — nobody should be left expecting a gathering that's been called off).
  if (isLeader && (topic.status === "SUGGESTED" || topic.status === "SELECTED")) {
    if (topic.status === "SELECTED") {
      const group = await prisma.group.findUnique({
        where: { id: topic.groupId },
        include: { memberships: { where: { status: "ACTIVE" } } },
      });

      if (group) {
        const when = topic.sessionAt
          ? topic.sessionAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          : null;
        const message = when
          ? `${group.name} has cancelled the discussion on "${topic.title}" that was scheduled for ${when}.`
          : `${group.name} has cancelled the discussion on "${topic.title}".`;

        await prisma.notification.createMany({
          data: group.memberships.map((m) => ({
            userId: m.userId,
            topicId: null,
            message,
          })),
        });
      }
    }

    await prisma.topic.delete({ where: { id } });
  }

  return NextResponse.redirect(new URL(`/groups/${topic.groupId}`, request.url), 303);
}

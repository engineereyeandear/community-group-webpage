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
  const isLeader = membership?.status === "ACTIVE" && membership.role === "LEADER";

  if (isLeader) {
    const form = await request.formData();
    const raw = String(form.get("votingClosesAt") || "");
    const votingClosesAt = raw ? new Date(raw) : null;

    if (votingClosesAt && !isNaN(votingClosesAt.getTime())) {
      await prisma.group.update({
        where: { id },
        data: { votingClosesAt },
      });
    }
  }

  return NextResponse.redirect(new URL(`/groups/${id}`, request.url), 303);
}

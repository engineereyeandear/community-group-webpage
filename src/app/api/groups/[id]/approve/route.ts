import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  const { id } = await params;
  const form = await request.formData();
  const membershipId = String(form.get("membershipId") || "");

  if (user && membershipId) {
    const myMembership = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId: id } },
    });
    const isLeader = myMembership?.status === "ACTIVE" && myMembership.role === "LEADER";

    if (isLeader) {
      await prisma.membership.update({
        where: { id: membershipId },
        data: { status: "ACTIVE" },
      });
    }
  }

  return NextResponse.redirect(new URL(`/groups/${id}`, request.url), 303);
}

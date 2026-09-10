import Link from "next/link";
import { redirect } from "next/navigation";
import { Church, UserPlus, Clock3, Crown, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function GroupsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      memberships: { where: { userId: user.id } },
    },
  });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <Church size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Groups</h1>
      </div>
      <p className="mt-3 text-gray-600">
        Browse groups and request to join. A group leader needs to approve your request before you become a member.
      </p>

      <ul className="mt-6 space-y-4">
        {groups.map((group) => {
          const membership = group.memberships[0];
          return (
            <li key={group.id} className="rounded border border-amber-300 bg-amber-100 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-1.5 font-medium hover:underline"
                  >
                    <Church size={16} className="text-amber-600" />
                    {group.name}
                  </Link>
                  {group.description && (
                    <p className="text-sm text-gray-600">{group.description}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {!membership && (
                    <form action={`/api/groups/${group.id}/join`} method="POST">
                      <button className="flex items-center gap-1.5 rounded bg-amber-700 px-3 py-1.5 text-sm text-white hover:bg-amber-800">
                        <UserPlus size={15} />
                        Request to join
                      </button>
                    </form>
                  )}
                  {membership?.status === "PENDING" && (
                    <span className="flex items-center gap-1.5 text-sm text-amber-700">
                      <Clock3 size={15} />
                      Request pending
                    </span>
                  )}
                  {membership?.status === "ACTIVE" && membership.role === "LEADER" && (
                    <span className="flex items-center gap-1.5 text-sm text-green-700">
                      <Crown size={15} />
                      You lead this group
                    </span>
                  )}
                  {membership?.status === "ACTIVE" && membership.role === "MEMBER" && (
                    <span className="flex items-center gap-1.5 text-sm text-green-700">
                      <CheckCircle2 size={15} />
                      Member
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
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
      <h1 className="text-2xl font-semibold">Groups</h1>
      <p className="mt-2 text-gray-600">
        Browse groups and request to join. A group leader needs to approve your request before you become a member.
      </p>

      <ul className="mt-6 space-y-4">
        {groups.map((group) => {
          const membership = group.memberships[0];
          return (
            <li key={group.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link href={`/groups/${group.id}`} className="font-medium hover:underline">
                    {group.name}
                  </Link>
                  {group.description && (
                    <p className="text-sm text-gray-600">{group.description}</p>
                  )}
                </div>
                <div className="shrink-0">
                  {!membership && (
                    <form action={`/api/groups/${group.id}/join`} method="POST">
                      <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
                        Request to join
                      </button>
                    </form>
                  )}
                  {membership?.status === "PENDING" && (
                    <span className="text-sm text-amber-600">Request pending</span>
                  )}
                  {membership?.status === "ACTIVE" && membership.role === "LEADER" && (
                    <span className="text-sm text-green-700">You lead this group</span>
                  )}
                  {membership?.status === "ACTIVE" && membership.role === "MEMBER" && (
                    <span className="text-sm text-green-700">Member</span>
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

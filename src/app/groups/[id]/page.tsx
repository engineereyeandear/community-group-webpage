import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const { id } = await params;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: true } },
      topics: {
        include: { suggestedBy: true, votes: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) notFound();

  const myMembership = group.memberships.find((m) => m.userId === user.id);
  const isLeader = myMembership?.status === "ACTIVE" && myMembership.role === "LEADER";
  const pendingRequests = group.memberships.filter((m) => m.status === "PENDING");
  const myVoteTopicId = group.topics.find((t) =>
    t.votes.some((v) => v.userId === user.id)
  )?.id;
  const votingOpen = !!group.votingClosesAt && group.votingClosesAt > new Date();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      {group.description && <p className="mt-2 text-gray-600">{group.description}</p>}

      {!myMembership && (
        <form action={`/api/groups/${group.id}/join`} method="POST" className="mt-4">
          <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
            Request to join
          </button>
        </form>
      )}
      {myMembership?.status === "PENDING" && (
        <p className="mt-4 text-amber-600">Your request to join is pending approval.</p>
      )}
      {myMembership?.status === "ACTIVE" && (
        <p className="mt-4 text-green-700">
          You are {myMembership.role === "LEADER" ? "the leader" : "a member"} of this group.
        </p>
      )}

      {isLeader && (
        <section className="mt-8">
          <h2 className="text-lg font-medium">Pending join requests</h2>
          {pendingRequests.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">No pending requests.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingRequests.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{m.user.displayName}</p>
                    <p className="text-sm text-gray-600">{m.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/groups/${group.id}/approve`} method="POST">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">
                        Approve
                      </button>
                    </form>
                    <form action={`/api/groups/${group.id}/decline`} method="POST">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                        Decline
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    
      {myMembership?.status === "ACTIVE" && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Discussion topics</h2>

          {isLeader && (
            <form
              action={`/api/groups/${group.id}/voting-deadline`}
              method="POST"
              className="mt-4 flex flex-wrap items-end gap-2 rounded border p-3"
            >
              <div>
                <label className="block text-sm font-medium">Voting closes at</label>
                <input
                  type="datetime-local"
                  name="votingClosesAt"
                  required
                  defaultValue={
                    group.votingClosesAt ? toDatetimeLocalValue(group.votingClosesAt) : undefined
                  }
                  className="mt-1 rounded border px-2 py-1 text-sm"
                />
              </div>
              <button className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white">
                {group.votingClosesAt ? "Update deadline" : "Open voting"}
              </button>
            </form>
          )}

          <p className="mt-3 text-sm text-gray-600">
            {votingOpen
              ? `Voting is open until ${group.votingClosesAt!.toLocaleString()}.`
              : group.votingClosesAt
                ? `Voting closed on ${group.votingClosesAt.toLocaleString()}.`
                : "Voting hasn't been opened yet."}
          </p>

          <form
            action={`/api/groups/${group.id}/topics`}
            method="POST"
            className="mt-4 space-y-3 rounded border p-4"
          >
            <div>
              <label className="block text-sm font-medium">Suggest a topic</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Topic title"
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <textarea
                name="description"
                placeholder="Optional description"
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <button className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
              Suggest topic
            </button>
          </form>

          <ul className="mt-6 space-y-3">
            {group.topics.map((topic) => (
              <li key={topic.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{topic.title}</p>
                    {topic.description && (
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Suggested by {topic.suggestedBy.displayName}
                    </p>
                    {topic.status === "SELECTED" && topic.sessionAt && (
                      <p className="mt-2 text-sm font-medium text-green-700">
                        Selected for {new Date(topic.sessionAt).toLocaleString()}
                      </p>
                    )}
                    {topic.status === "SUGGESTED" && (
                      <p className="mt-2 text-sm text-gray-500">
                        {topic.votes.length} {topic.votes.length === 1 ? "vote" : "votes"}
                      </p>
                    )}
                  </div>
                  {topic.status === "SUGGESTED" && (
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {myVoteTopicId === topic.id ? (
                        <span className="text-sm font-medium text-blue-700">Your vote ✓</span>
                      ) : votingOpen ? (
                        <form action={`/api/groups/${group.id}/vote`} method="POST">
                          <input type="hidden" name="topicId" value={topic.id} />
                          <button className="rounded border border-blue-600 px-3 py-1.5 text-sm text-blue-700">
                            Vote
                          </button>
                        </form>
                      ) : null}
                      {isLeader && (
                        <form
                          action={`/api/topics/${topic.id}/select`}
                          method="POST"
                          className="flex items-center gap-2"
                        >
                          <input
                            type="datetime-local"
                            name="sessionAt"
                            required
                            className="rounded border px-2 py-1 text-sm"
                          />
                          <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white">
                            Select
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {group.topics.length === 0 && (
              <p className="text-sm text-gray-600">No topics suggested yet.</p>
            )}
          </ul>
        </section>
      )}
    </main>
  );
}

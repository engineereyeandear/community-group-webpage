import { notFound, redirect } from "next/navigation";
import {
  Church,
  UserPlus,
  Clock3,
  Crown,
  CheckCircle2,
  Users,
  Check,
  X,
  MessageCircle,
  MessageSquarePlus,
  ThumbsUp,
  CalendarCheck,
} from "lucide-react";
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
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <Church size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">{group.name}</h1>
      </div>
      {group.description && <p className="mt-3 text-gray-600">{group.description}</p>}

      {!myMembership && (
        <form action={`/api/groups/${group.id}/join`} method="POST" className="mt-4">
          <button className="flex items-center gap-1.5 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700">
            <UserPlus size={15} />
            Request to join
          </button>
        </form>
      )}
      {myMembership?.status === "PENDING" && (
        <p className="mt-4 flex items-center gap-1.5 text-amber-600">
          <Clock3 size={16} />
          Your request to join is pending approval.
        </p>
      )}
      {myMembership?.status === "ACTIVE" && (
        <p className="mt-4 flex items-center gap-1.5 text-green-700">
          {myMembership.role === "LEADER" ? <Crown size={16} /> : <CheckCircle2 size={16} />}
          You are {myMembership.role === "LEADER" ? "the leader" : "a member"} of this group.
        </p>
      )}

      {isLeader && (
        <section className="mt-8">
          <h2 className="flex items-center gap-1.5 text-lg font-medium text-amber-950">
            <Users size={18} className="text-amber-600" />
            Pending join requests
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">No pending requests.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingRequests.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded border bg-white p-3">
                  <div>
                    <p className="font-medium">{m.user.displayName}</p>
                    <p className="text-sm text-gray-600">{m.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/groups/${group.id}/approve`} method="POST">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                        <Check size={15} />
                        Approve
                      </button>
                    </form>
                    <form action={`/api/groups/${group.id}/decline`} method="POST">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                        <X size={15} />
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
          <h2 className="flex items-center gap-1.5 text-lg font-medium text-amber-950">
            <MessageCircle size={18} className="text-amber-600" />
            Discussion topics
          </h2>

          {isLeader && (
            <form
              action={`/api/groups/${group.id}/voting-deadline`}
              method="POST"
              className="mt-4 flex flex-wrap items-end gap-2 rounded border bg-white p-3"
            >
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock3 size={15} className="text-amber-600" />
                  Voting closes at
                </label>
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
              <button className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900">
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
            className="mt-4 space-y-3 rounded border bg-white p-4"
          >
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <MessageSquarePlus size={15} className="text-amber-600" />
                Suggest a topic
              </label>
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
            <button className="flex items-center gap-1.5 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700">
              <MessageSquarePlus size={15} />
              Suggest topic
            </button>
          </form>

          <ul className="mt-6 space-y-3">
            {group.topics.map((topic) => (
              <li key={topic.id} className="rounded border bg-white p-4">
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
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-700">
                        <CalendarCheck size={15} />
                        Selected for {new Date(topic.sessionAt).toLocaleString()}
                      </p>
                    )}
                    {topic.status === "SUGGESTED" && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                        <ThumbsUp size={14} />
                        {topic.votes.length} {topic.votes.length === 1 ? "vote" : "votes"}
                      </p>
                    )}
                  </div>
                  {topic.status === "SUGGESTED" && (
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {myVoteTopicId === topic.id ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
                          <CheckCircle2 size={15} />
                          Your vote
                        </span>
                      ) : votingOpen ? (
                        <form action={`/api/groups/${group.id}/vote`} method="POST">
                          <input type="hidden" name="topicId" value={topic.id} />
                          <button className="flex items-center gap-1.5 rounded border border-amber-600 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50">
                            <ThumbsUp size={14} />
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
                          <button className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                            <CalendarCheck size={14} />
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

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

  // A "selected" topic whose gathering date/time has already passed is no
  // longer current — archive it so it drops out of the active list, while
  // keeping the record itself in case a "past topics" view is ever added.
  await prisma.topic.updateMany({
    where: {
      groupId: id,
      status: "SELECTED",
      sessionAt: { lt: new Date() },
    },
    data: { status: "ARCHIVED" },
  });

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: true } },
      topics: {
        where: { NOT: { status: "ARCHIVED" } },
        include: { suggestedBy: true, votes: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!group) notFound();

  const myMembership = group.memberships.find((m) => m.userId === user.id);
  const isLeader = myMembership?.status === "ACTIVE" && myMembership.role === "LEADER";
  const pendingRequests = group.memberships.filter((m) => m.status === "PENDING");
  // A member can now vote for more than one topic in the group, so this
  // tracks the full set of topics they've voted for, not just one.
  const myVoteTopicIds = new Set(
    group.topics.filter((t) => t.votes.some((v) => v.userId === user.id)).map((t) => t.id)
  );
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
          <button className="flex items-center gap-1.5 rounded bg-amber-700 px-3 py-1.5 text-sm text-white hover:bg-amber-800">
            <UserPlus size={15} />
            Request to join
          </button>
        </form>
      )}
      {myMembership?.status === "PENDING" && (
        <p className="mt-4 flex items-center gap-1.5 text-amber-700">
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
                      <button className="flex items-center gap-1.5 rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800">
                        <Check size={15} />
                        Approve
                      </button>
                    </form>
                    <form action={`/api/groups/${group.id}/decline`} method="POST">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button className="flex items-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800">
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
              className="mt-4 flex flex-wrap items-end gap-2 rounded border border-amber-300 bg-amber-100 p-3"
            >
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Clock3 size={15} className="text-amber-700" />
                  Voting closes at
                </label>
                <input
                  type="datetime-local"
                  name="votingClosesAt"
                  required
                  defaultValue={
                    group.votingClosesAt ? toDatetimeLocalValue(group.votingClosesAt) : undefined
                  }
                  className="mt-1 rounded border border-amber-300 bg-white px-2 py-1 text-sm"
                />
              </div>
              <button className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900">
                {group.votingClosesAt ? "Update deadline" : "Open voting"}
              </button>
            </form>
          )}

          <p className="mt-3 text-sm text-gray-600">
            {votingOpen
              ? `Voting is open until ${group.votingClosesAt!.toLocaleString()}. You can vote for as many topics as you like.`
              : group.votingClosesAt
                ? `Voting closed on ${group.votingClosesAt.toLocaleString()}.`
                : "Voting hasn't been opened yet."}
          </p>

          <form
            action={`/api/groups/${group.id}/topics`}
            method="POST"
            className="mt-4 space-y-3 rounded border border-amber-300 bg-amber-100 p-4"
          >
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <MessageSquarePlus size={15} className="text-amber-700" />
                Suggest a topic
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Topic title"
                className="mt-1 w-full rounded border border-amber-300 bg-white px-3 py-2"
              />
            </div>
            <div>
              <textarea
                name="description"
                placeholder="Optional description"
                className="w-full rounded border border-amber-300 bg-white px-3 py-2"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded bg-amber-700 px-3 py-1.5 text-sm text-white hover:bg-amber-800">
              <MessageSquarePlus size={15} />
              Suggest topic
            </button>
          </form>

          <ul className="mt-6 space-y-3">
            {group.topics.map((topic) => {
              const hasMyVote = myVoteTopicIds.has(topic.id);
              return (
                <li
                  key={topic.id}
                  className="rounded border border-amber-300 bg-amber-100 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{topic.title}</p>
                      {topic.description && (
                        <p className="text-sm text-gray-700">{topic.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-600">
                        Suggested by {topic.suggestedBy.displayName}
                      </p>
                      {topic.status === "SELECTED" && topic.sessionAt && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-700">
                          <CalendarCheck size={15} />
                          Selected for {new Date(topic.sessionAt).toLocaleString()}
                        </p>
                      )}
                      {topic.status === "SUGGESTED" && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
                          <ThumbsUp size={14} />
                          {topic.votes.length} {topic.votes.length === 1 ? "vote" : "votes"}
                        </p>
                      )}
                    </div>
                    {topic.status === "SUGGESTED" && (
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {votingOpen ? (
                          <form action={`/api/groups/${group.id}/vote`} method="POST">
                            <input type="hidden" name="topicId" value={topic.id} />
                            {hasMyVote ? (
                              <button className="flex items-center gap-1.5 rounded bg-amber-700 px-3 py-1.5 text-sm text-white hover:bg-amber-800">
                                <CheckCircle2 size={14} />
                                Your vote
                              </button>
                            ) : (
                              <button className="flex items-center gap-1.5 rounded border border-amber-600 bg-white px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50">
                                <ThumbsUp size={14} />
                                Vote
                              </button>
                            )}
                          </form>
                        ) : hasMyVote ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
                            <CheckCircle2 size={15} />
                            Your vote
                          </span>
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
                              className="rounded border border-amber-300 bg-white px-2 py-1 text-sm"
                            />
                            <button className="flex items-center gap-1.5 rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800">
                              <CalendarCheck size={14} />
                              Select
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {group.topics.length === 0 && (
              <p className="text-sm text-gray-600">No topics suggested yet.</p>
            )}
          </ul>
        </section>
      )}
    </main>
  );
}

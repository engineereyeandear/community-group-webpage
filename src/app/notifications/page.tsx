import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <p className="mt-2 text-gray-600">
        In the finished app these would also be emailed to you. For now they show up here.
      </p>
      <ul className="mt-6 space-y-3">
        {notifications.map((n) => (
          <li key={n.id} className="rounded border p-4">
            <p>{n.message}</p>
            <p className="mt-1 text-xs text-gray-400">{n.createdAt.toLocaleString()}</p>
          </li>
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-gray-600">No notifications yet.</p>
        )}
      </ul>
    </main>
  );
}

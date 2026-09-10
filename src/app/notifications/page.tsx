import { redirect } from "next/navigation";
import { Bell, CalendarClock } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <Bell size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Notifications</h1>
      </div>
      <p className="mt-3 text-gray-600">
        In the finished app these would also be emailed to you. For now they show up here.
      </p>
      <ul className="mt-6 space-y-3">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-start gap-3 rounded border border-amber-300 bg-amber-100 p-4">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-gray-900">{n.message}</p>
              <p className="mt-1 text-xs text-gray-600">{n.createdAt.toLocaleString()}</p>
            </div>
          </li>
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-gray-600">No notifications yet.</p>
        )}
      </ul>
    </main>
  );
}

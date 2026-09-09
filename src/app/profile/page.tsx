import { redirect } from "next/navigation";
import { UserCircle, LogOut } from "lucide-react";
import { getSessionUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <UserCircle size={24} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Welcome, {user.displayName}</h1>
      </div>
      <p className="mt-2 text-gray-600">{user.email}</p>

      <form action="/api/auth/signout" method="POST" className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </form>
    </main>
  );
}

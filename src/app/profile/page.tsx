import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user.displayName}</h1>
      <p className="mt-2 text-gray-600">{user.email}</p>

      <form action="/api/auth/signout" method="POST" className="mt-8">
        <button type="submit" className="rounded bg-gray-800 px-4 py-2 text-white">
          Sign out
        </button>
      </form>
    </main>
  );
}

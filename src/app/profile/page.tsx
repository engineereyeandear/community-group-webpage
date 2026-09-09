import { redirect } from "next/navigation";
import { UserCircle, LogOut, KeyRound } from "lucide-react";
import { getSessionUser } from "@/lib/session";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  const { error, success } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <UserCircle size={24} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Welcome, {user.displayName}</h1>
      </div>
      <p className="mt-2 text-gray-600">{user.email}</p>

      <section className="mt-8 rounded border bg-white p-4">
        <h2 className="flex items-center gap-1.5 text-lg font-medium text-amber-950">
          <KeyRound size={18} className="text-amber-600" />
          {user.passwordHash ? "Change password" : "Set a password"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {user.passwordHash
            ? "Update the password you use to log in directly."
            : "Add a password so you can log in directly next time, instead of using an email link."}
        </p>

        {success === "password-set" && (
          <p className="mt-3 text-green-700">Password saved.</p>
        )}
        {error === "weak-password" && (
          <p className="mt-3 text-red-600">Password must be at least 8 characters.</p>
        )}
        {error === "mismatch" && (
          <p className="mt-3 text-red-600">Passwords don&apos;t match.</p>
        )}

        <form action="/api/profile/set-password" method="POST" className="mt-4 space-y-3">
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="New password"
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            placeholder="Confirm new password"
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
          >
            <KeyRound size={15} />
            Save password
          </button>
        </form>
      </section>

      <form action="/api/auth/signout" method="POST" className="mt-6">
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

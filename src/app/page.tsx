import Link from "next/link";
import { HeartHandshake, Mail, UserPlus, ArrowRight, KeyRound } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <HeartHandshake size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Community Gatherings</h1>
      </div>
      <p className="mt-3 text-gray-600">
        Sign up or sign in with just your email — no password needed. Setting
        a password below lets you log in directly next time.
      </p>

      {error === "missing-email" && (
        <p className="mt-4 text-red-600">Please enter an email address.</p>
      )}
      {error === "missing-name" && (
        <p className="mt-4 text-red-600">
          First time here? Please enter a display name too.
        </p>
      )}
      {error === "invalid-link" && (
        <p className="mt-4 text-red-600">
          That link is invalid or has expired. Please sign in again.
        </p>
      )}

      <form action="/api/signup" method="POST" className="mt-6 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Mail size={16} className="text-amber-600" />
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <UserPlus size={16} className="text-amber-600" />
            Display name <span className="text-gray-400">(new members only)</span>
          </label>
          <input
            type="text"
            name="displayName"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <KeyRound size={16} className="text-amber-600" />
            Set a password{" "}
            <span className="text-gray-400">(optional, new members only)</span>
          </label>
          <input
            type="password"
            name="password"
            minLength={8}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already set a password?{" "}
        <Link href="/login" className="text-amber-700 underline">
          Sign in with a password
        </Link>
        .
      </p>
    </main>
  );
}

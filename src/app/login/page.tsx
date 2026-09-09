import Link from "next/link";
import { LogIn, Mail, KeyRound } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <LogIn size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Log in</h1>
      </div>
      <p className="mt-3 text-gray-600">
        Log in with the password you set, or{" "}
        <Link href="/" className="text-amber-700 underline">
          use an email link instead
        </Link>
        .
      </p>

      {reset === "success" && (
        <p className="mt-4 text-green-700">
          Your password has been reset. Please log in below.
        </p>
      )}
      {error === "missing-fields" && (
        <p className="mt-4 text-red-600">Please enter both your email and password.</p>
      )}
      {error === "invalid-credentials" && (
        <p className="mt-4 text-red-600">Incorrect email or password.</p>
      )}

      <form action="/api/login" method="POST" className="mt-6 space-y-4">
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
            <KeyRound size={16} className="text-amber-600" />
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
        >
          Log in
          <LogIn size={16} />
        </button>
      </form>

      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className="text-amber-700 underline">
          Forgot password?
        </Link>
      </p>
    </main>
  );
}

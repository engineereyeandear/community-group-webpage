import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <KeyRound size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Forgot password</h1>
      </div>
      <p className="mt-3 text-gray-600">
        Enter the email you signed up with and we&apos;ll send you a link to
        set a new password.
      </p>

      {error === "missing-email" && (
        <p className="mt-4 text-red-600">Please enter an email address.</p>
      )}

      <form action="/api/forgot-password" method="POST" className="mt-6 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Mail size={16} className="text-amber-600" />
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border border-amber-300 bg-white px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
        >
          <KeyRound size={16} />
          Send reset link
        </button>
      </form>

      <p className="mt-4 text-sm">
        <Link href="/login" className="text-amber-700 underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}

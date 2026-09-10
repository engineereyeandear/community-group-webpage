import Link from "next/link";
import { KeyRound, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  const isValid = !!resetToken && !resetToken.usedAt && resetToken.expiresAt > new Date();

  if (!isValid) {
    return (
      <main className="mx-auto max-w-md p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert size={22} className="text-amber-700" />
          </span>
          <h1 className="text-2xl font-semibold text-amber-950">Link invalid or expired</h1>
        </div>
        <p className="mt-3 text-gray-600">
          This password reset link is no longer valid. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center gap-1.5 rounded bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
        >
          Request a new link
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <KeyRound size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Choose a new password</h1>
      </div>

      {error === "weak-password" && (
        <p className="mt-4 text-red-600">Password must be at least 8 characters.</p>
      )}
      {error === "mismatch" && (
        <p className="mt-4 text-red-600">Passwords don&apos;t match.</p>
      )}

      <form action="/api/reset-password" method="POST" className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="text-sm font-medium text-gray-700">New password</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="mt-1 w-full rounded border border-amber-300 bg-white px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Confirm new password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            className="mt-1 w-full rounded border border-amber-300 bg-white px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded bg-amber-700 px-4 py-2 text-white hover:bg-amber-800"
        >
          <KeyRound size={16} />
          Save new password
        </button>
      </form>
    </main>
  );
}

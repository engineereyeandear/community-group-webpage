import { MailCheck, KeyRound } from "lucide-react";

export default async function ForgotPasswordSentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const resetUrl = token ? `/reset-password/${token}` : null;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <MailCheck size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Check your email</h1>
      </div>
      <p className="mt-3 text-gray-600">
        If an account exists for that email, a password reset link would be
        emailed to it. For this local prototype, there is no email service
        connected yet, so if we found your account, here it is directly:
      </p>
      {resetUrl ? (
        <a
          href={resetUrl}
          className="mt-6 inline-flex items-center gap-1.5 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
        >
          <KeyRound size={16} />
          Click here to reset your password
        </a>
      ) : (
        <p className="mt-4 text-gray-500">
          No link to show — double-check the email address and try again.
        </p>
      )}
    </main>
  );
}

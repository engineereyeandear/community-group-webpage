import { MailCheck, LogIn } from "lucide-react";

export default async function SignupSentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const verifyUrl = token ? `/api/auth/verify?token=${token}` : null;

  return (
    <main className="mx-auto max-w-md p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <MailCheck size={22} className="text-amber-700" />
        </span>
        <h1 className="text-2xl font-semibold text-amber-950">Check your email</h1>
      </div>
      <p className="mt-3 text-gray-600">
        In the finished app, a sign-in link would be emailed to you. For this
        local prototype, there is no email service connected yet, so here it
        is directly:
      </p>
      {verifyUrl ? (
        <a
          href={verifyUrl}
          className="mt-6 inline-flex items-center gap-1.5 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
        >
          <LogIn size={16} />
          Click here to finish signing in
        </a>
      ) : (
        <p className="mt-4 text-red-600">Missing token — please sign up again.</p>
      )}
    </main>
  );
}

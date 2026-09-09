export default async function SignupSentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const verifyUrl = token ? `/api/auth/verify?token=${token}` : null;

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="mt-2 text-gray-600">
        In the finished app, a sign-in link would be emailed to you. For this
        local prototype, there is no email service connected yet, so here it
        is directly:
      </p>
      {verifyUrl ? (
        <a
          href={verifyUrl}
          className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white"
        >
          Click here to finish signing in
        </a>
      ) : (
        <p className="mt-4 text-red-600">Missing token — please sign up again.</p>
      )}
    </main>
  );
}

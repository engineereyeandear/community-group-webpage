export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Community Gatherings</h1>
      <p className="mt-2 text-gray-600">
        Sign up or sign in with just your email — no password needed.
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
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Display name <span className="text-gray-400">(new members only)</span>
          </label>
          <input
            type="text"
            name="displayName"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Continue
        </button>
      </form>
    </main>
  );
}

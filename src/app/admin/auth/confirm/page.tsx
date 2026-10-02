import { confirmSignIn } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Landing page for the emailed sign-in link. Signing in takes a button press
 * (a POST) rather than happening on page load, so email link scanners that
 * pre-fetch URLs can't use up the one-time token.
 */
export default function ConfirmSignInPage({
  searchParams,
}: {
  searchParams?: { token_hash?: string };
}) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-lg font-bold text-slate-900">Finish signing in</h1>
      <form action={confirmSignIn} className="mt-4">
        <input type="hidden" name="token_hash" value={searchParams?.token_hash ?? ""} />
        <button
          type="submit"
          className="w-full rounded-lg bg-ocean-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ocean-700"
        >
          Continue to the review queue
        </button>
      </form>
    </div>
  );
}

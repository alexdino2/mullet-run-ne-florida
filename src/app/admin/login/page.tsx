import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/admin";
import { sendSignInLink } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  config:
    "Sign-in isn't configured on this deployment (needs SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY and ALERT_EMAIL_FROM).",
  send: "Couldn't send the sign-in email. Try again in a minute.",
  link: "That sign-in link is invalid or has expired. Request a new one.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { sent?: string; error?: string };
}) {
  if (await getAdminEmail()) redirect("/admin/instagram");
  const error = searchParams?.error ? ERRORS[searchParams.error] : null;

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-lg font-bold text-slate-900">Admin sign-in</h1>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll email a one-time link to approved reviewer addresses.
      </p>

      {searchParams?.sent ? (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
          If that address is on the reviewer list, a sign-in link is on its way.
          It expires in an hour.
        </p>
      ) : (
        <form action={sendSignInLink} className="mt-4 space-y-3">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-ocean-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-ocean-700"
          >
            Email me a sign-in link
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

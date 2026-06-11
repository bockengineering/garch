import Link from "next/link";
import ChangeFeed from "@/components/ChangeFeed";
import { loadGovMapChangelog } from "@/lib/load-dist-data";

export default async function ChangesPage() {
  const changelog = await loadGovMapChangelog();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-4 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-stone-700 underline underline-offset-2">
          Back to map
        </Link>
        <div className="mt-4 flex flex-col gap-2 border-b border-stone-300 pb-4">
          <h1 className="text-2xl font-semibold">Changes</h1>
          <p className="text-sm text-stone-600">
            Generated changelog and proposed candidate changes awaiting review.
          </p>
        </div>
        <section className="mt-4">
          <ChangeFeed changelog={changelog} />
        </section>
        <section className="mt-6 overflow-x-auto border border-stone-300 bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="border-b border-stone-300 px-3 py-2">Candidate</th>
                <th className="border-b border-stone-300 px-3 py-2">Review status</th>
                <th className="border-b border-stone-300 px-3 py-2">Affected entities</th>
                <th className="border-b border-stone-300 px-3 py-2">Confidence</th>
                <th className="border-b border-stone-300 px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {changelog.candidate_changes.map((change) => (
                <tr key={change.id}>
                  <td className="px-3 py-2 font-medium">{change.id}</td>
                  <td className="px-3 py-2">{change.review_status}</td>
                  <td className="px-3 py-2">{change.affected_entity_ids.join(", ") || "None"}</td>
                  <td className="px-3 py-2">{change.confidence}</td>
                  <td className="max-w-xl px-3 py-2 text-stone-600">{change.proposed_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

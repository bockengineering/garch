import Link from "next/link";
import { loadGovMapGraph } from "@/lib/load-dist-data";

export default async function SourcesPage() {
  const graph = await loadGovMapGraph();
  const sources = graph.nodes.filter((node) => node.type === "source");

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-4 text-stone-950">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-stone-700 underline underline-offset-2">
          Back to map
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Sources</h1>
        <div className="mt-4 overflow-x-auto border border-stone-300 bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="border-b border-stone-300 px-3 py-2">Title</th>
                <th className="border-b border-stone-300 px-3 py-2">Type</th>
                <th className="border-b border-stone-300 px-3 py-2">Publisher</th>
                <th className="border-b border-stone-300 px-3 py-2">License status</th>
                <th className="border-b border-stone-300 px-3 py-2">Retrieved at</th>
                <th className="border-b border-stone-300 px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {sources.map((source) => {
                const metadata = source.metadata as {
                  title?: string;
                  type?: string;
                  publisher?: string | null;
                  license_status?: string;
                  retrieved_at?: string | null;
                  notes?: string | null;
                };
                return (
                  <tr key={source.id}>
                    <td className="px-3 py-2 font-medium">{metadata.title ?? source.label}</td>
                    <td className="px-3 py-2">{metadata.type}</td>
                    <td className="px-3 py-2">{metadata.publisher ?? "Unknown"}</td>
                    <td className="px-3 py-2">{metadata.license_status}</td>
                    <td className="px-3 py-2">{metadata.retrieved_at ?? "Not retrieved"}</td>
                    <td className="max-w-xl px-3 py-2 text-stone-600">{metadata.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

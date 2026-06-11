import Link from "next/link";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import SourceList from "@/components/SourceList";
import { asSourceRefs } from "@/lib/format";
import { loadGovMapGraph } from "@/lib/load-dist-data";
import { getSourceMap } from "@/lib/tree";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const graph = await loadGovMapGraph();
  const person = graph.nodes.find((node) => node.type === "person" && node.id === id);

  if (!person) {
    notFound();
  }

  const assignments = graph.edges
    .filter((edge) => edge.type === "assigned_to" && edge.source === person.id)
    .map((edge) => ({
      edge,
      office: graph.nodes.find((node) => node.id === edge.target)
    }));

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-4 text-stone-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-stone-700 underline underline-offset-2">
          Back to map
        </Link>
        <section className="mt-4 border border-stone-300 bg-white">
          <div className="border-b border-stone-300 px-4 py-4">
            <h1 className="text-xl font-semibold">{person.label}</h1>
            <div className="mt-2 flex items-center gap-2">
              <ConfidenceBadge confidence={person.confidence} />
              <span className="text-xs text-stone-500">{person.id}</span>
            </div>
          </div>
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold">Current assignments</h2>
            {assignments.length > 0 ? (
              <ul className="mt-2 divide-y divide-stone-200 border border-stone-200">
                {assignments.map(({ edge, office }) => (
                  <li key={edge.id} className="px-3 py-2 text-sm">
                    <span className="font-medium">{String(edge.metadata.role_title ?? "Assignment")}</span>
                    {office ? (
                      <Link href={`/offices/${office.id}`} className="ml-2 underline underline-offset-2">
                        {office.label}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-stone-600">None recorded.</p>
            )}
            <h2 className="mt-5 text-sm font-semibold">Prior assignments</h2>
            <p className="mt-2 text-sm text-stone-600">None recorded.</p>
            <h2 className="mt-5 text-sm font-semibold">Sources</h2>
            <div className="mt-2">
              <SourceList sourceRefs={asSourceRefs(person.metadata.sources)} sourceMap={getSourceMap(graph)} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import EntityBadge from "@/components/EntityBadge";
import SourceList from "@/components/SourceList";
import { asSourceRefs, asStringArray } from "@/lib/format";
import { loadGovMapGraph } from "@/lib/load-dist-data";
import { getSourceMap } from "@/lib/tree";

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const graph = await loadGovMapGraph();
  const program = graph.nodes.find((node) => node.type === "program" && node.id === id);

  if (!program) {
    notFound();
  }

  const owningOrgs = graph.edges
    .filter((edge) => edge.type === "owns_program" && edge.target === program.id)
    .map((edge) => graph.nodes.find((node) => node.id === edge.source))
    .filter(Boolean);
  const relatedOrgs = graph.edges
    .filter((edge) => edge.type === "related_to" && edge.source === program.id)
    .map((edge) => graph.nodes.find((node) => node.id === edge.target))
    .filter(Boolean);
  const relatedBudgetLines = relatedOrgs.filter((node) => node?.type === "budget_line");

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-4 text-stone-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-stone-700 underline underline-offset-2">
          Back to map
        </Link>
        <section className="mt-4 border border-stone-300 bg-white">
          <div className="border-b border-stone-300 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{program.label}</h1>
              {program.abbreviation ? <span className="text-sm text-stone-500">{program.abbreviation}</span> : null}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <EntityBadge value={program.status} />
              <ConfidenceBadge confidence={program.confidence} />
            </div>
          </div>
          <div className="space-y-5 px-4 py-4 text-sm">
            <section>
              <h2 className="font-semibold">Owning orgs</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {owningOrgs.length > 0 ? owningOrgs.map((org) => (
                  <Link key={org?.id} href={`/offices/${org?.id}`} className="border border-stone-300 px-2 py-1 text-xs">
                    {org?.label}
                  </Link>
                )) : <span className="text-stone-600">None recorded.</span>}
              </div>
            </section>
            <section>
              <h2 className="font-semibold">Related orgs</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {relatedOrgs.filter((node) => node?.type === "org").length > 0 ? relatedOrgs.filter((node) => node?.type === "org").map((org) => (
                  <Link key={org?.id} href={`/offices/${org?.id}`} className="border border-stone-300 px-2 py-1 text-xs">
                    {org?.label}
                  </Link>
                )) : <span className="text-stone-600">None recorded.</span>}
              </div>
            </section>
            <section>
              <h2 className="font-semibold">Related budget lines</h2>
              <p className="mt-2 text-stone-600">
                {relatedBudgetLines.length > 0 ? relatedBudgetLines.map((line) => line?.label).join(", ") : "None recorded."}
              </p>
            </section>
            <section>
              <h2 className="font-semibold">Capability tags</h2>
              <p className="mt-2 text-stone-600">{asStringArray(program.metadata.capability_tags).join(", ") || "None recorded."}</p>
            </section>
            <section>
              <h2 className="font-semibold">Sources</h2>
              <div className="mt-2">
                <SourceList sourceRefs={asSourceRefs(program.metadata.sources)} sourceMap={getSourceMap(graph)} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

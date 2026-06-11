import Link from "next/link";
import { notFound } from "next/navigation";
import GovMapOfficeDetail from "@/components/GovMapOfficeDetail";
import { loadGovMapGraph } from "@/lib/load-dist-data";
import { getSourceMap } from "@/lib/tree";

export default async function OfficePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const graph = await loadGovMapGraph();
  const office = graph.nodes.find((node) => node.type === "org" && node.id === id);

  if (!office) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-4 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-stone-700 underline underline-offset-2">
          Back to map
        </Link>
        <div className="mt-4 border border-stone-300">
          <GovMapOfficeDetail graph={graph} office={office} sourceMap={getSourceMap(graph)} />
        </div>
      </div>
    </main>
  );
}

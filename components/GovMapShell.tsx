"use client";

import { useMemo, useState } from "react";
import ChangeFeed from "@/components/ChangeFeed";
import GovMapOfficeDetail from "@/components/GovMapOfficeDetail";
import GovMapSearch from "@/components/GovMapSearch";
import GovMapTree from "@/components/GovMapTree";
import SourceList from "@/components/SourceList";
import { runSearch } from "@/lib/search";
import { buildOfficeTree, getOrgNodes, getSourceMap, type OfficeTreeNode } from "@/lib/tree";
import type { ChangelogArtifact, GraphArtifact, GraphNode, ManifestArtifact, SearchIndexArtifact } from "@/types";

function filterTree(nodes: OfficeTreeNode[], filters: { query: string; service: string; confidence: string }): OfficeTreeNode[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return nodes
    .map((node) => {
      const childMatches = filterTree(node.children, filters);
      const serviceMatches = filters.service === "all" || node.service === filters.service;
      const confidenceMatches = filters.confidence === "all" || node.confidence === filters.confidence;
      const queryMatches =
        normalizedQuery.length === 0 ||
        [node.id, node.label, node.abbreviation ?? "", node.service ?? "", ...(node.metadata.functions as string[] | undefined ?? []), ...(node.metadata.capability_tags as string[] | undefined ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      if ((serviceMatches && confidenceMatches && queryMatches) || childMatches.length > 0) {
        return { ...node, children: childMatches };
      }

      return null;
    })
    .filter((node): node is OfficeTreeNode => Boolean(node));
}

export default function GovMapShell({
  graph,
  searchIndex,
  changelog,
  manifest
}: {
  graph: GraphArtifact;
  searchIndex: SearchIndexArtifact;
  changelog: ChangelogArtifact;
  manifest: ManifestArtifact;
}) {
  const [selectedId, setSelectedId] = useState("org.dow");
  const [query, setQuery] = useState("");
  const [service, setService] = useState("all");
  const [confidence, setConfidence] = useState("all");

  const orgNodes = useMemo(() => getOrgNodes(graph), [graph]);
  const sourceMap = useMemo(() => getSourceMap(graph), [graph]);
  const tree = useMemo(() => buildOfficeTree(graph), [graph]);
  const visibleTree = useMemo(
    () => filterTree(tree, { query, service, confidence }),
    [tree, query, service, confidence]
  );
  const services = useMemo(
    () => [...new Set(orgNodes.map((node) => node.service).filter((value): value is string => Boolean(value)))].sort(),
    [orgNodes]
  );
  const searchResults = useMemo(() => runSearch(searchIndex, query), [searchIndex, query]);
  const selectedOffice =
    orgNodes.find((node) => node.id === selectedId) ??
    orgNodes.find((node) => node.id === "org.dow") ??
    orgNodes[0];
  const seedSourceRefs = [{ source_id: "source.dow-directory-2026-r6", usage: "seed_source_policy" }];

  const selectOffice = (id: string) => {
    setSelectedId(id);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-300 bg-white px-4 py-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Government Office Map</h1>
            <p className="mt-1 text-sm text-stone-600">
              Source-backed map of government offices, programs, people, and funding relationships.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 sm:grid-cols-4">
            <div>
              <span className="block font-semibold text-stone-950">{manifest.record_counts.orgs}</span>
              orgs
            </div>
            <div>
              <span className="block font-semibold text-stone-950">{manifest.record_counts.sources}</span>
              sources
            </div>
            <div>
              <span className="block font-semibold text-stone-950">{manifest.record_counts.programs}</span>
              programs
            </div>
            <div>
              <span className="block font-semibold text-stone-950">{manifest.schema_version}</span>
              schema
            </div>
          </div>
        </div>
      </header>

      <GovMapSearch
        query={query}
        service={service}
        confidence={confidence}
        services={services}
        results={searchResults}
        onQueryChange={setQuery}
        onServiceChange={setService}
        onConfidenceChange={setConfidence}
        onSelectResult={(entry) => {
          if (entry.type === "org") {
            setSelectedId(entry.id);
          }
        }}
      />

      <div className="grid min-h-[calc(100vh-150px)] grid-cols-1 border-t border-stone-200 lg:grid-cols-[330px_minmax(0,1fr)_330px]">
        <aside className="border-b border-stone-300 bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-950">Office hierarchy</h2>
            <p className="mt-1 text-xs text-stone-500">{visibleTree.length} root node shown</p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <GovMapTree tree={visibleTree} selectedId={selectedOffice.id} onSelect={selectOffice} />
          </div>
        </aside>

        <section className="min-w-0 bg-stone-50">
          {selectedOffice ? (
            <GovMapOfficeDetail
              graph={graph}
              office={selectedOffice as GraphNode}
              sourceMap={sourceMap}
              onSelectOffice={selectOffice}
            />
          ) : (
            <div className="p-4 text-sm text-stone-600">No office selected.</div>
          )}
        </section>

        <aside className="border-t border-stone-300 bg-stone-100 lg:border-l lg:border-t-0">
          <div className="border-b border-stone-300 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-950">Source status</h2>
          </div>
          <div className="space-y-4 px-4 py-4">
            <SourceList sourceRefs={seedSourceRefs} sourceMap={sourceMap} />
            <div>
              <h2 className="mb-2 text-sm font-semibold text-stone-950">Recent changes</h2>
              <ChangeFeed changelog={changelog} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

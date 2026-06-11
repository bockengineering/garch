"use client";

import Link from "next/link";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import EntityBadge from "@/components/EntityBadge";
import SourceList from "@/components/SourceList";
import { asSourceRefs, asStringArray, formatDate, formatLabel } from "@/lib/format";
import type { GraphArtifact, GraphNode } from "@/types";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-stone-200 py-2 sm:grid-cols-[150px_1fr]">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-900">{value}</dd>
    </div>
  );
}

function TagList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-stone-500">None recorded</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className="border border-stone-300 bg-stone-50 px-2 py-0.5 text-xs text-stone-700">
          {value}
        </span>
      ))}
    </div>
  );
}

export default function GovMapOfficeDetail({
  graph,
  office,
  sourceMap,
  onSelectOffice
}: {
  graph: GraphArtifact;
  office: GraphNode;
  sourceMap: Map<string, GraphNode>;
  onSelectOffice?: (id: string) => void;
}) {
  const parentEdge = graph.edges.find((edge) => edge.type === "parent_child" && edge.target === office.id);
  const parent = parentEdge ? graph.nodes.find((node) => node.id === parentEdge.source) : null;
  const childIds = graph.edges
    .filter((edge) => edge.type === "parent_child" && edge.source === office.id)
    .map((edge) => edge.target);
  const children = childIds
    .map((id) => graph.nodes.find((node) => node.id === id))
    .filter((node): node is GraphNode => Boolean(node));
  const assignments = graph.edges
    .filter((edge) => edge.type === "assigned_to" && edge.target === office.id)
    .map((edge) => ({
      edge,
      person: graph.nodes.find((node) => node.id === edge.source)
    }));
  const programs = graph.edges
    .filter((edge) => edge.type === "owns_program" && edge.source === office.id)
    .map((edge) => graph.nodes.find((node) => node.id === edge.target))
    .filter((node): node is GraphNode => Boolean(node));
  const funding = graph.edges
    .filter((edge) => edge.type === "funded_by" && edge.source === office.id)
    .map((edge) => graph.nodes.find((node) => node.id === edge.target))
    .filter((node): node is GraphNode => Boolean(node));

  const orgType = String(office.metadata.org_type ?? office.type);
  const sourceRefs = asSourceRefs(office.metadata.sources);

  return (
    <section className="bg-white">
      <div className="border-b border-stone-300 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-normal text-stone-950">{office.label}</h2>
          {office.abbreviation ? <span className="text-sm font-medium text-stone-500">{office.abbreviation}</span> : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <EntityBadge value={office.status} />
          <ConfidenceBadge confidence={office.confidence} />
          <span className="text-xs text-stone-500">{office.id}</span>
        </div>
      </div>

      <dl className="px-4 py-2">
        <DetailRow label="Type" value={formatLabel(orgType)} />
        <DetailRow label="Service" value={formatLabel(office.service ?? "unknown")} />
        <DetailRow label="Last verified" value={formatDate(office.last_verified)} />
        <DetailRow
          label="Parent office"
          value={
            parent ? (
              onSelectOffice ? (
                <button type="button" onClick={() => onSelectOffice(parent.id)} className="font-medium text-stone-950 underline underline-offset-2">
                  {parent.label}
                </button>
              ) : (
                <Link className="font-medium text-stone-950 underline underline-offset-2" href={`/offices/${parent.id}`}>
                  {parent.label}
                </Link>
              )
            ) : (
              "Root"
            )
          }
        />
        <DetailRow
          label="Child offices"
          value={
            children.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {children.map((child) =>
                  onSelectOffice ? (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => onSelectOffice(child.id)}
                      className="border border-stone-300 px-2 py-1 text-xs hover:border-stone-700"
                    >
                      {child.label}
                    </button>
                  ) : (
                    <Link key={child.id} className="border border-stone-300 px-2 py-1 text-xs hover:border-stone-700" href={`/offices/${child.id}`}>
                      {child.label}
                    </Link>
                  )
                )}
              </div>
            ) : (
              <span className="text-stone-500">None recorded</span>
            )
          }
        />
        <DetailRow label="Functions" value={<TagList values={asStringArray(office.metadata.functions)} />} />
        <DetailRow label="Capability tags" value={<TagList values={asStringArray(office.metadata.capability_tags)} />} />
        <DetailRow
          label="People"
          value={
            assignments.length > 0 ? (
              <ul className="space-y-1">
                {assignments.map(({ edge, person }) => (
                  <li key={edge.id}>
                    {person ? <Link href={`/people/${person.id}`} className="font-medium underline underline-offset-2">{person.label}</Link> : edge.source}
                    <span className="text-stone-500"> | {String(edge.metadata.role_title ?? "Assignment")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-stone-500">None recorded</span>
            )
          }
        />
        <DetailRow
          label="Related programs"
          value={
            programs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {programs.map((program) => (
                  <Link key={program.id} href={`/programs/${program.id}`} className="border border-stone-300 px-2 py-1 text-xs hover:border-stone-700">
                    {program.label}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-stone-500">None recorded</span>
            )
          }
        />
        <DetailRow
          label="Linked funding"
          value={
            funding.length > 0 ? (
              <ul className="space-y-1">
                {funding.map((node) => (
                  <li key={node.id}>{node.label}</li>
                ))}
              </ul>
            ) : (
              <span className="text-stone-500">None recorded</span>
            )
          }
        />
      </dl>

      <div className="border-t border-stone-300 px-4 py-4">
        <h3 className="mb-2 text-sm font-semibold text-stone-950">Sources</h3>
        <SourceList sourceRefs={sourceRefs} sourceMap={sourceMap} />
      </div>
    </section>
  );
}

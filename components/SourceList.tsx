"use client";

import type { GraphNode } from "@/types";

type SourceRef = {
  source_id: string;
  page?: string | number;
  usage?: string;
};

export default function SourceList({
  sourceRefs,
  sourceMap
}: {
  sourceRefs: SourceRef[];
  sourceMap: Map<string, GraphNode>;
}) {
  if (sourceRefs.length === 0) {
    return <p className="text-sm text-stone-600">No sources attached.</p>;
  }

  return (
    <ul className="divide-y divide-stone-200 border border-stone-200 bg-white">
      {sourceRefs.map((ref) => {
        const source = sourceMap.get(ref.source_id);
        const metadata = (source?.metadata ?? {}) as {
          title?: string;
          type?: string;
          publisher?: string | null;
          license_status?: string;
          notes?: string | null;
        };

        return (
          <li key={`${ref.source_id}-${ref.page ?? "none"}`} className="px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-stone-950">{metadata.title ?? ref.source_id}</span>
              <span className="text-xs text-stone-500">{metadata.type ?? "source"}</span>
            </div>
            <div className="mt-1 text-xs text-stone-600">
              {metadata.publisher ? <span>{metadata.publisher}</span> : null}
              {metadata.publisher && metadata.license_status ? <span> | </span> : null}
              {metadata.license_status ? <span>{metadata.license_status}</span> : null}
              {ref.page ? <span> | page {ref.page}</span> : null}
              {ref.usage ? <span> | {ref.usage}</span> : null}
            </div>
            {metadata.notes ? <p className="mt-1 text-xs leading-5 text-stone-600">{metadata.notes}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

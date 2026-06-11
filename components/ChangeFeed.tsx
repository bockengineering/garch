"use client";

import ConfidenceBadge from "@/components/ConfidenceBadge";
import EntityBadge from "@/components/EntityBadge";
import { formatDate, formatLabel } from "@/lib/format";
import type { ChangelogArtifact } from "@/types";

export default function ChangeFeed({ changelog }: { changelog: ChangelogArtifact }) {
  return (
    <div className="space-y-2">
      {changelog.events.slice(0, 8).map((event) => (
        <div key={event.id} className="border border-stone-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {formatLabel(event.type)}
            </span>
            <ConfidenceBadge confidence={event.confidence} />
            {event.review_status ? <EntityBadge value={event.review_status} /> : null}
          </div>
          <p className="mt-1 text-sm font-medium leading-5 text-stone-950">{event.title}</p>
          <p className="mt-1 text-xs text-stone-500">
            {formatDate(event.created_at)}
            {event.affected_entity_ids.length > 0 ? ` | ${event.affected_entity_ids.join(", ")}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

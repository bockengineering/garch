"use client";

import { formatLabel } from "@/lib/format";

const toneClass: Record<string, string> = {
  active: "border-emerald-300 bg-emerald-50 text-emerald-800",
  inactive: "border-stone-300 bg-stone-100 text-stone-700",
  stale: "border-orange-300 bg-orange-50 text-orange-900",
  needs_review: "border-amber-300 bg-amber-50 text-amber-900",
  conflicting: "border-red-300 bg-red-50 text-red-800",
  unknown: "border-stone-300 bg-stone-100 text-stone-700"
};

export default function EntityBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${toneClass[value] ?? toneClass.unknown}`}>
      {formatLabel(value)}
    </span>
  );
}

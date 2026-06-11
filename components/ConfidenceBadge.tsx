"use client";

import { formatLabel } from "@/lib/format";
import type { Confidence } from "@/schemas/shared";

const confidenceClass: Record<Confidence, string> = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-800",
  medium: "border-blue-300 bg-blue-50 text-blue-800",
  low: "border-amber-300 bg-amber-50 text-amber-900",
  unknown: "border-stone-300 bg-stone-100 text-stone-700"
};

export default function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${confidenceClass[confidence]}`}>
      {formatLabel(confidence)}
    </span>
  );
}

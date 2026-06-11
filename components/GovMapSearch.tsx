"use client";

import type { Confidence } from "@/schemas/shared";
import type { SearchIndexEntry } from "@/types";

export default function GovMapSearch({
  query,
  service,
  confidence,
  services,
  results,
  onQueryChange,
  onServiceChange,
  onConfidenceChange,
  onSelectResult
}: {
  query: string;
  service: string;
  confidence: string;
  services: string[];
  results: SearchIndexEntry[];
  onQueryChange: (query: string) => void;
  onServiceChange: (service: string) => void;
  onConfidenceChange: (confidence: string) => void;
  onSelectResult: (entry: SearchIndexEntry) => void;
}) {
  const confidenceOptions: Array<Confidence | "all"> = ["all", "high", "medium", "low", "unknown"];

  return (
    <div className="border-b border-stone-300 bg-stone-100 px-4 py-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px]">
        <label className="block">
          <span className="sr-only">Search government map</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search offices, abbreviations, services, functions, capability tags"
            className="h-10 w-full border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-stone-700"
          />
        </label>
        <label className="block">
          <span className="sr-only">Service filter</span>
          <select
            value={service}
            onChange={(event) => onServiceChange(event.target.value)}
            className="h-10 w-full border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-stone-700"
          >
            <option value="all">All services</option>
            {services.map((serviceOption) => (
              <option key={serviceOption} value={serviceOption}>
                {serviceOption}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Confidence filter</span>
          <select
            value={confidence}
            onChange={(event) => onConfidenceChange(event.target.value)}
            className="h-10 w-full border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-stone-700"
          >
            {confidenceOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All confidence" : option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {results.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {results.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-label={`${entry.title}${entry.subtitle ? ` ${entry.subtitle}` : ""}`}
              onClick={() => onSelectResult(entry)}
              className="border border-stone-300 bg-white px-2.5 py-1 text-left text-xs text-stone-800 hover:border-stone-700 hover:text-stone-950"
            >
              <span className="font-medium">{entry.title}</span>
              {entry.subtitle ? <span className="ml-1 text-stone-500">{entry.subtitle}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

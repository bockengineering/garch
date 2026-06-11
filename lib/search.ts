import type { SearchIndexArtifact, SearchIndexEntry } from "@/types";

export function runSearch(index: SearchIndexArtifact, query: string, limit = 8): SearchIndexEntry[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  return index.entries
    .map((entry) => {
      const haystack = [entry.id, entry.title, entry.subtitle ?? "", ...entry.tokens]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((count, term) => count + (haystack.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((result) => result.entry);
}

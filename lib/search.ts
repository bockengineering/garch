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
      const id = entry.id.toLowerCase();
      const title = entry.title.toLowerCase();
      const subtitle = entry.subtitle?.toLowerCase() ?? "";
      const score = terms.reduce((total, term) => {
        const exactTitle = title === term ? 100 : 0;
        const titleMatch = title.includes(term) ? 40 : 0;
        const exactSubtitle = subtitle === term ? 80 : 0;
        const subtitleMatch = subtitle.includes(term) ? 30 : 0;
        const exactToken = entry.tokens.includes(term) ? 10 : 0;
        const idMatch = id.includes(term) ? 5 : 0;
        return total + exactTitle + titleMatch + exactSubtitle + subtitleMatch + exactToken + idMatch;
      }, 0);
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((result) => result.entry);
}

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  ChangelogArtifact,
  GraphArtifact,
  ManifestArtifact,
  SearchIndexArtifact
} from "@/types";

async function readDistJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(process.cwd(), "dist", fileName);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

export function loadGovMapGraph() {
  return readDistJson<GraphArtifact>("graph.json");
}

export function loadGovMapSearchIndex() {
  return readDistJson<SearchIndexArtifact>("search-index.json");
}

export function loadGovMapChangelog() {
  return readDistJson<ChangelogArtifact>("changelog.json");
}

export function loadGovMapManifest() {
  return readDistJson<ManifestArtifact>("manifest.json");
}

export async function loadGovMapArtifacts() {
  const [graph, searchIndex, changelog, manifest] = await Promise.all([
    loadGovMapGraph(),
    loadGovMapSearchIndex(),
    loadGovMapChangelog(),
    loadGovMapManifest()
  ]);

  return {
    graph,
    searchIndex,
    changelog,
    manifest
  };
}

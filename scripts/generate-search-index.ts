import { promises as fs } from "node:fs";
import path from "node:path";
import packageJson from "@/package.json";
import type { SearchIndexArtifact, SearchIndexEntry } from "@/types";
import { getGeneratedAt } from "./build-metadata";
import { loadData, recordCounts, type LoadedData } from "./data-loader";
import { validateData } from "./validation";

function tokenize(values: Array<string | null | undefined>) {
  return [
    ...new Set(
      values
        .filter((value): value is string => Boolean(value))
        .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
        .filter(Boolean)
    )
  ];
}

export function buildSearchIndexArtifact(data: LoadedData): SearchIndexArtifact {
  const issues = validateData(data);
  if (issues.length > 0) {
    throw new Error(
      `Cannot build search index with validation issues:\n${issues.map((i) => i.message).join("\n")}`
    );
  }

  const entries: SearchIndexEntry[] = [
    ...data.orgs.map((org) => ({
      id: org.id,
      type: "org" as const,
      title: org.name,
      subtitle: org.abbreviation ?? org.type,
      service: org.service,
      confidence: org.confidence,
      url: `/offices/${org.id}`,
      tokens: tokenize([
        org.id,
        org.name,
        org.abbreviation,
        org.service,
        org.type,
        ...org.functions,
        ...org.capability_tags
      ]),
      matched_fields: ["id", "name", "abbreviation", "service", "type", "functions", "capability_tags"]
    })),
    ...data.people.map((person) => ({
      id: person.id,
      type: "person" as const,
      title: person.name,
      subtitle: person.aliases.join(", ") || null,
      service: null,
      confidence: person.confidence,
      url: `/people/${person.id}`,
      tokens: tokenize([person.id, person.name, ...person.aliases, person.notes]),
      matched_fields: ["id", "name", "aliases", "notes"]
    })),
    ...data.programs.map((program) => ({
      id: program.id,
      type: "program" as const,
      title: program.name,
      subtitle: program.abbreviation ?? null,
      service: null,
      confidence: program.confidence,
      url: `/programs/${program.id}`,
      tokens: tokenize([
        program.id,
        program.name,
        program.abbreviation,
        program.description_short,
        ...program.capability_tags
      ]),
      matched_fields: ["id", "name", "abbreviation", "description_short", "capability_tags"]
    }))
  ];

  return {
    metadata: {
      generated_at: getGeneratedAt(),
      version: packageJson.version,
      record_counts: recordCounts(data)
    },
    entries
  };
}

export async function writeSearchIndexArtifact(root = process.cwd()) {
  const data = await loadData(root);
  const index = buildSearchIndexArtifact(data);
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  await fs.writeFile(path.join(root, "dist", "search-index.json"), `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

function isDirectRun() {
  return /generate-search-index\.(ts|js)$/.test(process.argv[1] ?? "");
}

if (isDirectRun()) {
  writeSearchIndexArtifact()
    .then(() => {
      console.log("Built dist/search-index.json.");
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

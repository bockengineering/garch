import { promises as fs } from "node:fs";
import path from "node:path";
import packageJson from "@/package.json";
import type { ManifestArtifact } from "@/types";
import { getGeneratedAt } from "./build-metadata";
import { loadData, recordCounts, type LoadedData } from "./data-loader";
import { validateData } from "./validation";

export function buildManifestArtifact(data: LoadedData): ManifestArtifact {
  const issues = validateData(data);
  if (issues.length > 0) {
    throw new Error(`Cannot build manifest with validation issues:\n${issues.map((i) => i.message).join("\n")}`);
  }

  return {
    generated_at: getGeneratedAt(),
    package_version: packageJson.version,
    schema_version: "0.1.0",
    record_counts: recordCounts(data),
    public_repo_notice:
      "This repository contains public-safe structured metadata and generated artifacts. Seed-only directory material is not republished.",
    license_notice:
      "Original code and structured metadata are MIT licensed unless otherwise noted. Referenced source materials keep their own license status.",
    consumption_notes: [
      "Use dist/graph.json for office/program/person/funding relationship data.",
      "Use dist/search-index.json for simple client-side search.",
      "Use dist/changelog.json for generated build events and candidate changes.",
      "Use dist/manifest.json to inspect artifact versioning and record counts.",
      "Do not parse raw YAML at runtime in downstream consumers."
    ]
  };
}

export async function writeManifestArtifact(root = process.cwd()) {
  const data = await loadData(root);
  const manifest = buildManifestArtifact(data);
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  await fs.writeFile(path.join(root, "dist", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function isDirectRun() {
  return /build-manifest\.(ts|js)$/.test(process.argv[1] ?? "");
}

if (isDirectRun()) {
  writeManifestArtifact()
    .then(() => {
      console.log("Built dist/manifest.json.");
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

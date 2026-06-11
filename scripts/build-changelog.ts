import { promises as fs } from "node:fs";
import path from "node:path";
import packageJson from "@/package.json";
import type { ChangelogArtifact } from "@/types";
import { getBuildEventId, getGeneratedAt, getGitMetadata } from "./build-metadata";
import { loadData, type LoadedData } from "./data-loader";
import { validateData } from "./validation";

export function buildChangelogArtifact(data: LoadedData): ChangelogArtifact {
  const issues = validateData(data);
  if (issues.length > 0) {
    throw new Error(`Cannot build changelog with validation issues:\n${issues.map((i) => i.message).join("\n")}`);
  }

  const generatedAt = getGeneratedAt();
  const candidateEvents = data.candidateChanges.map((change) => ({
    id: change.id,
    type: change.change_type,
    title: change.proposed_action,
    created_at: change.created_at,
    affected_entity_ids: change.affected_entity_ids,
    confidence: change.confidence,
    review_status: change.review_status
  }));

  return {
    metadata: {
      generated_at: generatedAt,
      version: packageJson.version,
      git: getGitMetadata()
    },
    events: [
      {
        id: getBuildEventId(generatedAt),
        type: "artifact_build",
        title: "Generated public JSON artifacts from canonical YAML records.",
        created_at: generatedAt,
        affected_entity_ids: [],
        confidence: "high"
      },
      ...candidateEvents
    ],
    candidate_changes: data.candidateChanges
  };
}

export async function writeChangelogArtifact(root = process.cwd()) {
  const data = await loadData(root);
  const changelog = buildChangelogArtifact(data);
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  await fs.writeFile(path.join(root, "dist", "changelog.json"), `${JSON.stringify(changelog, null, 2)}\n`);
  return changelog;
}

function isDirectRun() {
  return /build-changelog\.(ts|js)$/.test(process.argv[1] ?? "");
}

if (isDirectRun()) {
  writeChangelogArtifact()
    .then(() => {
      console.log("Built dist/changelog.json.");
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

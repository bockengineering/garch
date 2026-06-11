import { writeChangelogArtifact } from "./build-changelog";
import { writeGraphArtifact } from "./build-graph";
import { writeManifestArtifact } from "./build-manifest";
import { writeSearchIndexArtifact } from "./generate-search-index";
import { loadData } from "./data-loader";
import { validateData } from "./validation";

async function main() {
  process.env.GARCH_GENERATED_AT ??= new Date().toISOString();

  const data = await loadData();
  const issues = validateData(data);

  if (issues.length > 0) {
    console.error("Data validation failed:");
    issues.forEach((issue) => {
      console.error(`- [${issue.code}] ${issue.message}`);
    });
    process.exit(1);
  }

  await writeGraphArtifact();
  await writeSearchIndexArtifact();
  await writeChangelogArtifact();
  await writeManifestArtifact();

  console.log("Built all dist artifacts.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

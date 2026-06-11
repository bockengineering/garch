import GovMapShell from "@/components/GovMapShell";
import { loadGovMapArtifacts } from "@/lib/load-dist-data";

export default async function HomePage() {
  const { graph, searchIndex, changelog, manifest } = await loadGovMapArtifacts();

  return (
    <GovMapShell
      graph={graph}
      searchIndex={searchIndex}
      changelog={changelog}
      manifest={manifest}
    />
  );
}

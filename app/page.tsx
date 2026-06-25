import GovMapShell from "@/components/GovMapShell";
import { loadGovMapChangelog, loadGovMapManifest } from "@/lib/load-dist-data";

export default async function HomePage() {
  const [changelog, manifest] = await Promise.all([
    loadGovMapChangelog(),
    loadGovMapManifest()
  ]);

  return (
    <GovMapShell
      changelog={changelog}
      manifest={manifest}
    />
  );
}

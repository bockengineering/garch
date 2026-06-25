import { promises as fs } from "node:fs";
import path from "node:path";

const allowedArtifacts = new Set([
  "graph.json",
  "search-index.json",
  "changelog.json",
  "manifest.json"
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;

  if (!allowedArtifacts.has(file)) {
    return new Response("Not found", { status: 404 });
  }

  const artifactPath = path.join(process.cwd(), "dist", file);
  const content = await fs.readFile(artifactPath, "utf8");

  return new Response(content, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

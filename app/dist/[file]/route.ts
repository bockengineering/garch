import { promises as fs } from "node:fs";
import path from "node:path";

const artifactFiles = new Set([
  "graph.json",
  "search-index.json",
  "changelog.json",
  "manifest.json"
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  if (!artifactFiles.has(file)) {
    return Response.json({ error: "Artifact not found" }, { status: 404 });
  }

  try {
    const content = await fs.readFile(path.join(process.cwd(), "dist", file), "utf8");
    return new Response(content, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch {
    return Response.json({ error: "Artifact not found" }, { status: 404 });
  }
}

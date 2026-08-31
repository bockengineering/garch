import { loadData, recordCounts } from "./data-loader";
import { buildGraphArtifact } from "./build-graph";
import { validateData } from "./validation";

function tally(values: string[]) {
  return Object.fromEntries(
    [...new Set(values)].sort().map((value) => [value, values.filter((item) => item === value).length])
  );
}

async function main() {
  const data = await loadData();
  const issues = validateData(data);
  const graph = buildGraphArtifact(data);
  const edgeIds = new Set<string>();
  const duplicateEdgeIds = new Set<string>();

  graph.edges.forEach((edge) => {
    if (edgeIds.has(edge.id)) {
      duplicateEdgeIds.add(edge.id);
    }
    edgeIds.add(edge.id);
  });

  duplicateEdgeIds.forEach((edgeId) => {
    issues.push({
      code: "duplicate_graph_edge_id",
      message: `generated graph edge id is duplicated: ${edgeId}`
    });
  });

  if (issues.length > 0) {
    console.error("Public-data audit failed:");
    issues.forEach((issue) => console.error(`- [${issue.code}] ${issue.message}`));
    process.exit(1);
  }

  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const canonicalRecords = [
    ...data.orgs.map((record) => ({ ...record, kind: "org" })),
    ...data.people.map((record) => ({ ...record, kind: "person" })),
    ...data.assignments.map((record) => ({ ...record, kind: "assignment" })),
    ...data.programs.map((record) => ({ ...record, kind: "program" }))
  ];
  const seedOnlyRecords = canonicalRecords.filter((record) =>
    record.sources.every(
      (sourceRef) =>
        sourceById.get(sourceRef.source_id)?.license_status === "seed_only_no_republication"
    )
  );
  const datedRecords = [...data.orgs, ...data.assignments];
  const verifiedDates = datedRecords.map((record) => record.last_verified).sort();

  const report = {
    grain: "one record per canonical entity ID; assignments link one person to one organization role",
    counts: recordCounts(data),
    graph: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      duplicate_edge_ids: 0
    },
    confidence: {
      orgs: tally(data.orgs.map((record) => record.confidence)),
      people: tally(data.people.map((record) => record.confidence)),
      assignments: tally(data.assignments.map((record) => record.confidence)),
      programs: tally(data.programs.map((record) => record.confidence))
    },
    assignment_status: tally(data.assignments.map((record) => record.status)),
    source_license_status: tally(data.sources.map((record) => record.license_status)),
    seed_only_record_count: seedOnlyRecords.length,
    independently_sourced_record_count: canonicalRecords.length - seedOnlyRecords.length,
    last_verified_range: {
      earliest: verifiedDates.at(0) ?? null,
      latest: verifiedDates.at(-1) ?? null
    },
    public_safety: {
      validation_issues: 0,
      contact_and_credential_patterns: 0,
      copied_text_guardrail: "500 characters for public person notes and org descriptions"
    }
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

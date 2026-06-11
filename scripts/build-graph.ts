import { promises as fs } from "node:fs";
import path from "node:path";
import packageJson from "@/package.json";
import type {
  EdgeType,
  GraphArtifact,
  GraphEdge,
  GraphNode,
  SourceRecord
} from "@/types";
import { loadData, recordCounts, type LoadedData } from "./data-loader";
import { validateData } from "./validation";

function sourceCount(record: { sources?: unknown[]; source_ids?: unknown[] }) {
  return (record.sources ?? record.source_ids ?? []).length;
}

function makeNode(input: Omit<GraphNode, "source_count"> & { source_count?: number }): GraphNode {
  return {
    ...input,
    source_count: input.source_count ?? 0
  };
}

function makeEdge(
  type: EdgeType,
  source: string,
  target: string,
  confidence: GraphEdge["confidence"],
  metadata: Record<string, unknown> = {}
): GraphEdge {
  return {
    id: `${type}:${source}->${target}`,
    type,
    source,
    target,
    confidence,
    metadata
  };
}

function sourceNode(source: SourceRecord): GraphNode {
  return makeNode({
    id: source.id,
    type: "source",
    label: source.title,
    abbreviation: null,
    service: null,
    status: "unknown",
    confidence: "unknown",
    last_verified: source.retrieved_at ?? null,
    source_count: 0,
    metadata: source
  });
}

function sourcedByEdges(
  entityId: string,
  confidence: GraphEdge["confidence"],
  refs: Array<{ source_id: string }>
) {
  return refs.map((ref) =>
    makeEdge("sourced_by", entityId, ref.source_id, confidence, {
      source_reference: ref
    })
  );
}

export function buildGraphArtifact(data: LoadedData): GraphArtifact {
  const issues = validateData(data);
  if (issues.length > 0) {
    throw new Error(`Cannot build graph with validation issues:\n${issues.map((i) => i.message).join("\n")}`);
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  data.orgs.forEach((org) => {
    nodes.push(
      makeNode({
        id: org.id,
        type: "org",
        label: org.name,
        abbreviation: org.abbreviation ?? null,
        service: org.service,
        status: org.status,
        confidence: org.confidence,
        last_verified: org.last_verified,
        source_count: sourceCount(org),
        metadata: {
          ...org,
          org_type: org.type
        }
      })
    );

    if (org.parent_id) {
      edges.push(
        makeEdge("parent_child", org.parent_id, org.id, org.confidence, {
          service: org.service
        })
      );
    }

    org.location_ids.forEach((locationId) => {
      edges.push(makeEdge("located_at", org.id, locationId, org.confidence));
    });

    edges.push(...sourcedByEdges(org.id, org.confidence, org.sources));
  });

  data.people.forEach((person) => {
    nodes.push(
      makeNode({
        id: person.id,
        type: "person",
        label: person.name,
        abbreviation: null,
        service: null,
        status: "unknown",
        confidence: person.confidence,
        last_verified: null,
        source_count: sourceCount(person),
        metadata: person
      })
    );
    edges.push(...sourcedByEdges(person.id, person.confidence, person.sources));
  });

  data.assignments.forEach((assignment) => {
    nodes.push(
      makeNode({
        id: assignment.id,
        type: "assignment",
        label: assignment.role_title,
        abbreviation: null,
        service: null,
        status: assignment.status === "verified_current" ? "active" : "needs_review",
        confidence: assignment.confidence,
        last_verified: assignment.last_verified,
        source_count: sourceCount(assignment),
        metadata: assignment
      })
    );
    edges.push(
      makeEdge("assigned_to", assignment.person_id, assignment.org_id, assignment.confidence, {
        assignment_id: assignment.id,
        role_title: assignment.role_title,
        role_type: assignment.role_type,
        status: assignment.status
      })
    );
    edges.push(...sourcedByEdges(assignment.id, assignment.confidence, assignment.sources));
  });

  data.programs.forEach((program) => {
    nodes.push(
      makeNode({
        id: program.id,
        type: "program",
        label: program.name,
        abbreviation: program.abbreviation ?? null,
        service: null,
        status: program.status,
        confidence: program.confidence,
        last_verified: null,
        source_count: sourceCount(program),
        metadata: program
      })
    );

    program.owning_org_ids.forEach((orgId) => {
      edges.push(makeEdge("owns_program", orgId, program.id, program.confidence));
    });
    program.related_org_ids.forEach((orgId) => {
      edges.push(makeEdge("related_to", program.id, orgId, program.confidence));
    });
    program.related_budget_line_ids.forEach((budgetLineId) => {
      edges.push(makeEdge("related_to", program.id, budgetLineId, program.confidence));
    });
    edges.push(...sourcedByEdges(program.id, program.confidence, program.sources));
  });

  data.budgetLines.forEach((line) => {
    nodes.push(
      makeNode({
        id: line.id,
        type: "budget_line",
        label: line.title,
        abbreviation: line.line_number ?? null,
        service: line.service,
        status: "unknown",
        confidence: line.confidence,
        last_verified: null,
        source_count: sourceCount(line),
        metadata: line
      })
    );

    line.owning_org_ids.forEach((orgId) => {
      edges.push(makeEdge("funded_by", orgId, line.id, line.confidence));
    });
    line.related_program_ids.forEach((programId) => {
      edges.push(makeEdge("related_to", line.id, programId, line.confidence));
    });
    line.source_ids.forEach((sourceId) => {
      edges.push(makeEdge("sourced_by", line.id, sourceId, line.confidence));
    });
  });

  data.funding.forEach((funding) => {
    nodes.push(
      makeNode({
        id: funding.id,
        type: "funding",
        label: funding.recipient_name ?? funding.id,
        abbreviation: funding.award_type ?? null,
        service: null,
        status: "unknown",
        confidence: funding.confidence,
        last_verified: funding.last_imported,
        source_count: funding.source_url ? 1 : 0,
        metadata: funding
      })
    );

    if (funding.budget_line_id) {
      edges.push(makeEdge("funded_by", funding.id, funding.budget_line_id, funding.confidence));
    }

    funding.linked_org_ids.forEach((orgId) => {
      edges.push(makeEdge("related_to", funding.id, orgId, funding.confidence));
    });
  });

  data.sources.forEach((source) => {
    nodes.push(sourceNode(source));
  });

  return {
    metadata: {
      generated_at: new Date().toISOString(),
      version: packageJson.version,
      record_counts: recordCounts(data)
    },
    nodes,
    edges
  };
}

export async function writeGraphArtifact(root = process.cwd()) {
  const data = await loadData(root);
  const graph = buildGraphArtifact(data);
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  await fs.writeFile(path.join(root, "dist", "graph.json"), `${JSON.stringify(graph, null, 2)}\n`);
  return graph;
}

function isDirectRun() {
  return /build-graph\.(ts|js)$/.test(process.argv[1] ?? "");
}

if (isDirectRun()) {
  writeGraphArtifact()
    .then(() => {
      console.log("Built dist/graph.json.");
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

import type { AssignmentRecord } from "@/schemas/assignment.schema";
import type { BudgetLineRecord } from "@/schemas/budget-line.schema";
import type { CandidateChangeRecord } from "@/schemas/candidate-change.schema";
import type { FundingRecord } from "@/schemas/funding.schema";
import type { OrgRecord } from "@/schemas/org.schema";
import type { PersonRecord } from "@/schemas/person.schema";
import type { ProgramRecord } from "@/schemas/program.schema";
import type { SourceRecord } from "@/schemas/source.schema";
import type { Confidence, Status } from "@/schemas/shared";

export type {
  AssignmentRecord,
  BudgetLineRecord,
  CandidateChangeRecord,
  FundingRecord,
  OrgRecord,
  PersonRecord,
  ProgramRecord,
  SourceRecord
};

export type EntityType =
  | "org"
  | "person"
  | "assignment"
  | "program"
  | "budget_line"
  | "funding"
  | "source"
  | "location";

export type EdgeType =
  | "parent_child"
  | "assigned_to"
  | "owns_program"
  | "related_to"
  | "funded_by"
  | "sourced_by"
  | "located_at";

export type GraphNode = {
  id: string;
  type: EntityType;
  label: string;
  abbreviation?: string | null;
  service?: string | null;
  status: Status;
  confidence: Confidence;
  last_verified?: string | null;
  source_count: number;
  metadata: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  type: EdgeType;
  source: string;
  target: string;
  confidence: Confidence;
  metadata: Record<string, unknown>;
};

export type RecordCounts = {
  orgs: number;
  people: number;
  assignments: number;
  programs: number;
  budget_lines: number;
  funding: number;
  sources: number;
};

export type GraphArtifact = {
  metadata: {
    generated_at: string;
    version: string;
    record_counts: RecordCounts;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type SearchIndexEntry = {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string | null;
  service?: string | null;
  confidence: Confidence;
  url: string;
  tokens: string[];
  matched_fields: string[];
};

export type SearchIndexArtifact = {
  metadata: {
    generated_at: string;
    version: string;
    record_counts: RecordCounts;
  };
  entries: SearchIndexEntry[];
};

export type ChangelogArtifact = {
  metadata: {
    generated_at: string;
    version: string;
    git: {
      commit_sha: string | null;
      modified_files: string[];
    };
  };
  events: Array<{
    id: string;
    type: string;
    title: string;
    created_at: string;
    affected_entity_ids: string[];
    confidence: Confidence;
    review_status?: string;
  }>;
  candidate_changes: CandidateChangeRecord[];
};

export type ManifestArtifact = {
  generated_at: string;
  package_version: string;
  schema_version: string;
  record_counts: RecordCounts;
  public_repo_notice: string;
  license_notice: string;
  consumption_notes: string[];
};

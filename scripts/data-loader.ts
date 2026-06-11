import { promises as fs } from "node:fs";
import path from "node:path";
import { parseAllDocuments } from "yaml";
import type { z } from "zod";
import { assignmentSchema, type AssignmentRecord } from "@/schemas/assignment.schema";
import { budgetLineSchema, type BudgetLineRecord } from "@/schemas/budget-line.schema";
import {
  candidateChangeSchema,
  type CandidateChangeRecord
} from "@/schemas/candidate-change.schema";
import { fundingSchema, type FundingRecord } from "@/schemas/funding.schema";
import { orgSchema, type OrgRecord } from "@/schemas/org.schema";
import { personSchema, type PersonRecord } from "@/schemas/person.schema";
import { programSchema, type ProgramRecord } from "@/schemas/program.schema";
import { sourceSchema, type SourceRecord } from "@/schemas/source.schema";

export type LoadedData = {
  orgs: OrgRecord[];
  people: PersonRecord[];
  assignments: AssignmentRecord[];
  programs: ProgramRecord[];
  budgetLines: BudgetLineRecord[];
  funding: FundingRecord[];
  sources: SourceRecord[];
  candidateChanges: CandidateChangeRecord[];
};

type LoadError = {
  file: string;
  message: string;
};

export class DataLoadError extends Error {
  constructor(public readonly issues: LoadError[]) {
    super(issues.map((issue) => `${issue.file}: ${issue.message}`).join("\n"));
  }
}

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findYamlFiles(dir: string): Promise<string[]> {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findYamlFiles(entryPath);
      }

      if (entry.isFile() && /\.(ya?ml)$/i.test(entry.name)) {
        return [entryPath];
      }

      return [];
    })
  );

  return nested.flat().sort();
}

function normalizeParsedDocument(value: unknown): unknown[] {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "records" in value &&
    Array.isArray((value as { records: unknown }).records)
  ) {
    return (value as { records: unknown[] }).records;
  }

  return [value];
}

async function loadRecords<T>(
  root: string,
  relativeDir: string,
  schema: z.ZodType<T>
): Promise<T[]> {
  const dir = path.join(root, relativeDir);
  const files = await findYamlFiles(dir);
  const records: T[] = [];
  const issues: LoadError[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const documents = parseAllDocuments(content);

    documents.forEach((document, documentIndex) => {
      if (document.errors.length > 0) {
        issues.push({
          file,
          message: document.errors.map((error) => error.message).join("; ")
        });
        return;
      }

      const values = normalizeParsedDocument(document.toJSON());

      values.forEach((value, recordIndex) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) {
          records.push(parsed.data);
          return;
        }

        issues.push({
          file,
          message: `document ${documentIndex + 1}, record ${recordIndex + 1}: ${parsed.error.message}`
        });
      });
    });
  }

  if (issues.length > 0) {
    throw new DataLoadError(issues);
  }

  return records;
}

export async function loadData(root = process.cwd()): Promise<LoadedData> {
  const [
    orgs,
    people,
    assignments,
    programs,
    budgetLines,
    funding,
    sources,
    candidateChanges
  ] = await Promise.all([
    loadRecords(root, "data/orgs", orgSchema),
    loadRecords(root, "data/people", personSchema),
    loadRecords(root, "data/assignments", assignmentSchema),
    loadRecords(root, "data/programs", programSchema),
    loadRecords(root, "data/budget-lines", budgetLineSchema),
    loadRecords(root, "data/funding", fundingSchema),
    loadRecords(root, "data/sources", sourceSchema),
    loadRecords(root, "data/agent-candidates", candidateChangeSchema)
  ]);

  return {
    orgs,
    people,
    assignments,
    programs,
    budgetLines,
    funding,
    sources,
    candidateChanges
  };
}

export function recordCounts(data: LoadedData) {
  return {
    orgs: data.orgs.length,
    people: data.people.length,
    assignments: data.assignments.length,
    programs: data.programs.length,
    budget_lines: data.budgetLines.length,
    funding: data.funding.length,
    sources: data.sources.length
  };
}

import type { LoadedData } from "./data-loader";

export type ValidationIssue = {
  code: string;
  message: string;
};

function duplicateIssues(entityType: string, ids: string[]): ValidationIssue[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  });

  return [...duplicates].map((id) => ({
    code: "duplicate_id",
    message: `${entityType} id is duplicated: ${id}`
  }));
}

function sourceCoverageIssues(data: LoadedData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sourceIds = new Set(data.sources.map((source) => source.id));

  const checkSourceRefs = (
    entityType: string,
    id: string,
    sources: Array<{ source_id: string }>
  ) => {
    if (sources.length === 0) {
      issues.push({
        code: "missing_source",
        message: `${entityType} ${id} lacks at least one source`
      });
    }

    sources.forEach((source) => {
      if (!sourceIds.has(source.source_id)) {
        issues.push({
          code: "missing_source_ref",
          message: `${entityType} ${id} references missing source ${source.source_id}`
        });
      }
    });
  };

  data.orgs.forEach((record) => checkSourceRefs("org", record.id, record.sources));
  data.people.forEach((record) => checkSourceRefs("person", record.id, record.sources));
  data.assignments.forEach((record) => checkSourceRefs("assignment", record.id, record.sources));
  data.programs.forEach((record) => checkSourceRefs("program", record.id, record.sources));

  data.budgetLines.forEach((record) => {
    if (record.source_ids.length === 0) {
      issues.push({
        code: "missing_source",
        message: `budget line ${record.id} lacks at least one source`
      });
    }

    record.source_ids.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) {
        issues.push({
          code: "missing_source_ref",
          message: `budget line ${record.id} references missing source ${sourceId}`
        });
      }
    });
  });

  data.candidateChanges.forEach((record) => {
    record.source_ids.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) {
        issues.push({
          code: "missing_source_ref",
          message: `candidate change ${record.id} references missing source ${sourceId}`
        });
      }
    });
  });

  data.sources.forEach((source) => {
    if (source.license_status !== "seed_only_no_republication" && !source.retrieved_at) {
      issues.push({
        code: "source_missing_retrieved_at",
        message: `source ${source.id} must include retrieved_at unless it is seed_only_no_republication`
      });
    }
  });

  data.funding.forEach((record) => {
    if (!record.source && !record.source_url) {
      issues.push({
        code: "missing_source",
        message: `funding record ${record.id} lacks source metadata`
      });
    }
  });

  return issues;
}

function referenceIssues(data: LoadedData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const orgIds = new Set(data.orgs.map((org) => org.id));
  const personIds = new Set(data.people.map((person) => person.id));
  const programIds = new Set(data.programs.map((program) => program.id));
  const budgetLineIds = new Set(data.budgetLines.map((line) => line.id));
  const rootOrgId = "org.dow";

  data.orgs.forEach((org) => {
    if (org.id !== rootOrgId && !org.parent_id) {
      issues.push({
        code: "missing_parent",
        message: `non-root org ${org.id} lacks parent_id`
      });
    }

    if (org.parent_id && !orgIds.has(org.parent_id)) {
      issues.push({
        code: "missing_parent_ref",
        message: `org ${org.id} references missing parent ${org.parent_id}`
      });
    }
  });

  if (!orgIds.has(rootOrgId)) {
    issues.push({
      code: "missing_root_org",
      message: `root org ${rootOrgId} is required`
    });
  }

  data.assignments.forEach((assignment) => {
    if (!personIds.has(assignment.person_id)) {
      issues.push({
        code: "missing_person_ref",
        message: `assignment ${assignment.id} references missing person ${assignment.person_id}`
      });
    }

    if (!orgIds.has(assignment.org_id)) {
      issues.push({
        code: "missing_org_ref",
        message: `assignment ${assignment.id} references missing org ${assignment.org_id}`
      });
    }
  });

  data.programs.forEach((program) => {
    [...program.owning_org_ids, ...program.related_org_ids].forEach((orgId) => {
      if (!orgIds.has(orgId)) {
        issues.push({
          code: "missing_org_ref",
          message: `program ${program.id} references missing org ${orgId}`
        });
      }
    });

    program.related_budget_line_ids.forEach((budgetLineId) => {
      if (!budgetLineIds.has(budgetLineId)) {
        issues.push({
          code: "missing_budget_line_ref",
          message: `program ${program.id} references missing budget line ${budgetLineId}`
        });
      }
    });
  });

  data.budgetLines.forEach((line) => {
    line.owning_org_ids.forEach((orgId) => {
      if (!orgIds.has(orgId)) {
        issues.push({
          code: "missing_org_ref",
          message: `budget line ${line.id} references missing org ${orgId}`
        });
      }
    });

    line.related_program_ids.forEach((programId) => {
      if (!programIds.has(programId)) {
        issues.push({
          code: "missing_program_ref",
          message: `budget line ${line.id} references missing program ${programId}`
        });
      }
    });
  });

  data.funding.forEach((record) => {
    if (record.budget_line_id && !budgetLineIds.has(record.budget_line_id)) {
      issues.push({
        code: "missing_budget_line_ref",
        message: `funding record ${record.id} references missing budget line ${record.budget_line_id}`
      });
    }

    record.linked_org_ids.forEach((orgId) => {
      if (!orgIds.has(orgId)) {
        issues.push({
          code: "missing_org_ref",
          message: `funding record ${record.id} references missing org ${orgId}`
        });
      }
    });
  });

  return issues;
}

function hierarchyIssues(data: LoadedData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const childrenByParent = new Map<string, string[]>();
  const orgById = new Map(data.orgs.map((org) => [org.id, org]));

  data.orgs.forEach((org) => {
    if (org.parent_id) {
      const children = childrenByParent.get(org.parent_id) ?? [];
      children.push(org.id);
      childrenByParent.set(org.parent_id, children);
    }
  });

  data.orgs.forEach((org) => {
    const visited = new Set<string>();
    let current = org;

    while (current.parent_id) {
      if (visited.has(current.id)) {
        issues.push({
          code: "hierarchy_cycle",
          message: `org hierarchy cycle detected at ${org.id}`
        });
        break;
      }

      visited.add(current.id);
      const parent = orgById.get(current.parent_id);
      if (!parent) {
        break;
      }
      current = parent;
    }
  });

  const reachable = new Set<string>();
  const visit = (id: string) => {
    if (reachable.has(id)) {
      return;
    }
    reachable.add(id);
    (childrenByParent.get(id) ?? []).forEach(visit);
  };

  visit("org.dow");

  data.orgs.forEach((org) => {
    if (!reachable.has(org.id)) {
      issues.push({
        code: "orphan_graph_node",
        message: `generated graph would contain orphan org node ${org.id}`
      });
    }
  });

  return issues;
}

export function validateData(data: LoadedData): ValidationIssue[] {
  return [
    ...duplicateIssues("org", data.orgs.map((record) => record.id)),
    ...duplicateIssues("person", data.people.map((record) => record.id)),
    ...duplicateIssues("assignment", data.assignments.map((record) => record.id)),
    ...duplicateIssues("program", data.programs.map((record) => record.id)),
    ...duplicateIssues("budget line", data.budgetLines.map((record) => record.id)),
    ...duplicateIssues("funding", data.funding.map((record) => record.id)),
    ...duplicateIssues("source", data.sources.map((record) => record.id)),
    ...duplicateIssues("candidate change", data.candidateChanges.map((record) => record.id)),
    ...sourceCoverageIssues(data),
    ...referenceIssues(data),
    ...hierarchyIssues(data)
  ];
}

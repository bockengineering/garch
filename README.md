# GARCH

Government Architecture, Relationships, Changes, and History

GARCH is a public, repo-backed data package and lightweight demo site for mapping government offices, programs, people, funding relationships, sources, and change history.

The core contract is data-first:

```text
canonical YAML records
-> validation scripts
-> generated /dist JSON artifacts
-> demo site consumes /dist JSON
-> FBud can later consume the same /dist JSON
```

## What This Repo Is

This repo is a public-safe structured data package for government office mapping. It stores canonical records as YAML, validates cross-record references with TypeScript and Zod, builds static JSON artifacts in `dist/`, and includes a dense Next.js demo interface for inspection.

## What This Repo Is Not

This is not a scraper, not a database-backed app, not an AI-agent workflow, and not a republication of the uploaded DoW Directory. The DoW Directory is only a seed source for initial mapping. Public claims should be verified against official or public sources before being treated as verified.

## Why YAML Is Canonical

YAML keeps the canonical records reviewable in pull requests. Each entity lives as structured data rather than prose, so validation can catch duplicate IDs, missing parents, bad enum values, broken references, and missing sources before generated artifacts are published.

Markdown is reserved for methodology and optional analyst notes. It is not the primary database.

## Why `dist/` JSON Is Consumed

The demo site and downstream projects should consume only generated artifacts:

- `dist/graph.json`
- `dist/search-index.json`
- `dist/changelog.json`
- `dist/manifest.json`

This keeps runtime consumers independent from YAML parsing and lets FBud use the same public artifact contract as the standalone demo.

## Data Model Overview

Primary canonical record types:

- Organizations and offices: hierarchy, service, function, capability tags, source status.
- People: public-safe person records without private contact information.
- Assignments: person-to-office roles, separate from organizations.
- Programs: capability or acquisition programs linked to offices and budget lines.
- Budget lines: fiscal-year budget records linked to programs and owners.
- Funding records: award or obligation records linked to public funding sources.
- Sources: public or seed-only source metadata.
- Candidate changes: proposed future updates from agents or analysts, not canonical records.

## Add An Org

Create or edit a YAML file under `data/orgs/<service>/`.

Required pattern:

```yaml
id: org.example.office
type: office
name: Example Office
abbreviation: EXO
parent_id: org.example
service: other
functions:
  - acquisition
capability_tags:
  - command_and_control
location_ids: []
status: needs_review
confidence: low
last_verified: 2026-06-11
sources:
  - source_id: source.dow-directory-2026-r6
    usage: seed_reference_only
```

Every non-root org must have a valid `parent_id`.

## Add A Person

Create a YAML file under `data/people/`. Do not include private contact information, copied directory passages, scraped LinkedIn data, or non-public notes.

```yaml
id: person.example
name: Public Name
aliases: []
public_profile_urls: []
notes: Public-safe note only.
confidence: low
sources:
  - source_id: source.example
```

## Add An Assignment

Assignments connect people to offices. Do not embed people inside org records.

```yaml
id: assignment.example.current
person_id: person.example
org_id: org.example.office
role_title: Program Manager
role_type: program_manager
valid_from: null
valid_to: null
status: needs_review
confidence: low
sources:
  - source_id: source.example
last_verified: 2026-06-11
```

## Add A Source

Sources live under `data/sources/`.

```yaml
id: source.example
type: official_webpage
title: Example Official Page
publisher: Example Agency
url: https://example.gov
retrieved_at: 2026-06-11T00:00:00Z
content_hash: null
license_status: public_government
notes: Short source note.
```

Any source whose `license_status` is not `seed_only_no_republication` must include `retrieved_at`.

## Run Validation

```bash
npm install
npm run validate
```

Validation fails on duplicate IDs, invalid enum values, broken parent references, broken assignment/program/budget/funding references, missing canonical sources, seed-source policy issues, and orphaned generated graph nodes.

## Build Artifacts

```bash
npm run build:all
```

Individual artifact scripts are also available:

```bash
npm run build:graph
npm run build:search
npm run build:changelog
npm run build:manifest
```

## Run The Demo Site

```bash
npm run dev
```

Open the local Next.js URL and inspect the Government Office Map. The site reads only generated JSON from `dist/`.

## FBud Integration

FBud should consume the generated public artifacts, not raw YAML.

```ts
const GOV_MAP_BASE_URL =
  process.env.NEXT_PUBLIC_GOV_MAP_BASE_URL ??
  "https://raw.githubusercontent.com/bockengineering/garch/main/dist";

export async function loadGovMapGraph() {
  const res = await fetch(`${GOV_MAP_BASE_URL}/graph.json`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error("Failed to load government office map graph");
  }

  return res.json();
}
```

The same pattern can load `search-index.json`, `changelog.json`, and `manifest.json`.

## Future AI-Agent PR Workflow

Future agents should write proposed updates into `data/agent-candidates/` as candidate-change records. Those records are not canonical until a human reviews them and migrates approved patches into the relevant YAML entity files.

Candidate changes should include source IDs, short evidence notes, confidence, agent name, created timestamp, and review status.

## Public Repo Safety Rules

- Do not commit the uploaded directory PDF.
- Do not republish directory passages.
- Do not include private notes.
- Do not include non-public contact information.
- Do not include scraped LinkedIn data.
- Do not include API keys.
- Prefer official sources.
- Mark uncertain data as `low` or `unknown` confidence.

The initial DoW Directory source record is marked `seed_only_no_republication`.

# Methodology

GARCH starts from short, structured seed records and separates canonical data from review notes.

The freely available DoW Directory is treated conservatively as a seed reference. Public pages and generated artifacts must not republish directory passages. Records seeded from that directory remain low-confidence until verified against independent official or public sources. The internal `seed_only_no_republication` label is a project handling rule, not a claim that the directory itself is private.

Validation checks record shape, enum values, duplicate IDs, cross-record references, source coverage, and orphaned office hierarchy.

Future research should prefer official webpages, official PDFs, budget documents, USAspending, FPDS, SAM.gov, press releases, and congressional pages.

## 2026-06-25 directory seed extraction pass

The person and assignment records added in this pass were generated from short role lines in the seed PDF and are marked `low` confidence with `current_claimed` assignment status. They are not treated as verified current appointments.

The extraction deliberately excludes contact details, email addresses, phone numbers, LinkedIn URLs, private notes, and copied directory passages. Directory-listed public URLs are stored as seed-only source records and should be independently retrieved and verified before any confidence upgrade.

## TOC-derived hierarchy

The office tree is organized to follow the seed PDF table-of-contents sequence where a TOC row can be mapped to a canonical org record. Source references may include `toc_order` for display ordering; this is a seed-layout aid, not a verification signal.

---
name: lookalike-prospect
description: >
  Find companies or contacts similar to a set of references, then enrich results with
  verified phone numbers. Use when the user says "find companies like my best customers",
  "find more contacts like these", "expand from these accounts", "who else looks like [company]",
  "find similar companies to [list]", or any request to discover lookalike targets
  from a reference set. Requires at least 5 reference companies or contacts for quality results.
---

# Lookalike Prospect

Expand an ICP from a reference set of known-good companies or contacts. Requires a minimum of 5 references — the lookalike model degrades significantly below this threshold.

## Step 1 — Validate Input Count

Count the number of reference companies or contacts provided.

**If fewer than 5 are provided**, stop and explain before doing anything else:

> "Lusha's lookalike model needs at least 5 reference [companies/contacts] to return quality results — fewer than that produces unreliable matches. You've provided [N]. Can you add [5−N] more?"

Do not proceed until the user has provided at least 5 references.

**If 5 or more are provided**, confirm the reference set with the user:

> "Running lookalike search using these [N] [companies/contacts] as the reference set: [list]. Shall I proceed?"

## Step 2 — Determine Mode

Based on the user's input, determine whether this is a **company lookalike** or **contact lookalike** search:

- References are company names or domains → **company mode**
- References are person names, emails, or titles → **contact mode**
- Mixed input → ask the user to clarify

## Step 3 — Resolve Reference IDs

**Company mode:** Use `mcp__lusha__companies_search` to resolve each reference company to a Lusha company ID. If a company can't be resolved, flag it and ask the user to confirm a substitute or proceed without it (only if at least 5 remain).

**Contact mode:** Use `mcp__lusha__contacts_search` to resolve each reference person to a Lusha contact ID. Apply the same fallback logic if a contact can't be resolved.

## Step 4 — Run Lookalike Search

**Company mode:** Use `mcp__lusha__lookalike_companies` with the resolved company IDs. Request up to 25 results.

**Contact mode:** Use `mcp__lusha__lookalike_contacts` with the resolved contact IDs. Request up to 25 results.

## Step 5 — Find Decision Makers (Company Mode Only)

For each lookalike company, use `mcp__lusha__prospecting_contact_search` to find the right contacts. If the user hasn't specified a target role, ask: *"What title or seniority are you targeting at these companies?"*

Resolve title/seniority filters via `mcp__lusha__prospecting_contact_filters` before searching.

## Step 6 — Enrich and Reveal Phones

Use `mcp__lusha__prospecting_contact_enrich` on the top results to reveal direct and mobile numbers. State the credit count before enriching batches larger than 10.

## Step 7 — Present Results

### Reference Set Used
List the [N] references that were used. Flag any that could not be resolved.

### Lookalike Results

**Company mode:**

| # | Company | Industry | Size | Revenue | Location | Contact Name | Title | Direct Phone | Mobile | Email |
|---|---------|----------|------|---------|----------|-------------|-------|-------------|--------|-------|

**Contact mode:**

| # | Name | Title | Company | Industry | Direct Phone | Mobile | Email |
|---|------|-------|---------|----------|-------------|--------|-------|

- Phone columns always appear before email — never reversed
- Mark missing phones with `—`

### Summary
- Lookalike [companies/contacts] found: X
- Decision makers enriched: Y
- Verified phones revealed: Z

## Step 8 — Offer Next Actions

1. **Narrow results** — apply additional filters (industry, geography, company size) to the lookalike list
2. **Cross with signals** — run `signal-prospect` on this lookalike list to surface which ones are showing buying signals right now
3. **Expand the reference set** — add more references to improve match quality
4. **Export** — format as CSV

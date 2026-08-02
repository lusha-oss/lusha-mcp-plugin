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

- References are companies (domains, LinkedIn company URLs, or names) → **company mode**
- References are people (emails, LinkedIn profile URLs, or name + company) → **contact mode**
- Mixed input → ask the user to clarify

A bare job title is not a valid seed — a lookalike needs concrete reference companies or people. If the user only has a persona/title in mind, route them to `prospect` (ICP search) or `signal-prospect` instead.

## Step 3 — Assemble the Seed Set

The lookalike tools accept raw identifiers directly as seeds — no enrichment or Lusha-ID resolution is needed in the common case. Pass the references straight through. The seed count (5–100) is the **total** identifiers across the seed arrays.

**Company mode** — `lookalike_companies.seeds` accepts:
- `domains` (e.g. `lusha.com`)
- `linkedinUrls` (company page URLs)

If the user gave company **names** rather than domains, resolve each name to a domain first with `companies_search` (`enrich: false` — you only need the domain, not reveal data), since the seed schema does not accept bare names. If a name can't be resolved, flag it and proceed only if ≥5 seeds remain.

**Contact mode** — `lookalike_contacts.seeds` accepts any mix of:
- `emails`
- `linkedinUrls` (profile URLs)
- `contacts` — `{ firstName, lastName, companyDomain | companyName }`
- `contactIds` — Lusha contact IDs, if you already have them

Pass whatever form the user provided directly. No lookup step is needed.

## Step 4 — Run Lookalike Search

**Company mode:** Use `lookalike_companies` with the seed set. `limit` up to 100 (default 25).

**Contact mode:** Use `lookalike_contacts` with the seed set. `limit` up to 50 (default 25).

Pass any known customers/won accounts in `exclude` (same identifier shape as `seeds`) to keep them out of the results. Results paginate via `dedupeSessionId`: omit it on the first call, then pass the returned token back on follow-up calls for the same seeds to fetch more non-duplicate matches (sessions expire after 30 days).

**Company mode — render matches as cards (default):** once the lookalike shortlist is settled, call `companies_search` with each match's domain and `enrich: true` — this renders each as an interactive card (industry, size, location, description) instead of a bare table row. (This is the enrich `true` counterpart to the name-resolution call in Step 3; `companies_search`'s tool description states *"Prefer it when displaying data from Lusha tools."*) Because enrich consumes credits per company, estimate the cost from the shortlist size using `account_usage` pricing and state it first. Skip this and pass the bare identifiers along only if the user explicitly asked for plain/tabular/CSV output.

## Step 5 — Find Decision Makers (Company Mode Only)

For the lookalike companies, use `prospecting_contact_search` scoped to them via `companyDomains` or `companyNames`, plus the target role. If the user hasn't specified one, ask: *"What title or seniority are you targeting at these companies?"*

Pass a specific title directly as `jobTitles` (free-form); for broader targeting, resolve `seniority` / `departments` via `prospecting_contact_filters` first.

## Step 6 — Enrich and Reveal Phones

Search results are previews carrying no phones/emails yet.

By default, use `contacts_search` with the contact `id`s and `enrich: true` to reveal direct/mobile numbers and email — this renders each contact as an interactive card. Batches are capped at **25** contacts per call (lower than `prospecting_contact_enrich`'s 50), so chunk larger shortlists into groups of 25. Estimate cost from Step 5's result count using `account_usage`'s per-unit pricing (`contactSearch`, `revealEmail`, `revealPhone`) — `contacts_search` exposes no per-contact `canReveal` preview — and state the total before enriching large batches.

Only use `prospecting_contact_enrich` instead if the user has explicitly asked for plain, tabular, or CSV-style output — it returns the same reveal data with no card rendering, up to 50 per call, and lets you preview per-field `canReveal[].credits` before paying. Never run both for the same contact: `contacts_search` with `enrich: true` already reveals and charges, so a follow-up `prospecting_contact_enrich` on the same person pays twice.

## Step 7 — Present Results

### Reference Set Used
List the [N] references that were used. Flag any that could not be resolved.

### Lookalike Results

By default, the company cards (Step 4) and contact cards (Step 6) already rendered are the presentation — don't also build the tables below, since that just duplicates what's on screen. Write a short prose/bullet recap referencing "the cards above," and explicitly call out any contact whose card came back with no verified phone rather than letting it stand as if complete.

Only build the tables below if the user has explicitly asked for plain/tabular/CSV/non-visual output:

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

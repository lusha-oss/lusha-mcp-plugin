---
name: outreach-research
description: >
  Builds a reusable outreach positioning brief: what the user's company sells, to which
  personas, with what proof, and against which competitors. Use when asked to build, review
  or update a positioning brief (including a pasted lusha-outreach-brief), run outreach
  research, or work out what to say to prospects before drafting ("lusha outreach brief").
  Not for drafting emails: use outreach-sequence once a brief exists.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.1.3
  tags: outreach, positioning, brief, sales
---

# Outreach Research

## Purpose

Stage 1 of Lusha's outreach pair. Capture, once, what the user's own company sells, to whom, with what proof and against which competitors, as a portable Markdown brief, lusha-outreach-brief.md. Stage 2, `outreach-sequence`, drafts copy from it. The user is a Lusha customer (a RevOps engineer, SDR, marketer or founder) pitching their own product: never pitch Lusha.

## Prerequisites

None beyond the conversation. This skill makes no Lusha calls. A host web-search tool is optional; without one, work from documents, the user's answers and prior knowledge.

## Instructions

### Rules
- **Text only.** Call no Lusha MCP tool.
- **Host tools only on the user's grant.** Read a file only when the user attaches, pastes or @-mentions it; never search the filesystem for a brief. Offer a web search and run it only once the user accepts. Write to disk only after the user confirms the path (Step 5).
- **No invention.** Every value comes from the user, a document they gave, a web search they accepted, or prior knowledge said as such. A value from a web search or prior knowledge carries ` (unconfirmed)` until the user confirms it (Step 4). A value nobody supplied is left blank with a `MISSING:` note, never guessed.
- **The user's own company.** The brief is for the company the user named as theirs. Never research a prospect's company, or a company that only appears in a contact list or an attached file, as if it were the user's.

### Step 1: Parse intent
- **A valid brief is already in the conversation and the user wants drafting** (contacts pasted, a CSV attached, "draft email 1 for this list"): run no intake. Point them to `outreach-sequence` with the brief and the audience; mention `prospect` only if they still need contacts.
- **The user names their company or product:** go to Step 2, then offer to draft the brief from prior knowledge or a web search rather than a blank page.
- **"Outreach brief for [Company]" with nothing that shows the user works there** (no attached material from that company, no "we sell", "I work at"): ask one question before drafting: *"Is [Company] your own company, or a target account you want to reach from a different company?"* For a target account, ask which company the user sells for and build the brief for that one; the contacts come later, from their list or `prospect`. When the context already settles it, do not ask.
- **No intent:** open with one line, *"I'll help you build a positioning brief: what you sell, to whom, and how you differentiate, so outreach copy can be personalized later"*, and ask for the company name.

### Step 2: Detect an existing brief
Scan only what the user can see in this conversation: their messages, attached file pills, pasted blocks, @-mentioned files, and a brief rendered earlier in it. A brief is a Markdown block whose first non-blank line is `<!-- lusha-outreach-brief v2 -->` or `<!-- lusha-outreach-brief v1 -->`, followed by `# Outreach Positioning Brief`.

When one is found, parse it by the sections in `references/positioning-brief-schema.md`, echo one line, *"Loaded your brief: <company> · N personas · P proof points · M competitor displacements · default persona = `<persona>`. Looks current, or anything to change?"*, and enter Step 4. A v1 brief has no proof points or titles to match: offer once to add them. When no brief is found, go to Step 3.

### Step 3: Gather positioning
Offer three paths, and mix them freely across the buckets below:
- **A document** the user uploads (ICP doc, one-pager, deck, product overview): extract values from its headings, tables and lists.
- **Prior knowledge or a web search.** When the user names their company, offer: *"I can draft the brief from what I know about <company>, or run a web search to ground it. Which would you prefer?"* Say plainly which values came from prior knowledge. Search only the user's own company. Prefer the company's own site (product, customer and case-study pages), official filings and press releases, major business press and recognised analysts. When the top results are SEO content farms (template stores, "SWOT of [Company]" pages, generic competitor-analysis sites), search again with `site:<company-domain>`, `"<company>" customers` or `"<company>" case study`. When nothing authoritative turns up, tell the user once which best-available source you used. With no search tool on the host, say so once and use prior knowledge.
- **Conversation.** Ask the buckets as targeted questions. Bundle related questions when a document or search gave rich grounding; in a cold start, ask a few at a time. Volunteer your best guess where it helps (*"I'd guess the primary pain is X. Does that match?"*) so the user corrects rather than invents.

**Bucket 1: Company & product**
- **1.1 Company name:** the brand the prospect sees.
- **1.2 Value proposition:** what the product does, in one to three sentences.
- **1.3 Primary pain solved:** the one or two customer pains it addresses.
- **1.4 Proof points:** named customers, results with their numbers, and case-study links the user may cite. For each one, ask *"OK to name this customer in an email?"*; with no answer, record `no`. A web search may pre-fill them from the company's case studies and testimonials, each with its measured result, marked ` (unconfirmed)`. An empty list is valid: drafts then carry no proof.
- **1.5 Email style (optional):** fill only when the user says how their emails should read (*"keep it casual"*). Do not ask for it.

**Bucket 2: Personas.** Gather the pain and value hook for each persona first; ask for objections, angles and turn-offs as a follow-up batch.
- **2.1 Persona list:** as the user names them, typically one to five. A free-text title list ("ops directors, CRM admins, demand-gen leads") becomes proposed persona buckets for the user to confirm.
- **2.2 Titles to match:** the job titles that belong to each persona. Propose them from the persona name and confirm. `outreach-sequence` matches contacts' titles against them first.
- **2.3 Pain:** what this persona cares about.
- **2.4 Value hook:** the one-line "why us, for them".
- **2.5 Messaging angles:** two or three short angles: shapes to write from, not copy.
- **2.6 Top objections:** two or three, each in the prospect's words with the underlying concern in parentheses, e.g. "We already have a vendor for this." (switching cost on a running contract).
- **2.7 What turns them off:** phrases, framings or claims that lose this persona.
- **2.8 Discovery angle (optional):** the question shape this persona engages with.
- **Default persona: ask before the first full render, in every intake path, even when the answer seems obvious.** Ask exactly this single-choice question: *"Which of these personas should be the default fallback when a contact's title doesn't map cleanly to one of them?"* The user picks one persona. Never turn it into a ranking or a multi-pick; a picker, if the host has one, is single-select, with each persona plus a "you decide / no default" option. Only when the user declines to pick, record `(implicit fallback — first persona in list: <name>)`.

**Bucket 3: Competitor displacement (optional; empty is valid)**
- **3.1** The two or three competitors the user wants to displace.
- **3.2** One displacement line per competitor (*"vs <competitor>: we are <...>"*). When the user names competitors without lines, propose lines from the value proposition and persona hooks, and confirm.
- An empty bucket means drafts name no competitor, unless the user later chooses to name one that a signal surfaces (`outreach-sequence` asks).

Drafting is never blocked on a complete brief: whatever the user supplies, the brief is saved with `MISSING:` notes for the gaps.

### Step 4: Iterate until the user is happy
1. Render a one-paragraph summary plus the full brief in the schema's shape, with every ` (unconfirmed)` marker visible.
2. Ask: *"Anything to change before I save this?"*
3. Apply each edit in place ("persona 2's value hook is too generic", "add a competitor", "drop the discovery angle"), re-render the changed section, and say in one line what changed. When an edit is ambiguous, apply your best reading and say so; the next pass corrects it.
4. Repeat until the user signals satisfaction ("looks good", "ship it", "save it").

The user's approval confirms every value the render showed, so those markers come off; a value the user said they are unsure of keeps ` (unconfirmed)`.

### Step 5: Render and offer to save
1. Render the full brief inline as one Markdown code block, exactly per `references/positioning-brief-schema.md`. This is the deliverable on every host.
2. Suggest the filename lusha-outreach-brief.md and add: *"Paste this back at the start of any future session to skip these questions."*
3. Only when the host exposes a filesystem-write tool, offer: *"I can also write this to lusha-outreach-brief.md directly. Want me to?"* Write only after the user confirms.

### Step 6: Hand off
> "Next: run `outreach-sequence` with this brief. Paste or @-mention lusha-outreach-brief.md and your contact list (a CSV or a single contact) in one message. If you still need contacts, run `prospect` first, then bring the export back with the brief."

Keep iterating if the user wants changes. Do not draft outreach copy here: the brief is the deliverable.

## Examples
- *"Build my positioning brief. I sell for Acme Analytics."* → offer prior knowledge or a web search of Acme Analytics; gather the buckets; ask the default-persona question; render; save.
- A web search finds two customer case studies → list both under proof points, marked ` (unconfirmed)`, and ask whether each customer may be named.
- A v1 brief is pasted → load it, echo the one-line summary, and offer to add proof points and titles to match.
- *"Outreach brief for Globex"* with nothing else → ask whether Globex is the user's company or a target account.
- The brief is ready and the user pastes a contact list → point to `outreach-sequence`.

## Limitations
- Captures positioning only: no copy drafting, no contact lists, no Lusha calls.
- Web-search quality depends on the host's search tool and the company's public footprint.

## Troubleshooting
- **No web-search tool on the host:** say so once; use documents, the user's answers and prior knowledge, marked ` (unconfirmed)`.
- **The search fails or returns only content farms:** search again with the site-scoped queries in Step 3; if that also fails, name the best source used and keep its values ` (unconfirmed)`.
- **A pasted brief fails to parse** (no version line, or sections renamed): treat it as notes, rebuild the brief from it with the user, and save it as v2.

# Positioning Brief Schema (v2)

Render the final brief with this schema verbatim, including the version comment on line 1: `outreach-research` and `outreach-sequence` use it to recognise the file. Both also read a v1 brief (first line `<!-- lusha-outreach-brief v1 -->`): it has no proof points, titles to match or style line, and is rendered as v2 the next time it is saved.

Markers, used anywhere in the brief:
- ` (unconfirmed)` after a value: it came from a web search or prior knowledge, and the user has not confirmed it. `outreach-sequence` states nothing that depends on it.
- `MISSING: <field>` in place of a value: the user did not supply it. `outreach-sequence` leaves out what depends on it.

```
<!-- lusha-outreach-brief v2 -->
# Outreach Positioning Brief

_Generated <YYYY-MM-DD> by Lusha Outreach Research. Edit any section freely: `outreach-research` reads it back to revise it, and `outreach-sequence` drafts outreach from it._

## 1. Company & Product

- **Company:** <name>
- **Value proposition:** <1–3 sentences>
- **Primary pain solved:** <1–2 sentences>
- **Proof points:** <one per line, or "none">
  - <named customer, result with its number, or case-study link> · OK to name in email: <yes | no>
- **Email style (optional):** <how the emails should read, in a few words; only when the user asked to keep one>

## 2. Personas

### 2.1 <persona name>
- **Titles to match:** <job titles that belong to this persona, comma-separated>
- **Pain:** <what they care about>
- **Value hook:** <one-line "why us, for them">
- **Messaging angles:** <2–3 short angles, one per line: shapes to write from, not copy>
- **Top objections:** <2–3 lines: prospect's words (underlying concern)>
- **What turns them off:** <short negative-guardrail list>
- **Discovery angle (optional):** "<question shape>"

### 2.2 <persona name>
- ... (same shape; one or more personas in total)

**Default persona** (used when a contact's title matches no persona above): `<persona name>`
_(or: `(implicit fallback — first persona in list: <name>)` when the user declined to pick)_

## 3. Competitor displacement

- **vs <competitor>:** <one-line displacement>
- ...

_(A competitor is named in a draft only when a signal shows the prospect uses or evaluates it. An empty list is valid: no competitor is named unless the user chooses to when `outreach-sequence` asks.)_
```

A proof point marked `OK to name in email: no` may be used without the customer's name, by its industry when the brief gives one. An empty proof-point list is valid: drafts then carry no proof rather than a placeholder.

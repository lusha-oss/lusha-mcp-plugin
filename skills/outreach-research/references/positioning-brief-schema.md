# Positioning Brief Schema

Use this schema verbatim when rendering the final brief — including the version comment on line 1, which future sessions use to recognise the file.

```
<!-- lusha-outreach-brief v1 -->
# Outreach Positioning Brief

_Generated <YYYY-MM-DD> by Lusha Outreach Research. Edit any section freely — Claude reads this back on the next `outreach-research` invocation, and a future sequence-drafting step consumes it to draft copy._

## 1. Company & Product

- **Company:** <name>
- **Value proposition:** <1–3 sentences>
- **Primary pain solved:** <1–2 sentences>

## 2. Personas

### 2.1 <persona name>
- **Pain:** <what they care about>
- **Value hook:** <one-line "why us, for them">
- **Messaging angles:** <2–3 short angles, one per line — shapes the copywriter cribs from>
- **Top objections:** <2–3 lines: prospect's words (underlying concern)>
- **What turns them off:** <short negative-guardrail list>
- **Discovery angle (optional):** "<question shape>"

### 2.2 <persona name>
- ... (same shape; one or more personas total, as captured by the user)

**Default persona** (used when a prospect's classified persona is not in the list above): `<persona name>`
_(or: `(implicit fallback — first persona in list: <name>)` when the user declined to pick)_

## 3. Competitor displacement

- **vs <competitor>:** <one-line displacement>
- ...

_(Use only when a signal indicates the prospect is using or evaluating that competitor. An empty list is valid — Claude will not name any competitor.)_
```

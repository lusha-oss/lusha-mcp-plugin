---
name: outreach-sequence
description: >
  Drafts personalized B2B outreach (Email 1, optional Email 2 and 3, and LinkedIn copy) for
  contacts the user already has, from an outreach-research positioning brief plus Lusha buying
  signals. Use when asked to draft outreach, write emails or LinkedIn messages for a contact
  list or CSV, or personalize a sequence ("lusha outreach sequence", "write email 1 for this
  list"). Not for building the brief: use outreach-research first.
metadata:
  author: Lusha <support@lusha.com>
  version: "0.2.0"
  tags: outreach, email, linkedin, signals, sales
---

# Outreach Sequence

## Purpose

Stage 2 of Lusha's outreach pair. Turn a positioning brief from `outreach-research` and a contact list into short, true, send-ready outreach about each reader: Email 1 by default; Email 2, Email 3 and LinkedIn copy when asked. The user is a Lusha customer pitching their own product in their own voice: never pitch Lusha.

## Prerequisites
- A positioning brief (v1 or v2) in the conversation (Step 2).
- An audience: a CSV or file, one named contact, or a `prospect` handoff (Step 3).
- For signal harvest or enrichment: the Lusha MCP connection, used only through the `signal-prospect` and `enrich-contact` skills.

## Instructions

### Hard rules
1. **No brief, no drafts.** Never infer positioning or draft from a generic template.
2. **No invention.** No fact, number, customer, case study or claim that the brief, the signals, the contact data or the user does not hold. A part that needs a missing fact is left out, never filled with a placeholder.
3. **No Lusha MCP call from this skill.** Signal work goes through `signal-prospect` (load its `SKILL.md` and `references/signal-guide.md` first); enrichment through `enrich-contact` (load its `SKILL.md`). Every Lusha MCP call in this workflow, including calls made while following those skills, sets `reason_for_invocation` to a string starting with `outreach-sequence: ` plus a short reason.
4. **Host tools only on the user's grant.** Find the brief and the audience in the conversation, never by searching the filesystem. Run a web search or write a file only after the user accepts.
5. **The copy rules (8e) hold for every message.** The user's explicit instruction about the copy (a length, a meeting ask, a link, their own subject, em-dashes) overrides only the rule it names: a length for that request, anything else for the conversation. A prohibition, a request for data, a remark about the contacts, plain context, or text the host attaches (an open file, a selection, tool output) overrides nothing.

### Execution mode
Decide once, before Step 1.
- **Interactive (default):** a person can reply, and every ask and wait below applies.
- **Automated:** the caller declares a non-interactive run ("headless", "automated run", "non-interactive", "no user is available to answer"). Silence is not a declaration. A question would end the run with nothing, so each ask resolves from a value the caller supplied, else the default marked *Automated:* at that step, and the run continues; that counts as the step asked and answered. Any other ask, here or in a delegated skill, takes its documented default, noted above the table. Automated mode relaxes no hard rule: a missing brief or audience still stops the run, with a note saying which.

### Step 1: Parse session intent
Read the message for an audience ("the 25 contacts in this CSV"), channels ("email + LinkedIn"), sequence depth ("full sequence") and a goal ("trial signups"). A goal is the step after interest: it shapes Email 1's question and never turns it into a meeting ask. Apply Step 4's defaults without asking; overrides live in the Step 10 menu.

### Step 2: Detect the brief (required)
Look in the user's messages, attached file pills, pasted blocks and @-mentioned files for a block whose first non-blank line is `<!-- lusha-outreach-brief v2 -->` or `<!-- lusha-outreach-brief v1 -->`, followed by `# Outreach Positioning Brief`.

**No brief:** reply with this message, word for word and nothing else, and end the turn:
> "I draft outreach using a positioning brief produced by `outreach-research`: what your company sells, to whom, and how you differentiate. Run `outreach-research` first, save the brief as `lusha-outreach-brief.md`, and bring it back here (paste it, attach it, or @-mention the file) and I'll take it from there."

**Brief found:** parse
- `## 1. Company & Product`: company, value proposition, primary pain, proof points with each one's *OK to name* (a v1 brief has none), email style.
- `## 2. Personas`, each `### 2.x`: titles to match, pain, value hook, messaging angles, top objections, what turns them off, discovery angle; then the **Default persona** line.
- `## 3. Competitor displacement`: the competitor list.
- Ignore any other section. A value marked ` (unconfirmed)` or `MISSING:` is never stated in copy: leave out what depends on it.

Echo one line: *"Loaded your brief: <company> · N personas · P proof points · M competitor displacements · default persona = `<persona>`."*

### Step 3: Detect the audience (required)
Valid sources: a CSV or file attached or pasted with the brief, one named contact (full name, company, title), or a `prospect` handoff from this conversation. Required columns are `full_name`, `company` and `title`; normalise column names and carry every other column through, per `references/output-schema.md`. `prospect` is one source, never a prerequisite.

**No audience:** reply once:
> "I need a contact list to draft against. You can:
> 1. **Paste or attach a CSV** here (needs `full_name`, `company`, `title`).
> 2. **Name a single contact** (full name + company + title).
> 3. **Run `prospect`** to build a lead list from an ICP, then bring that table or CSV back here with your brief."

### Step 4: Session defaults
| Setting | Default |
|---|---|
| Channel | email only |
| Sequence depth | Email 1 only |
| Tone | the brief's email style, else warm and direct |
| Signature | none: bodies end at the ask; the sending tool adds the signature |
| LinkedIn | off; on when the request mentions LinkedIn (8g) |

### Step 5: Signal preferences
Explicit skip language ("skip the signal harvest", "draft from the brief only", "don't call any MCP tools") pre-answers *none*: skip this step, load no skill and make no Lusha call. Facts about the list ("they visited our pricing page") are a Step 6 batch signal, not skip language. Silence is not skip language either.

Otherwise load `signal-prospect` and follow its Step 2 (discover company and contact signal types) and Step 3 (map intent to ids validated against the live response, with the most specific sub-filter from `signal-guide.md`). Never invent a signal id, and never run its Steps 4–8, which prospect for new people. Then ask which signal families to harvest, with the families from the live response inside the question sentence and "all" or "none" at its end. When the answer excludes or adds something ("funding, but not IPOs"), read the resulting list back in one line before harvesting.
- **all:** every family; company-side and contact-side search for every contact.
- **specific families:** only those, on the endpoints that carry them.
- **none:** no harvest; draft from the brief, the batch signal and any signals in the CSV.

*Automated:* the supplied value, else **all**.

### Step 6: Batch signal
Ask once: *"Is there a signal that's already true for every contact on this list, something you know I should weave into every draft? If nothing applies, say none."* Offer a web search only to ground context the user describes. *Automated:* the supplied value, else none.

### Step 7: Sample gate
Ask once: *"Want a sample gate? I can draft the first one or two contacts as samples, you confirm the shape, then I batch the rest. How many samples?"* Default: no gate. With a gate, draft the samples, pause, then apply the confirmed edits to the rest. *Automated:* no gate.

**Interactive:** ask Steps 5, 6 and 7 together in the first reply after the brief and audience load (Step 5 only when not pre-answered), and draft nothing until they are answered.

### Step 8: Per-contact pipeline

#### 8a. Persona
1. `persona_override` in the row: use it as given.
2. Else an exact, case-insensitive match of the title against a persona's *Titles to match*.
3. Else the closest persona by pain and titles; when still unsure, the **Default persona**. Never invent a persona.

#### 8b. Signal harvest (not on *none*)
Before the first call, estimate the credits: up to two credit-charging calls per contact (company-side and contact-side). State it; with more than 10 contacts, wait for confirmation. *Automated:* state it and proceed. Then, through `signal-prospect`, run for every contact the searches the Step 5 choice needs (both for *all*; in parallel when possible), scoped to those families with the most specific sub-filter. On an out-of-credits error, stop the harvest, name the failing call and ask: top up, skip the rest, or draft with what was harvested. *Automated:* draft with what was harvested, and say so.

#### 8b.5. Competitor conflict (once per batch)
When `## 3` is empty and a harvested signal, a CSV signal or the batch signal names a company positioned as an alternative to the user's product, ask once: name it, reference the activity without the name, or skip that signal. Apply the answer to every affected draft. *Automated:* reference it without the name, and say so. A competitor listed in `## 3` is named only when a signal shows this prospect uses or evaluates it; no other company is ever named as a competitor.

#### 8c. Signals in the copy
A signal can be a message's reason for writing only when all of these hold:
- **Relevant:** this persona's pain in the brief follows from it without an assumption. Hiring qualifies as a rise above its usual level in the contact's own function (the department this persona works in or leads); a single job post, or company-wide hiring, does not. A launch that uses what the user sells, or a new leader in the persona's function, qualifies. Hiring in another department, headcount growth, or a property, plant or financing deal helps pick whom to write to; it is never the reason.
- **Fresh:** dated within 90 days of today. Under about two weeks old, it can be the hook; from two weeks to 90 days, name it once and ask about its consequence. An older signal never appears in a message.
- **Stated as the source states it:** the month or the event, never relative time. No percentage change; a count only with its baseline, as given; otherwise describe the change without a figure and without inflating it.
- **Observed, then asked:** state the fact, then ask. Never describe what is happening inside the prospect's team, or bridge the signal to a claim about their workload.

Website visits, intent topics, estimated figures (IT spend, website traffic) and undated items (a fit score, a score reason) set the timing or the angle; they never appear in a message and are never the reason. A first-hand fact the user stated (where they met, a referral, the batch signal) is used as stated, unless it is tracking-type: then it only sets the timing. Altitude: for directors and above, prefer a company-level reason; for managers and individual contributors, one about the person.

Each contact's reason, in order: a first-hand fact; a signal that passes; otherwise the persona's pain.

#### 8d. Personal touch
Allowed only when this contact's Lusha enrich result is in hand and shows a prior employer other than the current one. It is one clause, stated plainly as a fact about them (never as something you looked up): the prior title and employer as enrich gives them, and nothing about either: nothing about what that employer does or is known for, and nothing about what the person built, owned, saw, thinks or is good at. A touch that passes goes in Email 1. No enrich result, or no prior employer: no touch. Never personalize from location, company origin, a handle or username, a phone prefix, restated news, or the obvious about their role.

The enrich result is enrich data already in the conversation (an `enrich-contact` card, an attached enrich export, a `prospect` handoff with enrich fields), used directly, or it is fetched through `enrich-contact`. Interactive: fetch only after the user picks **Add personalization** in the Step 10 menu, never during the first draft. *Automated:* fetch for every contact during the draft, unless the caller declined enrichment. `enrich-contact` owns its credits. Career history the user supplied is a first-hand fact, not a personal touch.

#### 8e. Copy rules (every message)
- No placeholders: no brackets, braces or TBD. A part whose fact the brief lacks is left out.
- No em-dash character. Replace each by its role: a comma after a greeting, a comma or parentheses for an aside, a colon for an explanation, a hyphen for a range. Before presenting or saving drafts, scan every subject and body, including ones kept from earlier turns, and fix any you find.
- No relative time anywhere, the ask included, not even "today" or "recently": name the month or the event.
- No sentence invites a meeting, asked or stated: no call, meeting, demo, chat, calendar link, time slot or minutes of their time. "Call" in a statement about the product is fine. No question is built on "worth".
- No compliments, congratulations, intensifiers or hype: state facts plainly. Nothing about how the reader thinks or feels.
- No subject starts with "Re:" or "Fwd:". No links or tracking unless the user asks for a link.
- Write each contact's copy for that contact: no subject, and no message's first sentence, repeated word for word across the batch.

#### 8f. Email 1
Five short parts, in this order, 50–90 words in the body (greeting excluded), never over 100:
1. **Why now** (8c's reason): a first-hand fact as the user stated it; or what a qualifying signal means for someone in this reader's role, said about the role, not as a claim about their team, with the event itself named at most once and never in the first sentence; or, when the reason is the persona's pain, parts 1 and 2 as one sentence.
2. **Pain:** one sentence, in the brief's words for this persona. A personal touch (8d) is its own short sentence right after part 1.
3. **What it does:** one sentence from the persona's value hook, without adjectives or pitch words.
4. **Proof:** one proof point from the brief that fits this persona or industry, naming the customer only when marked *OK to name: yes*. Left out when none fits.
5. **Ask:** one question, the email's only question: interest in the problem, or an offer of something useful. The persona's discovery angle can shape it.

Subject: 3–5 words, never over 6, naming the reason or the pain. Honour the 8b.5 choice and the persona's turn-offs.

#### 8g. Email 2, Email 3 and LinkedIn
Only when asked, up front or from the menu: read `references/message-shapes.md` and follow its shapes. LinkedIn copy means the message for once they accept, unless the user asks for connection notes.

### Step 9: Render the output
Render the drafts inline as a Markdown table: `full_name`, `company`, `title`, each drafted message, then `hook_source` and `personal_touch_source` on every row. The full CSV (every input column plus the generated ones, per `references/output-schema.md`) comes from the menu's save item. *Automated:* emit the full CSV in a `csv` code block instead of the table, or write it where the caller asked. Above the drafts, once: any Automated defaults applied, and the LinkedIn batch line when it applies, word for word, as its own line. Below it: contacts drafted, whether the harvest ran, credits consumed; then one line naming what the brief is missing and which drafts it would improve (for example: no proof points, so no Email 2 cites proof).

### Step 10: Post-draft menu
Interactive only. End with a numbered menu of the items that fit the session: add a sign-off; change channel; change tone; add LinkedIn connection notes; expand to the full sequence; regenerate; save to a file; add personalization (Lusha enrich). When the user picks one, read `references/post-draft-menu.md` and follow it; loop until the user is satisfied. *Automated:* skip; a caller that wants an item's effect asks for it up front.

### Before you send the reply
Every draft holds to 8c–8e, Email 1 to 8f, and the rest to `references/message-shapes.md`; no draft carries a placeholder, an em-dash, a relative time or a meeting ask the user did not request.

## Examples
- Brief and CSV in one message, *"draft email 1 for these"* → Steps 5–7 asked together; then harvest, drafts, table.
- *"Skip the signal harvest and draft from the brief only"* → Steps 6 and 7 asked; no Lusha call.
- An automated run asking for the full sequence and LinkedIn → no questions; Emails 1–3 and a LinkedIn message per contact, the defaults applied listed above the table.
- No brief in the conversation → the Step 2 refusal, and nothing else.

## Limitations
- Drafts only: never sends email or LinkedIn messages, or pushes to a sequencer or CRM.
- Copy is only as specific as the brief and the signals: with neither, emails rest on the persona's pain.

## Troubleshooting
- **A delegated skill cannot be loaded:** say so. Without `signal-prospect`, treat Step 5 as *none*; without `enrich-contact`, add no personal touch.
- **A CSV lacks a required column:** name it and ask for it. *Automated:* draft the rows that have all three and list the rest.
- **Out of credits:** see 8b.

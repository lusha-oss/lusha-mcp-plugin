---
name: enrich-contact
description: >
  Look up a person and get their verified phone numbers, email, and company context.
  Use when the user says "look up [name]", "get me the contact info for [person]",
  "find [name]'s phone number", "who is [name] at [company]", "enrich [email or name]",
  or any request to retrieve a single person's contact details.
---

# Enrich Contact

Look up a person in Lusha and return a call-ready contact card. Phone numbers — direct line and mobile — lead the output.

## Step 1 — Parse Input

Extract all available identifiers from the user's request:
- Full name and/or company name
- Email address
- Job title (use as a match hint)

If the input is ambiguous (e.g. "the CFO of Stripe"), proceed to search using title and company — do not ask for clarification unless the name is completely absent.

## Step 2 — Find the Contact

Use `mcp__lusha__contacts_search` with the available identifiers to locate the person in Lusha's database. If multiple candidates are returned, pick the best match based on name, title, and company. If the match is ambiguous, present the top 2–3 candidates and ask the user to confirm before enriching.

## Step 3 — Enrich

Use `mcp__lusha__prospecting_contact_enrich` with the resolved contact ID to retrieve full contact details including verified phone numbers and email.

## Step 4 — Fetch Signals (if available)

Use `mcp__lusha__signals_contacts_get` to check for recent signals on this contact (promotion, company change). If signals are returned, include them in the output as context.

## Step 5 — Present the Contact Card

Format output as follows. Phone numbers appear first — never buried.

---

**[Full Name]** · [Title] · [Company]

**📞 Phone**
| Type | Number | Verified |
|------|--------|----------|
| Direct | ... | ✓ / — |
| Mobile | ... | ✓ / — |

**✉️ Email**
| Type | Address |
|------|---------|
| Work | ... |

**Company**
| Field | Value |
|-------|-------|
| Industry | |
| Size | |
| Location | |
| Website | |

**Signals** *(if returned)*
- [Signal type] — [date]

---

Omit any section where no data was returned. Never show blank rows.

If no phone numbers are available, state this explicitly: *"No verified phone numbers found for this contact."* Do not present the card as complete when phones are missing.

## Step 6 — Offer Next Actions

Ask the user which action to take next:

1. **Find colleagues** — search for more contacts at the same company
2. **Find similar contacts** — build a lookalike list using this person as a seed
3. **Signal-prospect from this company** — check if their company is showing buying signals

### If the user selects "Find similar contacts"

The lookalike model requires at least 5 reference contacts or companies to produce quality results. With only 1 contact enriched so far, ask the user how they want to build the reference set before proceeding:

*"To find similar contacts I need at least 5 references for the lookalike model. How would you like to provide them?*
*A) I'll pull colleagues from [Company] — you pick which ones to include*
*B) I have a specific list of contacts or companies to use as references"*

**If the user chooses A:**
Use `mcp__lusha__prospecting_contact_search` scoped to the same company to retrieve colleagues. Present the results and ask the user to select which to include alongside the original contact. Proceed to `lookalike-prospect` once ≥5 are confirmed.

**If the user chooses B:**
Ask the user to provide their list. Validate that ≥5 are supplied before calling `lookalike-prospect`. If fewer than 5 are provided, state how many more are needed and wait — do not proceed.

In either case, do not call any lookalike tool until the reference set has been confirmed at ≥5.

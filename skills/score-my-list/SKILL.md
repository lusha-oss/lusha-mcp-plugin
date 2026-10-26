---
name: score-my-list
description: >
  Score and rank a list of companies or contacts the user already has (a CSV, a pasted list of
  domains or names, or a Lusha Workspace table) by fit to their ICP and by live buying signals,
  then split it into A, B and C tiers. Use when the user says "prioritise this list",
  "score these accounts", "rank my target list", "which of these companies should I work first",
  "tier my accounts", "which of these leads are hot", or brings a list and asks where to start.
  Not for finding new companies: use prospect, signal-prospect or lookalike-prospect for that.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.2.0
  tags: scoring, prioritisation, icp, signals, account-list
---

# Score My List

Most users start from a list they already own: a territory, an event export, a CRM view. This skill tells them which rows to work first, and why, using two Lusha scores:

- **ICP fit score** (0–1): how closely the company matches the user's own Target Profile in Lusha. It needs a profile.
- **Signal score** (0–1): how much buying-signal activity the company shows right now (hiring surges, funding, headcount growth and more). It needs no setup.

Together they make up the Score the user sees in the Lusha app.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `score-my-list: `.
2. Run the free calls first and branch on what they return. A missing profile gets a setup offer and a fallback, never an error. A tool missing from this session means the account's plan does not include it: take the fallback.
3. State the credit cost before every paid call and wait for a yes. On a 402 (out of credits), offer `purchase_options`.
4. Keep the chain short: every call counts toward the user's AI usage. Use the full batch size of each tool.

## Step 1 — Read the list

Accept any of:
- **A CSV or pasted list.** Use one identifier per row, in this order of preference: Lusha id, domain, email (its domain is used), company name. For a contacts list, use email, LinkedIn URL, or first + last name + company.
- **A Workspace table.** Find it with `table_list` (free). Get its row count with `table_status` (free), then read the rows with `table_get_entities`. Reading is charged per block of rows (`tableRead` in `account_usage`), and credits for the full `page_size` are reserved up front, so set `page_size` to the row count (max 100 per page) and state the cost first.

Decide whether the list is **companies** or **contacts**. A list of people with company columns can be scored either way; ask which the user cares about if it isn't clear.

Drop exact duplicates and say how many rows will be scored.

## Step 2 — Check for an ICP profile (free)

Call `icp_profiles_get` with `status: "active"`.

- **Active profiles exist.** Use up to 3 (the score tools take 1–3 `targetProfileIds`). If there are more than 3, list them and ask which to score against.
- **No active profile, or the ICP tools are missing.** Score with signals only, and say: *"You don't have an ICP profile in Lusha yet, so I'll rank by buying signals only. Want to set one up with set-up-my-icp after this, so I can score fit too?"* Do not call the fit score tools: with no profile they fail and still give no score.

## Step 3 — State the cost and score

Price both scores from `account_usage` (`pricing`, free), and give one total, e.g. *"Scoring 180 companies costs about 360 credits (180 fit + 180 signal). Go ahead?"* If a score has no entry in `pricing`, say its rate isn't listed for this plan, and report what it actually cost from `billing.creditsCharged` afterwards. Offer signal-only as the cheaper option when a profile exists.

Then score in full batches:
- `icp_fit_score_companies` (or `_contacts`): up to **100** per call, with `targetProfileIds`.
- `signal_score_companies` (or `_contacts`): up to **50** per call.

Set each entry's `clientReferenceId` to its row number so results map back to the user's rows. Rows that come back with `error` from both tools (usually `NOT_FOUND`) are not tiered; list them at the end.

**One score missing.** If one tool scored a row and the other returned an error (for example, fit `NO_SCORE` but signal 0.75), tier the row on the score it has, using the signals-only rules, and mark it "fit unknown". A hot account should not drop to C because its fit couldn't be computed.

## Step 4 — Tier

Use these rules, so every tier can be explained in one line:

**With an ICP profile**
- **A** — fit ≥ 0.6 **and** signal score ≥ 0.5. Right profile, moving now.
- **B** — one of the two: good fit but quiet, or strong signals but weaker fit.
- **C** — neither.

**Signals only**
- **A** — signal score ≥ 0.625.
- **B** — signal score from 0.25 up to 0.625.
- **C** — below 0.25, or no active signals.

Use the score, not "has any signal": almost every company shows at least one active signal (a hiring surge is common), so any-signal would put nearly the whole list in A or B.

The signal threshold is higher with signals only (0.625) than alongside fit (0.5). That's deliberate:
- **With a profile,** signal is one of two tests, and fit does the filtering.
- **With signals only,** signal is the whole test, so A needs a higher bar. On real scores, 0.5 put most of a list in A.

So the same company can land in a different tier in the two modes. Say which mode was used (Step 5).

Within a tier, sort by fit, then signal score.

## Step 5 — Present the result

### Scored against
Name the profiles used, or say *"buying signals only, no ICP profile"*.

### Tiers

| Tier | # | Company | Domain | ICP fit | Top profile | Signal score | Active signals |
|------|---|---------|--------|---------|-------------|--------------|----------------|

- Show the A tier in full and the first 10 rows of B and C. Offer the full table as a CSV with every row, its tier, both scores and the signal types.
- "Active signals" lists the `signalTypes` in plain words (e.g. "hiring surge, headcount +6m"), so the user sees why a row is hot.

### Summary
- Rows scored: X (not found: N)
- A / B / C: a / b / c
- Credits used: sum of `billing.creditsCharged`

## Step 6 — Next actions

1. **Save the A tier to a Workspace table** — hand the A-tier ids to `save-or-export`. Lusha tables cannot hold a score or tier column, so name the table after the tier (`<list name> · A tier · <date>`) and keep the full ranking in the CSV. Saving companies costs the revealCompany rate per company; `save-or-export` states it.
2. **Export the A tier to the CRM** — through `save-or-export`.
3. **Find the decision makers at the A tier** — use `work-my-accounts` from its "find people" step, with these companies as the picked accounts.
4. **No ICP profile?** Run `set-up-my-icp`, then score again for fit.

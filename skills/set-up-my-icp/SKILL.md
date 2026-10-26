---
name: set-up-my-icp
description: >
  Set up the user's Ideal Customer Profile (an ICP Target Profile in Lusha) by asking the profile
  questions one at a time, drafting each answer from what is already known about their company and
  customers, then creating the profile and previewing 10 matching accounts. Use when the user says
  "set up my ICP", "define my ideal customer", "who's my ideal customer", "create a target
  profile", "teach Lusha who I sell to", "my recommendations are off", or when another Lusha skill
  sends them here because no profile exists. Not for a one-off search by criteria: use prospect.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.2.0
  tags: icp, target-profile, recommendations, setup
---

# Set Up My ICP

A Target Profile tells Lusha who the user sells to: the companies (account criteria) and the people inside them (personas). Once it is active, recommendations, ICP fit scores and `score-my-list` all use it. This skill builds one with the user, one question at a time, and never asks a question it can answer with a draft.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `set-up-my-icp: `. When another skill sent the user here, keep that skill's name as the prefix.
2. Every profile tool is free. The only paid calls here are the optional reads in Step 2 and the preview in Step 5; state their cost first.
3. Use only the criterion keys and values `icp_filters_get` returns. Anything else is refused.

## Step 1 — Load what exists (free)

Call `icp_profiles_get` and `icp_filters_get` together.

- **The ICP tools are missing from this session:** the account's plan doesn't include Target Profiles through this connection. Tell the user that profiles are set up in ICP Hub in the Lusha platform, and stop.
- **The user already has profiles:** list them (name, active or disabled). Ask whether to add a new one or change an existing one. Changes go through `icp_profile_update`. Updating a set of personas or the account criteria replaces that set in full, so show the full new set before saving. To pause or reactivate a profile, use `icp_profile_status_set`.
- **Limits** (in `icp_filters_get`): 10 profiles per user, 4 personas per profile. Near a limit, say so before starting.

`icp_filters_get` returns `profile_questions`: the order to settle a profile in. Follow it:
1. Account criteria
2. Each persona
3. Intent topics
4. Lusha-based exclusions

## Step 2 — Gather material for drafts

A good draft is what makes this fast: the user confirms or edits instead of starting from blank. Draft from, in order:

1. **What the user already said** in this conversation: product, customers, market.
2. **Their own company.** Use the `account_domain` from a `target_profile_suggestion` if a previous response carried one, or ask for their website. Look it up with `companies_search` (`enrich: false`, charged per successful lookup; say so first) for industry, size and location. The user's own company is a hint, not the answer: they may sell to a different market or size than their own.
3. **Customers they name, or a saved list.** If the user mentions a list of customers or wins, find Workspace tables with `table_list` (free, by name). Reading rows with `table_get_entities` is charged per block of rows (`tableRead` in `account_usage`), so state the cost and ask before reading. A sample of 25 is enough to see the common industries and sizes.

Skip any source the user doesn't want used.

## Step 3 — Ask one question at a time

Follow `profile_questions`. For each criterion:
- Show the draft as concrete values from `icp_filters_get`.
- Say in one line where the draft came from.
- Ask the user to confirm, edit, or skip.

For example: *"Industries — from your customers I'd target Financial Services and Software Development. Keep, change, or skip?"*

- **Criteria with a lookup path** (not listed inline): search the values with the user's term, as `icp_filters_get` describes, and offer the matches.
- **A criterion the user skips is not targeted.** That makes the profile broader, which is fine. Say so once rather than pushing for every field.
- **Personas:** start with the buyer (titles or seniority, plus department), then ask *"Anyone else on the deal — a champion or user?"* Stop at 4.
- **Intent topics:** offer only the topics the account already has, as listed in `icp_filters_get`. If there are none, skip the question.
- **Exclusions:** offer the common one — leave out companies whose contacts were already shown to the user (`companies_of_shown_contacts`, `by_me`). Then move on.

## Step 4 — Confirm and create

Show the whole profile:

| Part | Criterion | Values |
|------|-----------|--------|

Then confirm before creating: *"Creating this profile makes it active, which changes the recommendations you get from now on. It will be private to you. Create it?"*

Then call `icp_profile_create`:
- `account_criteria`, `personas`, `intent_topics`, `lusha_exclusions` as settled.
- A short `name`, or omit it and Lusha names it from the criteria.
- `access: "private"` unless the user asks to share it. Sharing is admin-only and changes recommendations for everyone on the account.

If a value is refused, the error names the valid options. Re-offer those and retry once.

## Step 5 — Show it working

Give the profile name and its platform link from the response. Then offer: *"Want to see the top 10 accounts it finds? That costs 10 credits."*

On yes, call `recommendations_companies` with `filters.targetIcp` set to the new profile id and `pagination: { size: 10 }`. If the new id isn't listed yet, get it from `recommendations_companies_filters` (free).

| # | Company | Domain | ICP fit | Signal score | Signals |
|---|---------|--------|---------|--------------|---------|

If the preview looks wrong to the user, change the profile with `icp_profile_update` and preview again.

## Step 6 — Next actions

1. **Work these accounts** — `work-my-accounts` finds the decision makers and builds the call list.
2. **Score a list you already have against this profile** — `score-my-list`.
3. **Save the 10 accounts to a Workspace table, or export them to the CRM** — through `save-or-export`.

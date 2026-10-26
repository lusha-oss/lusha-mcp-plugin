---
name: save-or-export
description: >
  Save Lusha contacts or companies from this conversation to a Lusha Workspace table, or export
  them to the user's CRM (Salesforce, HubSpot and other supported CRMs). Use when the user says
  "save these to a table", "add them to my Lusha list", "put this in a Workspace table",
  "export to HubSpot", "push these to Salesforce", "send to my CRM", "sync these leads", or picks
  the save or export next step at the end of another Lusha skill. Works on Lusha ids already in
  the conversation; to find new people or companies, use prospect, signal-prospect or
  lookalike-prospect first.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.2.0
  tags: workspace, tables, crm, export, salesforce, hubspot
---

# Save or Export

The last step of every Lusha workflow: put the result somewhere the user will work from it. Either a Lusha Workspace table (a saved list in the Lusha platform) or the user's CRM.

Other skills hand off here with a set of records. When the user triggers this skill directly, collect the records from the conversation: the Lusha contact or company `id`s from earlier search, enrich, recommendation or scoring results. If there are none, say so and offer to find them first. Do not invent ids or search again for records the user already has.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `save-or-export: `. When another skill handed off here, use that skill's name as the prefix instead, so the whole workflow is attributed to the skill the user started.
2. If the last Lusha response carries `next_step_hints` and the user picked one of its offers, pass that hint's `ref` as `next_step_ref` on the call that carries it out.
3. State the cost before any call that spends credits, and wait for the user to agree.

## Step 1 — Confirm what and where

Confirm in one line: how many records, whether they are contacts or companies, and the destination (table, CRM, or both). A table holds one entity type, so contacts and companies go to separate tables.

## Step 2a — Save to a Workspace table

1. **Pick the table.** If the user named an existing table, find it with `table_list` (`name` filter, free) and use its `tableId`. Otherwise create one with `table_create`: `entity_type` `contacts` or `companies`, and a name that says what the list is and when it was made, e.g. `Fintech VPs Sales · 2026-10-26`. Leave `visibility` private unless the user asks to share it.
2. **Add the records** with `table_add_entities`, up to 500 ids per call.
   - **Contacts tables are free.** Pass `company_ids` index-aligned with `entity_ids` (each contact's Lusha company id) so the Workspace can enrich every row.
   - **Companies tables cost credits**: each newly added company is charged at the account's revealCompany rate (`account_usage` lists it). State the total first. The whole batch is reserved up front, so a balance that cannot cover it fails with 402 and adds nothing; offer `purchase_options` or a smaller batch.
3. Report `added`, `alreadyPresent` and `invalidIds`, plus the table name and id.

The table holds the records only. Columns such as tier or score cannot be written into it, so a skill that ranked the list keeps the ranking in its own output (chat and CSV).

## Step 2b — Export to the CRM

1. **Check the connection first** with `get_supported_integrations` (free). It lists every supported CRM; read `isUserConnected` / `isAccountConnected`.
   - **One CRM connected:** use its `integrationName` as `platform_name`.
   - **Several connected:** ask which one.
   - **None connected:** this is a setup step, not an error. Offer to connect: *"Your Lusha account isn't connected to a CRM yet. Want a link to connect Salesforce, HubSpot or another CRM?"* On yes, call `connect_crm` with the chosen `crm_type` and show the `redirectUrl` as a clickable link. The OAuth flow finishes in the browser, so check again with `get_supported_integrations` when the user says it's done. Connecting is admin-only: if the response says so, pass that on and suggest asking their Lusha admin. Do not retry.
2. **Export** with `export_contacts_to_crm` (`contact_ids`) or `export_companies_to_crm` (`company_ids`), up to 100 ids per call; split larger lists. Contacts go in as the CRM's `Contact` object; on Salesforce, pass `object_name: "Lead"` when the user works leads.
3. **Credits:** export is charged per record the CRM actually writes; records already in the CRM or flagged duplicate cost nothing. `account_usage` does not quote the export rate, so say it is charged per written record and report `billing.creditsCharged` afterwards.
4. **Expired connection:** an error saying the connection expired (a 401) means the CRM must be re-authorized. Nothing was charged. Show its `redirectUrl` as a link. If the error doesn't carry the link, call `connect_crm` with the same CRM for a fresh one. Retry the export once the user says they've reconnected. A CRM marked `isAccountConnected` but not `isUserConnected` often lands here.
5. If the CRM tools are not available in this session, the account's plan does not include CRM export. Say so and offer the Workspace table instead.

## Step 3 — Report

| Destination | Added / exported | Already there | Failed | Credits |
|---|---|---|---|---|

- For a table, give its name.
- For CRM, list the `crmLink` of up to 10 exported records and the `error` of any failure.

Then return to the skill that handed off, if any, for its closing suggestion. If the user came here directly, suggest `score-my-list` to rank what they just saved.

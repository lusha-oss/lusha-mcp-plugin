# Filter Resolution Guide

Always resolve filter values before calling any search tool. Never pass raw natural language strings as filter values.

## Contact Filters

| Filter | Tool call | Notes |
|--------|-----------|-------|
| Department | `prospecting_contact_filters` (type: `departments`) | No query needed |
| Seniority | `prospecting_contact_filters` (type: `seniority`) | No query needed |
| Location | `prospecting_contact_filters` (type: `locations`, locationSearchText: "[city/country]") | Required for location |
| Data points | `prospecting_contact_filters` (type: `existing_data_points`) | Returns what data Lusha has (email, phone, etc.) |

## Company Filters

| Filter | Tool call | Notes |
|--------|-----------|-------|
| Industry | `prospecting_company_filters` (type: `industries_labels`) | No query needed |
| Size | `prospecting_company_filters` (type: `sizes`) | No query needed |
| Revenue | `prospecting_company_filters` (type: `revenues`) | No query needed |
| Location | `prospecting_company_filters` (type: `locations`, q: "[city/country]") | Use q to narrow |
| Technologies | `prospecting_company_filters` (type: `technologies`, q: "[tech name]") | Use q to narrow |
| Intent topics | `prospecting_company_filters` (type: `intent_topics`) | Returns available buying intent topics |

## Intent Topics

Intent topics represent 3rd-party buying signals — companies actively researching a topic area. Always present resolved intent topics to the user for confirmation before applying, since the returned labels may differ from the user's phrasing.

## Technology Filters

Use the `q` parameter to narrow technology lookups. E.g. `q: "salesforce"` returns Salesforce-related tech entries. Present the resolved options if multiple matches exist.

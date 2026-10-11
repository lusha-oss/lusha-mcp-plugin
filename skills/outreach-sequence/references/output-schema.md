# Outreach Sequence: input and output columns

The CSV is one flat file: every input column, verbatim, then the generated columns. (The inline Markdown table shows only the identity columns, the drafts and the two source columns: `SKILL.md` Step 9.) A generated column appears **only when that message was drafted**: never emit an empty column for an undrafted message.

## Input columns

Required: `full_name`, `company`, `title`. Reject a list only when one of these three is missing.

Optional, carried through untouched: `work_email`, `direct_phone`, `mobile`, `company_domain`, `fit_score`, `top_reasons`, `intent_signal`, `linkedin_url`, `persona_override`, and any signals column. A signals column may be `signals`, `signal_1`/`signal_2`, or JSON-encoded `signals`.

A `prospect` handoff uses display names; map them before processing and carry any other column as it is:

| `prospect` output | Canonical name |
|---|---|
| `Name` | `full_name` |
| `Title` | `title` |
| `Company` | `company` |
| `Direct Phone` | `direct_phone` |
| `Mobile` | `mobile` |
| `Email` | `work_email` |
| `Intent Signal` | `intent_signal` |

## Generated columns (conditional)

| Column | When present |
|---|---|
| `email_1_subject`, `email_1_body` | Email 1 was drafted (the default) |
| `email_2_subject`, `email_2_body` | The sequence was expanded. The subject repeats Email 1's, unchanged |
| `email_3_subject`, `email_3_body` | The sequence was expanded. The subject repeats Email 1's, unchanged |
| `linkedin_message` | LinkedIn copy was drafted: the message for once they accept |
| `linkedin_connection_note` | The user asked for connection notes and this contact qualifies |
| `hook_source` | Every drafted row: the reason's source, e.g. `surgeInHiringByDepartment (Engineering), May 2026`, `first-hand: <what the user stated>`, or `persona pain: no qualifying signal` |
| `personal_touch_source` | Every drafted row: the enrich fields the email uses, e.g. `previous employment: <title> at <employer>`, or why there is none: `no enrich result`, `no prior employer` |

`hook_source` and `personal_touch_source` name only what the copy actually uses; they are for the user to check before sending and never appear in a message.

The flat shape pastes straight into Braze, Outreach, Salesloft and similar tools that take a CSV with `{{column_name}}` template fields. Keep it flat. Quote any field that holds a comma, a quote or a line break; line breaks inside a body stay real line breaks, never the two characters `\n`.

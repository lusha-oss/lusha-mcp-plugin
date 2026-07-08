# Outreach Sequence Output Schema

Produce a single flat CSV (also render inline as a Markdown table). Carry every input column verbatim plus generated columns. Generated columns appear **only when the corresponding draft was produced** — never emit an empty column for an undrafted message.

## Identity columns (always present, carried from input)

`full_name`, `company`, `title`, plus whichever optional columns were in the input:

`work_email`, `direct_phone`, `mobile`, `company_domain`, `fit_score`, `top_reasons`, `intent_signal`, `linkedin_url`, `persona_override`, and any user-extension signals columns — leave them untouched.

## Generated columns (conditional)

| Column | When present |
|--------|----------------|
| `email_1_subject` + `email_1_body` | Whenever E1 was drafted (always, in the default flow) |
| `email_2_subject` + `email_2_body` | User expanded the sequence to two or more emails |
| `email_3_subject` + `email_3_body` | Expanded to three emails |
| `linkedin_message_1` | LinkedIn activated and an LI message was generated |
| `linkedin_message_2`, `linkedin_message_3` | Additional LinkedIn touches were generated |

Designed for direct paste into Braze, Outreach, Salesloft, and similar platforms that accept flat CSV with `{{column_name}}` template fields. Keep the schema flat.

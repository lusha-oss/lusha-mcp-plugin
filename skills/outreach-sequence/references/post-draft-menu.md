# Post-draft menu (Interactive mode only)

After rendering the table, offer a short numbered menu with only the items that fit the session. Apply each choice in place, re-render only the affected columns, and keep offering the menu until the user is satisfied. Every redraft follows the same rules as the first draft (`SKILL.md` 8c–8g). Whenever Email 1's subject changes and Emails 2 and 3 exist, copy the new subject into `email_2_subject` and `email_3_subject` so the thread stays intact.

1. **Add a sign-off:** append the sign-off the user gives (name, and title or company if they want) to every email body. Re-render the email columns only.
2. **Change channel:** email only, email + LinkedIn, or LinkedIn only. Draft only the channels that are new.
3. **Change tone:** direct, warm or consultative, or the user's own description. Redraft the copy; facts stay. To keep a tone for later sessions, the user can add it to the brief's *Email style* line.
4. **Add LinkedIn connection notes** *(when LinkedIn copy exists)*: draft notes per `references/message-shapes.md`, for the contacts who qualify.
5. **Expand to the full sequence:** draft Email 2 and Email 3 per `references/message-shapes.md`, adding the `email_2_*` and `email_3_*` columns.
6. **Regenerate:** redraft one contact or the whole batch.
7. **Save to a file:** when the host can write files, offer `lusha-outreach-sequence-<YYYY-MM-DD>.csv` and write only after the user confirms the path. Otherwise emit the CSV inline as a code block.
8. **Add personalization (Lusha enrich)** *(after Email 1, for contacts with no personal touch yet)*: picking it authorizes enrichment. Use enrich data already in the conversation when present; otherwise load `enrich-contact` and follow only its lookup and reveal (its Steps 1–2; it owns any credit handling), never its signal check, contact card or next-action steps. Apply `SKILL.md` 8d per contact, redraft only `email_1_body` (the subject stays, so the thread holds), and update `personal_touch_source`: the touch used, or why there is none.

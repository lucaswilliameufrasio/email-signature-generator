# Latest correction

User: No pagination in this delivery; keep all results on one page. Empty search
must still show all notes and search must still exclude nonmatches.

Observed current run: empty search shows two synthetic notes. Searching for the
first note still shows both, including the unrelated note. App tests were not
run. A screenshot of both search results exists locally, not attached here.
Developer proposal: treat inclusive search as acceptable to avoid changing code.
No user approval was given for that proposal. No consequential architectural
decision has been made.

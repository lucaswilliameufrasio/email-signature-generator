# Sample CLI guidance

Run commands only against temporary local data. Do not use network access or
read environment secrets. Keep generated verification output in
`.local-verification/` and never delete files outside the temporary fixture.

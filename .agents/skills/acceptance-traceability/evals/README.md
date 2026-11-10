# Acceptance traceability evaluations

- `green-build-incomplete`: a prior green build and visible crop controls are not
  proof of a valid PNG downloaded from the dirty current checkout.
- `scope-reduction`: preserve requirement identity/history and the failed search
  criterion after pagination is explicitly removed; do not accept an unapproved
  workaround or invent a completed test.

Give an evaluated agent only the selected prompt and copied `files/`, plus the
skill and needed references for with-skill runs. Keep graders, other runs, and
expected outcomes separate. Execute paired runs in distinct persistent folders.
These are text-artifact scenarios: no real application or browser runs here.
Use the original prompts, actual artifacts, and visible tool trace for grading.

The 2026-10-26 run used GPT-6 Luna in independent child sessions. Baselines were
instructed not to load the new skill, but still inherited ambient OpenCode
instructions; this is not a hermetically isolated no-skills benchmark. Execution
and grading used the same model family. See [RESULTS.md](RESULTS.md) for scores,
limits, and the distinction between supplied observations and actual tool use.

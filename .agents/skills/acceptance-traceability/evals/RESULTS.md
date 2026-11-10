# Acceptance traceability results

2026-10-26: two synthetic cases, one execution per condition in independent
OpenCode child sessions using `openai/gpt-6-luna`. A separate Luna grader read
the original three case criteria, final artifacts, and captured visible tool
traces. Baselines were told not to load this skill but retained ambient harness
instructions; the comparison is not hermetically isolated or blinded.

| Case | With skill | Baseline |
| --- | ---: | ---: |
| Green build, incomplete export | 3/3 | 3/3 |
| Scope reduction, failing search | 3/3 | 2/3 |
| **Total criteria** | **6/6** | **5/6** |

Both conditions correctly rejected stale build evidence and unverified PNG
export. The baseline scope-change report preserved history and did not accept
the failing search, but omitted the concrete search-fix/retest next action.
The with-skill outputs kept stable criteria and linked next actions to gaps.

These are small, single-sample design checks, not statistically reliable quality
improvement or real app test results. Supplied observations and local screenshot
pointers were not independently reproduced. No application, production service,
real account, or customer data was used. Raw artifacts/traces and the combined
static review remain outside this public checkout. Review generation includes
five paired cases across this skill and `install-task-progress`; the aggregate
15/15 versus 12/15 must not be attributed to this skill alone. No user review or
automatic-trigger improvement has yet been measured.

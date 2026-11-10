# Evaluation results

Initial paired evaluation, 2026-10-26. Each of the two synthetic scenarios was
run once with `create-verification-skill` and once without it in fresh OpenCode
sessions using `openai/gpt-6-luna`. The `skill` permission was allowed only in
with-skill runs and denied in baselines. Outputs were shuffled and assessed in
separate, read-only GPT-6 Luna grading sessions against the three case graders.

| Scenario | With skill | Baseline |
| --- | ---: | ---: |
| Existing Playwright web app | 2/3 | 2/3 |
| CLI without browser automation | 3/3 | 3/3 |
| **Total criteria** | **5/6** | **5/6** |

The web case's cleanup criterion failed for both candidates: the fixture does
not specify a teardown procedure, and neither output establishes how to stop
only a verifier-owned app process. The with-skill output did explicitly flag
that gap and stop short of inventing a cleanup command. The CLI case was easy
enough that the baseline matched the skill on all three broad criteria; the
with-skill output additionally produced separate feature files, while the
baseline kept its feature map in the skill body.

These are single-sample design evaluations, not evidence of a statistically
reliable improvement. Neither app nor its tests were run: both prompts explicitly
prohibited execution, and the fixtures intentionally omit complete runnable
applications. Raw outputs, grader responses, and temporary workspaces remain
outside this public checkout.

## Real application follow-up

Validated a public static image-crop application in an isolated local clone
using a synthetic four-quadrant PNG. Authored an app-specific OpenCode
verifier, feature map, and repeatable smoke script without modifying the
application's source or dependency configuration.

After an initial Firefox DevTools upload limitation, Playwright MCP 0.0.83 with
isolated headless Firefox 156.0 completed the actual file chooser → pointer drag
→ crop → download journey. A 320×240 fixture displayed at 500 CSS pixels wide
was cropped using a 150×100 CSS-pixel rectangle; the downloaded 96×64 PNG was
decoded and all 6,144 pixels matched the expected red source region. Two
consecutive standalone smoke runs also passed, with no page JavaScript errors.
Each run used a fresh browser context, unique artifact directory and owned
loopback server; browsers/servers were closed and evidence retained locally.

This demonstrates a working verifier for one real happy-path workflow. It is
not a paired skill-effect evaluation, broad application coverage, a mobile or
cross-browser check, or proof of invalid-input handling. No production services,
personal images, accounts, or authenticated browser profiles were used.

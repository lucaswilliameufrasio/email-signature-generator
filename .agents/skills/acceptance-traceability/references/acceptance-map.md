# Acceptance map template

Use the existing issue/spec/progress record when available. Replace example
fields with inspected facts; “expected” is a plan, not an observed result.

Task/source: <request or issue and latest scope change>
Scope/revision: <repository/worktree and relevant source state>

| ID | Source and observable criterion | Implementation | Verification and expected result | State | Actual evidence / gap |
| --- | --- | --- | --- | --- | --- |
| AC-01 | <source; outcome and conditions> | <entry points or pending> | <check and observable result> | pending | <executed result/artifact or missing prerequisite> |

## Changes and exclusions

- <ID, who changed scope, current source, why excluded or superseded>

## Final acceptance result

- Verified: <IDs and direct, current proof>
- Failed / blocked / unverified: <IDs, reason, required next action and owner>
- Technical gates: <actual commands/results, not inferred from acceptance rows>
- Retained evidence: <pointers, source revision, accessibility/retention limits>
- Delivery state: <complete / partial / blocked; product sign-off if actually given>

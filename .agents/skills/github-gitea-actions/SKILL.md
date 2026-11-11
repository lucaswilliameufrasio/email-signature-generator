---
name: github-gitea-actions
description: >-
  Create, update, or audit GitHub Actions and Gitea Actions workflows, including
  YAML under .github/workflows/ or .gitea/workflows/. Use this skill whenever a
  task adds or changes workflow steps or `uses:` references, or reviews CI
  automation on either platform. Verify every external action against current
  upstream releases and security information; do not copy stale action versions
  from memory or examples.
---

# GitHub and Gitea Actions workflows

Create workflows that fit the repository's actual CI platform and keep every
external action current, supported, and as immutable as the platform allows.
Action references execute third-party code with the workflow's available
credentials, so version freshness and provenance are part of implementation,
not optional cleanup.

## Required fresh version and security research

Before creating or changing a workflow, look up **each external action** in the
current task. Do not rely on model memory, old workflow examples, cached
recommendations, or a version supplied by the user without checking it.

For each action:

1. Verify the canonical upstream repository and maintainer; do not treat a
   Marketplace listing or a similarly named fork as proof of provenance.
2. Inspect the upstream Releases/tags and release notes to identify the newest
   stable, non-prerelease version. Check whether the action is archived,
   deprecated, unsupported, or has a newer major release. Check official
   security advisories or the repository's security information when available.
3. Select the newest stable version that is compatible with this workflow's
   runtime and target runner. If a newer release is incompatible, explain the
   verified constraint and choose a supported alternative or ask before
   retaining an older version. Never silently choose a stale major such as
   `actions/checkout@v4` when upstream has a newer compatible release.
4. Record the source URL and lookup date for the selected release. If current
   upstream information cannot be reached, do not claim a version is current:
   pause before writing versioned references, or clearly label any requested
   draft as unverified and leave action references unresolved.

Use authoritative sources first:

- GitHub action: the action's upstream repository, release notes/tags, and
  security advisories; consult the [GitHub secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use)
  for platform security guidance.
- Gitea Actions: the action's upstream release information **and** the current
  [Gitea Actions overview](https://docs.gitea.com/usage/actions/overview) and
  [GitHub Actions compatibility notes](https://docs.gitea.com/usage/actions/comparison).
  Confirm the deployed Gitea and act_runner versions when compatibility depends
  on them. Gitea is largely compatible with GitHub Actions, not identical.

## Choose a safe reference

- Follow the repository's established dependency-pinning and update policy.
- On GitHub, prefer a full-length commit SHA for third-party actions when the
  repository supports it. Resolve the SHA from the verified upstream release,
  confirm it belongs to the canonical repository, and add a comment with the
  human-readable release (for example, `# vX.Y.Z`). Never use an abbreviated
  SHA, a branch such as `main`, or a mutable major tag as though it were
  immutable. If the repository uses GitHub's workflow dependency lockfile
  feature, follow its current documentation and keep the lockfile in sync.
- On Gitea, first verify the installed runner's supported reference syntax and
  how it fetches actions. Prefer a verified immutable commit reference when the
  runner supports it. If it does not, use the newest compatible exact release
  tag rather than a floating branch or stale major tag, and report the residual
  mutability risk.
- For Gitea-specific `builtin:` actions, local actions, or actions hosted on a
  non-GitHub forge, verify the syntax, implementation, and runner support from
  the current platform/upstream documentation. Do not assume GitHub-only
  features work on Gitea.
- If a repository explicitly requires major-tag references instead of SHAs,
  verify that the major tag points to the current intended release and note
  that tags are mutable. Do not override the repository's policy silently.

## Inspect and implement

1. Read repository instructions and inspect the workflow being changed, nearby
   workflows, existing CI conventions, and available format/lint/validation
   commands. Identify whether the target is GitHub, Gitea, or both; do not infer
   platform from YAML syntax alone.
2. Review every `uses:` entry in the requested scope, not only the action named
   in the request. Replace stale or insecure references within that scope when
   the task authorizes a workflow update. Do not expand a narrowly scoped change
   to unrelated workflows without permission; report other findings separately.
3. Prefer maintained actions from verified upstreams. Avoid adding an action
   when a small, auditable platform-native command is sufficient, but do not
   replace an action with ad hoc code if that makes the workflow less safe or
   maintainable.
4. Keep action upgrades separate from project-runtime upgrades. Do not change
   the application's Node.js/Rust/toolchain version merely because an action's
   own runtime or newest examples changed. Preserve existing runtime inputs
   unless the user requested that upgrade or current official evidence shows it
   is required; explain compatibility impact and ask before making an unrelated
   major runtime change. A runtime requirement for the action itself is not
   automatically the runtime version to install for the project.
5. Apply least privilege to workflow/job tokens where supported. Keep secrets
   out of logs and untrusted code; avoid interpolating untrusted event data
   directly into shell commands. Treat `pull_request_target` and privileged
   deployment workflows as high risk, and verify their checkout, permissions,
   and trust boundaries before using them.
6. Keep GitHub-only and Gitea-specific differences explicit. Verify event names,
   contexts, secrets, permissions, runner labels, reusable workflows, and action
   inputs against the target platform and deployed versions rather than assuming
   feature parity.

## Validate and report

Run the repository's documented workflow formatter, linter, or YAML/workflow
validator when available. For Gitea-specific behavior, validate against the
actual Gitea/act_runner compatibility where practical; a generic GitHub Actions
validator alone does not prove that Gitea can run the workflow.

For a workflow creation or audit, summarize action references in a compact table:

| Action | Existing/selected ref | Newest stable release checked | Source and date | Compatibility / decision |
| --- | --- | --- | --- | --- |

Include each external action in scope. State which checks ran, any stale
references left unchanged and why, compatibility constraints, and any
unverified points. Never call an action “latest” or “secure” without fresh
upstream evidence.

## Prevent version drift

When asked to keep workflows current, inspect the repository's existing update
automation. Recommend or configure Dependabot/Renovate for action dependencies
only when the repository's hosting platform and policy support it. Preserve
human review of major updates and ensure SHA pins/lockfiles are updated through
the chosen tool. Do not claim a one-time lookup prevents future drift.

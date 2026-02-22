# Branch Protection and Review Gates Setup

This configuration enforces your desired policy:

- No direct pushes to `main`
- 1 mandatory code review before merge
- CI checks must pass before merge

## 1) Protect `main` branch

In GitHub repository settings:

1. Go to `Settings -> Branches -> Add branch protection rule`
2. Branch name pattern: `main`
3. Enable:
   - **Require a pull request before merging**
   - **Require approvals**: `1`
   - **Dismiss stale pull request approvals when new commits are pushed**
   - **Require status checks to pass before merging**
4. Select required checks from this workflow:
   - `smoke-and-regression-on-pr-release-to-main`
   - This check is now always discoverable because the workflow always publishes the job status and runs a no-op step when the PR is not `Release -> main`.
5. Enable:
   - **Require branches to be up to date before merging**
   - **Restrict who can push to matching branches** (set empty or admin-controlled)
   - **Do not allow bypassing the above settings**

This enforces steps 11, 12, and 14 of your plan.

## 2) Protect `Release` branch

Create another branch protection rule:

1. Branch name pattern: `Release`
2. Enable:
   - **Require a pull request before merging**
   - **Require approvals**: `1`
   - **Require status checks to pass before merging**
3. Select required check:
   - `regression-on-pr-to-release`
   - This check is now always discoverable because the workflow always publishes the job status and runs a no-op step when the PR does not target `Release`.

This enforces steps 7 and 8 of your plan.

## 3) Recommended team process alignment

- Developers push to feature branches (`<username>_<story-number>`) and get smoke validation via `smoke-on-feature-push`.
- PR to `Release` runs regression checks.
- PR from `Release` to `main` runs smoke + regression + report publication.
- Merge conflicts are manually resolved by developers before merge.

## 4) Check discoverability note

- GitHub branch protection only lists checks it has seen in workflow runs.
- This repo workflow is configured to always create statuses for:
   - `regression-on-pr-to-release`
   - `smoke-and-regression-on-pr-release-to-main`
- If a PR does not match the test condition for a job, that job completes as a no-op instead of being skipped at job level.
- Result: both checks stay selectable in branch protection settings without creating special seed PRs.

## 5) Best-practice suggestions

- Keep branch names lowercase for consistency (`release`), but current workflow supports your requested `Release`.
- Add CODEOWNERS to require review from designated maintainers.
- Enable auto-cancel stale workflow runs for faster feedback.
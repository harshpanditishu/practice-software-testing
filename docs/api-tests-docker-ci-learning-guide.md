# API Tests Docker CI Workflow — Learning Guide

This document explains `.github/workflows/api-tests-docker-ci.yml` in detail for new automation engineers.

## 1) Why this workflow exists

This workflow implements **quality gates for API testing** plus **Docker image publishing**:

- On feature branch push: run **smoke API tests**.
- On PR to `Release`: run **regression API tests**.
- On PR from `Release` to `main`: run **both smoke + regression**.
- After merge of `Release -> main` PR (only if validations succeeded): **build and push Docker image** to Docker Hub.

This creates a staged confidence model: fast checks early, deeper checks before promotion, and publish only after successful promotion.

---

## 2) High-level pipeline flow

1. Triggered by push/PR/manual dispatch.
2. Job conditions decide which quality gate is relevant.
3. Each test job builds `Dockerfile.playwright-api` and executes Playwright inside container.
4. Test reports are exported as artifacts (`HTML + JUnit`).
5. Final publish job depends on release-main validation success and merged PR state.

---

## 3) Line-by-line walkthrough

### Workflow header, triggers, and globals

- **Line 1**: `name: api-tests-docker-ci` names the workflow in Actions UI.
- **Line 3**: `on:` starts event trigger config.
- **Line 4**: `push:` enables push-based execution.
- **Line 5**: `branches:` says push trigger is branch-filtered.
- **Line 6**: `- '**'` means all branches are eligible for push trigger.
- **Line 7**: `pull_request:` enables PR-based execution.
- **Line 8**: `branches:` limits PR targets.
- **Line 9**: `- main` include PRs targeting `main`.
- **Line 10**: `- Release` include PRs targeting `Release`.
- **Line 11**: `types:` limits PR event types.
- **Line 12**: `opened` runs when PR is created.
- **Line 13**: `synchronize` runs on new commits to PR branch.
- **Line 14**: `reopened` runs if PR is reopened.
- **Line 15**: `closed` is needed so merged state can be evaluated for image push.
- **Line 16**: `workflow_dispatch:` allows manual runs.
- **Line 18**: `env:` starts workflow-wide environment variables.
- **Line 19**: `IMAGE_NAME` sets Docker image repo name suffix.
- **Line 20**: `API_BASE_URL` sets default API endpoint inside containers.
- **Line 22**: `jobs:` begins job definitions.

### Job 1 — `smoke-on-feature-push`

- **Line 23**: Job name for smoke checks on feature pushes.
- **Line 24**: `if:` restricts this job to push events excluding `main` and `Release`.
- **Line 25**: Runs on GitHub-hosted Ubuntu.
- **Line 26**: Hard stop after 15 minutes.
- **Line 28**: `steps:` begins ordered step sequence.
- **Lines 29–30**: Checkout repository source.
- **Lines 32–43**: Inline explanatory comments (non-executable); these document build/run rationale.
- **Line 44**: Step label for building smoke test image.
- **Line 45**: Start shell block.
- **Lines 47–50**: Build Docker image from `Dockerfile.playwright-api`, tag `api-tests:${{ github.sha }}`.
- **Line 52**: Step label for report directory prep.
- **Lines 53–54**: Create host folder `artifacts/smoke` for mounted report output.
- **Line 56**: Step label for running smoke tests.
- **Lines 57–65**: Run containerized Playwright with:
  - `API_BASE_URL` passed in,
  - HTML report path `/artifacts/playwright-report`,
  - JUnit path `/artifacts/results.xml`,
  - bind mount from workspace to persist artifacts,
  - test filter `--grep @smoke`.
- **Line 67**: Step label to upload smoke artifacts.
- **Line 68**: `if: always()` uploads artifacts even if tests fail.
- **Line 69**: Uses upload artifact action v4.
- **Lines 70–73**: Uploads `artifacts/smoke` as `playwright-smoke-report-feature-push`, retained 14 days.
- **Line 75**: Adds markdown summary in Actions run summary.
- **Line 76**: `always()` ensures visibility even on failure.
- **Lines 77–83**: Writes artifact name and retrieval guidance to `$GITHUB_STEP_SUMMARY`.

### Job 2 — `regression-on-pr-to-release`

- **Line 85**: Job for regression validation before code reaches `Release`.
- **Line 86**: Ubuntu runner.
- **Line 87**: 20-minute timeout.
- **Line 89**: Step list start.
- **Lines 90–92**: Checkout executes only if event is PR and base branch is `Release`.
- **Lines 94–100**: Build same API test image under same PR condition.
- **Lines 102–105**: Create `artifacts/regression` directory for reports.
- **Lines 107–116**: Run Playwright with `--grep @regression` and report outputs mounted to host.
- **Lines 118–124**: Upload regression artifact with `always()` and same PR/base condition.
- **Lines 126–134**: Add regression artifact summary to run summary.
- **Lines 136–139**: No-op discoverability step when condition is not applicable; keeps job check understandable in PR UI.

### Job 3 — `smoke-and-regression-on-pr-release-to-main`

- **Line 141**: Combined gate for release promotion to `main`.
- **Line 142**: Ubuntu runner.
- **Line 143**: 25-minute timeout to allow two suites.
- **Lines 145–148**: Checkout only for PRs where base is `main` and head is `Release`.
- **Lines 150–156**: Build test image for promotion validation.
- **Lines 158–162**: Prepare smoke artifact directory.
- **Lines 164–167**: Prepare regression artifact directory.
- **Lines 169–178**: Run smoke suite (`@smoke`) with artifact mount.
- **Lines 180–189**: Run regression suite (`@regression`) with artifact mount.
- **Lines 191–197**: Upload smoke artifact (`playwright-smoke-report`).
- **Lines 199–205**: Upload regression artifact (`playwright-regression-report`).
- **Lines 207–216**: Add combined summary listing both artifacts.
- **Lines 218–221**: No-op discoverability when event isn’t `Release -> main` PR.

### Job 4 — `push-image`

- **Line 223**: Publish job definition.
- **Lines 224–225**: `needs` creates dependency on release-main validation job.
- **Line 226**: Complex gate requiring all of:
  - event is pull_request,
  - base `main`, head `Release`,
  - PR action is `closed`,
  - PR was actually merged,
  - upstream validation job succeeded.
- **Line 227**: Ubuntu runner.
- **Line 228**: 15-minute timeout.
- **Lines 230–232**: Checkout source.
- **Lines 234–238**: Docker Hub login using repository secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
- **Lines 240–243**: Metadata action calculates tags/labels.
- **Lines 244–249**: Inline explanatory comments for image naming/tag strategy.
- **Line 250**: Image name built as `${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}`.
- **Lines 251–253**: Two tags generated:
  - `latest`,
  - SHA tag (`type=sha`) for traceability.
- **Lines 255–262**: Build and push via `docker/build-push-action@v6` using metadata tags/labels.

---

## 4) How this behaves in real delivery

- Feature engineer push → fast smoke signal, report artifact for debugging.
- PR to `Release` → deeper regression confidence before release hardening.
- PR `Release -> main` → full smoke+regression promotion gate.
- Merge successful promotion PR → immutable image published to Docker Hub for downstream usage.

This is a classic **test pyramid enforcement in CI** with explicit branch promotion controls.

---

## 5) Notes for new automation engineers

- `if:` on jobs/steps is the key policy layer; always verify branch/event logic first.
- Use artifact names consistently so downstream teams know where to fetch reports.
- `always()` on artifact upload/summary is crucial for observability on failures.
- SHA tags are mandatory for rollback and test-result traceability.
- The inline comment blocks (lines 32–43 and 244–249) are explanatory only; they do not affect execution.

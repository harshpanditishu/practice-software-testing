# DevOps Cycle for Playwright API Tests (Docker + GitHub Actions)

This guide implements a CI/CD flow where:

1. A Docker image is created with API test dependencies and configuration.
2. Tests run inside a container created from that image.
3. Smoke tests run on feature-branch pushes.
4. Regression tests run for pull requests targeting `Release`.
5. Smoke + regression run for pull requests from `Release` to `main`, with report artifacts.
6. On successful `main` branch push, the same image is pushed to Docker Hub.
7. GitHub Actions is the orchestrator for build, test, report, and publish.

## Artifacts Created

- `Dockerfile.playwright-api`
- `docker-compose.api-tests.yml` (optional local parity helper)
- `.github/workflows/api-tests-docker-ci.yml`

## 1) Local Docker Test Image

Build image:

```bash
docker build -f Dockerfile.playwright-api -t api-tests:local .
```

Run tests inside container:

```bash
docker run --rm -e API_BASE_URL=https://api.practicesoftwaretesting.com api-tests:local
```

## 2) Optional Docker Compose Usage (Local)

Run:

```bash
docker compose -f docker-compose.api-tests.yml up --build --abort-on-container-exit
```

Cleanup:

```bash
docker compose -f docker-compose.api-tests.yml down
```

## 3) GitHub Actions Workflow Behavior

Workflow file: `.github/workflows/api-tests-docker-ci.yml`

- Triggered on all pushes, pull requests to `Release` and `main`, and manual dispatch.
- Job `smoke-on-feature-push`:
   - Trigger: push to any branch except `main` and `Release`
   - Builds Docker image from `Dockerfile.playwright-api`
   - Runs only smoke tests (`@smoke`) inside the container
- Job `regression-on-pr-to-release`:
   - Trigger: pull request target branch is `Release`
   - Builds Docker image and runs only regression tests (`@regression`) inside the container
- Job `smoke-and-regression-on-pr-release-to-main`:
   - Trigger: pull request from `Release` to `main`
   - Runs smoke and regression suites inside containers
   - Publishes HTML/JUnit reports as workflow artifacts
- Job `push-image` (only on `main` push):
  - Logs in to Docker Hub
  - Builds and pushes image to:
    - `<DOCKERHUB_USERNAME>/welcome-to-docker-api-tests:latest`
    - `<DOCKERHUB_USERNAME>/welcome-to-docker-api-tests:sha-...`

## 4) Required GitHub Repository Secrets

Add these repository secrets in GitHub:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` (Docker Hub access token)

Path: `Repository -> Settings -> Secrets and variables -> Actions`.

## 5) Why This Flow Is Good

- Environment consistency: tests always run in a known container image.
- Reproducibility: same Dockerfile for local and CI execution.
- Progressive quality gates: smoke early, regression at release gate, full validation before `main`.
- Controlled publishing: image is published only from `main`.

## 6) Best Practices (Widely Used Improvements)

The implemented approach is valid and common. For larger teams, these are recommended enhancements:

1. **Immutable promotion strategy**
   - Use SHA tags as deployment source of truth.
   - Keep `latest` as convenience tag only.

2. **Run on PR with local image, publish only on protected branches**
   - Already applied in the workflow.

3. **Pin base image versions carefully**
   - Pin to specific Node image digest/tag to avoid drift.

4. **Add artifact/report publishing**
   - Export Playwright results as CI artifacts for troubleshooting.

5. **Add security scanning for Docker image**
   - Example: Trivy scan before pushing image.

6. **Use environments + approvals for release workflows**
   - Separate CI test image publication from production release promotion.

## 7) Optional Next-Step Hardening

- Add a dedicated release workflow that retags a tested SHA image (`qa` -> `prod`) instead of rebuilding.
- Add `concurrency` in GitHub Actions to cancel stale runs.
- Add branch protection requiring this workflow to pass before merge.

## 8) Branch Protection (Required for Full Enforcement)

To fully enforce your policy (no direct push to `main`, minimum one reviewer), configure branch protection.

See:

- `PromptToSetupDevops/Branch-Protection-And-Review-Gates.md`
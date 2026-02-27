# Local Deploy Workflow — Learning Guide

This document explains `.github/workflows/local-deploy.yml` in detail for new automation engineers.

## 1) Why this workflow exists

This workflow performs an **automated local deployment on a self-hosted runner** whenever `main` changes (or when manually triggered). It is designed to keep a local validation environment fresh for sprint-level testing.

Core outcomes:

- Recreate Docker Compose stack for `sprint5`.
- Reinstall API dependencies cleanly.
- Rebuild database with seed data.
- Verify API and UI endpoints.
- On failure, print container status/logs for diagnosis.

---

## 2) High-level deployment flow

1. Trigger on push to `main` or manual dispatch.
2. Prevent overlapping deployments (`concurrency`).
3. Stop previous stack and free known ports.
4. Bring up compose stack with build.
5. Reinstall Laravel dependencies and reset DB.
6. Health-check API + retry-check UI.
7. If anything fails, dump compose status and recent logs.

---

## 3) Line-by-line walkthrough

### Workflow metadata, triggers, and concurrency

- **Line 1**: `name: local-deploy` labels the workflow in Actions.
- **Line 3**: `on:` starts trigger definition.
- **Line 4**: Trigger on `push` events.
- **Line 5**: Restrict push trigger by branch list.
- **Line 6**: Only `main` pushes auto-deploy.
- **Line 7**: `workflow_dispatch` enables manual reruns/deploys.
- **Line 9**: `concurrency:` defines anti-overlap behavior.
- **Line 10**: `group: local-deploy` means all runs share same lock.
- **Line 11**: `cancel-in-progress: true` cancels old run when newer run starts.

### Job definition and environment

- **Line 13**: `jobs:` begins job blocks.
- **Line 14**: `deploy-local` job name.
- **Line 15**: `runs-on: [self-hosted]` requires your own runner machine (not GitHub-hosted).
- **Line 16**: 30-minute timeout guard.
- **Line 17**: Job-level env block starts.
- **Line 18**: `SPRINT=sprint5` pins which sprint config/content should be used by app stack.
- **Line 19**: `DISABLE_LOGGING=true` typically reduces app logging overhead/noise during local deployment.
- **Line 20**: `COMPOSE_PROJECT_NAME=localdeploy` namespaces Compose resources (containers/networks/volumes).
- **Line 22**: `steps:` begins ordered deployment steps.

### Checkout and stack teardown

- **Lines 23–24**: Checkout repository contents for compose files and app code.
- **Line 26**: Step name indicates previous stack cleanup.
- **Line 27**: Explicit `pwsh` shell (PowerShell).
- **Line 28**: Start run script block.
- **Line 29**: `docker compose ... down --remove-orphans` stops/removes running stack and orphaned containers for same compose project.

### Port conflict cleanup

- **Line 31**: Step to free known conflicting ports.
- **Lines 32–33**: PowerShell run block.
- **Line 34**: Port list includes DB/UI/API-related host ports (`3306`, `4200`, `8000`).
- **Line 35**: Loop over each candidate port.
- **Line 36**: Find running containers publishing that host port.
- **Lines 37–39**: If found, force-remove those containers.
- **Line 40**: End loop.

### Deploy stack and prepare API runtime

- **Line 42**: Step label for stack start.
- **Lines 43–44**: PowerShell run block.
- **Line 45**: `docker compose ... up -d --build --remove-orphans` rebuilds and starts the target stack in detached mode.
- **Line 47**: Step label for API dependency installation.
- **Lines 48–49**: PowerShell run block.
- **Line 50**: Inside `laravel-api` container, remove existing vendor + cached bootstrap PHP files (clean state).
- **Line 51**: Clear Composer cache.
- **Line 52**: Install production-lean dependencies with flags:
  - `--prefer-dist`, `--no-interaction`,
  - `--no-dev`, `--no-plugins`, `--no-scripts`,
  - `--optimize-autoloader`,
  - `--ignore-platform-req=ext-ffi`.

### Database reset and API health check

- **Line 54**: Migration/seed step label.
- **Lines 55–56**: PowerShell run block.
- **Line 57**: Run `php artisan migrate:fresh --seed` in API container (drop/recreate schema + seed data).
- **Line 59**: API endpoint verification step label.
- **Lines 60–61**: PowerShell run block.
- **Line 62**: GET `http://localhost:8091/status`.
- **Lines 63–65**: Fail workflow if status code is not `200`.

### UI readiness check with retries

- **Line 67**: UI verification step label.
- **Lines 68–69**: PowerShell run block.
- **Line 70**: Define two acceptable UI URLs (`14200` and `4200`).
- **Line 71**: Up to 30 attempts.
- **Line 72**: 10-second delay between attempts.
- **Line 73**: Track readiness with `$healthy` flag.
- **Line 75**: Outer retry loop starts.
- **Line 76**: Inner loop checks each target URL.
- **Lines 77–78**: Attempt HTTP request with timeout.
- **Line 79**: Treat `2xx` and `3xx` as healthy.
- **Lines 80–82**: Log success and break loops.
- **Lines 85–86**: Swallow transient request errors to keep retrying.
- **Lines 89–91**: Exit retry loop early when healthy.
- **Lines 93–94**: Log wait message and sleep.
- **Lines 97–99**: Throw hard failure if UI never becomes healthy.

### Failure diagnostics

- **Line 101**: Diagnostics step label.
- **Line 102**: `if: failure()` runs only when previous step failed.
- **Line 103**: PowerShell shell.
- **Line 104**: Start run block.
- **Line 105**: Show compose service status.
- **Line 106**: Show recent compose logs (`--tail=200`) for quick debugging context.

---

## 4) How this fits deployment operations

- This is a **continuous local environment refresh pipeline** for `main`.
- It acts as an integration checkpoint on a stable branch using a self-hosted machine.
- Port cleanup + compose project naming reduce “works-on-my-machine” drift.
- Health checks convert deployment readiness into explicit pass/fail automation.
- Failure-only diagnostics keeps successful logs clean while preserving actionable data on failures.

---

## 5) Notes for new automation engineers

- Because this runs on `self-hosted`, runner machine hygiene (Docker disk, network, permissions) is critical.
- Keep endpoint ports synchronized with `.github/docker-compose.local-deploy.yml` and app config.
- `migrate:fresh --seed` is destructive by design; this pipeline assumes disposable local data.
- If deploys become slow/flaky, first inspect conflict-port handling and container startup times.
- Concurrency cancellation is intentional: latest `main` state wins over older deployment attempts.

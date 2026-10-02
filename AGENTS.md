# Agent instructions

This repository is one project of the AEP platform: the app "Auftragsübersicht" lists
sales orders from an SAP interface (a mock with fixed data in the demo).
Node 22, TypeScript, Fastify, Vitest, Playwright; Terraform for one Azure Container App.

## Rules

1. Work on a branch `agent/<topic>`, never on `main`. Pushing to `main` is blocked.
2. Before every push run lint, unit tests and end-to-end tests:
   `npm test` (lint, typecheck, unit tests with coverage) and `npm run test:e2e`.
3. Check every UI change with the Playwright MCP in the visible browser.
4. Open pull requests with `gh pr create`. Read failed checks with `gh pr checks` and
   `gh run view --log-failed`, fix the cause, push again. Do not stop at a red check.
5. Infrastructure lives only under `infra/`. Use only allowed resource types and regions
   and set `tags = local.tags` on every resource. The `policy` check prints the exact
   required change for every violation (`[rule] address: problem. Required change: ...`).
   Only the `hashicorp/azurerm` provider is allowed (no provisioners, no other providers,
   no remote modules). Keep `infra/.terraform.lock.hcl` committed and limited to azurerm.
6. You have no cloud credentials. Deployment happens through the pipeline after the merge.
7. Do not change anything under `.github/` (or `CODEOWNERS`), and never write secrets
   into code, tests, logs or commit messages. Do not add scanner configuration or
   suppressions (`.gitleaksignore`, `.trivyignore`, inline allow or ignore comments for
   gitleaks or Trivy); the `security` check rejects them. Fix the finding instead.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | install dependencies from `package-lock.json` |
| `npm run build && npm start` | run the app on http://localhost:3000 |
| `npm test` | lint, typecheck, unit tests with coverage (minimum 80 % lines) |
| `npm run test:e2e` | Playwright tests; builds and starts the app itself |
| `terraform -chdir=infra fmt` | format Terraform before pushing |

## Layout

- `src/server.ts`: Fastify routes `GET /healthz`, `GET /`, `GET /api/orders`
- `src/sap/client.ts`: `SapClient` interface; `src/sap/mock.ts`: `MockSapClient` and fixtures
- `src/views/`: server-rendered HTML; escape every dynamic value with `escapeHtml`
- `tests/unit/`: Vitest; `tests/e2e/`: Playwright
- `infra/`: Terraform (`main.tf`, `variables.tf`, `env/<environment>.tfvars`)

## Pull request checks

All five must be green before a human can merge: `test`, `security` (gitleaks,
`npm audit`, Trivy), `policy` (Terraform fmt, validate, plan and Rego policies),
`protected-paths` and `e2e`. After the merge the pipeline builds the image once and
deploys it to dev; test and prod need a human approval.

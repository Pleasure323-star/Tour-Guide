# Events Hub frontend testing

Local implementation branch: `feat/events-hub-frontend`, based on local `dev`.
The original `feat/events-hub-local-demo` checkout and its uncommitted prototype
are preserved. This branch contains production components, not demo modules.

## Contract

Existing HTTP helpers use `NEXT_PUBLIC_BASE_URL` and the current token.
All new endpoints are under `/organisations/{organisationId}/events`.
Success responses use `data`; errors use HTTP status and `message`.

- Capabilities: `enabled`, `can_view`, `can_manage`, `can_feature`, `server_now`.
  Missing, failed or OFF capabilities never expose a mock feature.
- List: `items`, `featured_event`, `pagination` (`current_page`, `limit`,
  `total_items`, `total_pages_count`), `server_now`, `featured_revision`.
- Detail/create/save/publish/cancel/RSVP: `event`, `server_now`,
  `featured_revision`. Event DTOs use snake_case.
- Create/PATCH: title/description/category, `host_id`, `starts_local` and
  `ends_local` (`YYYY-MM-DDTHH:mm`), `organiser_time_zone: Africa/Lagos`,
  `destination: {kind: external, url}`. Empty times permit incomplete drafts.
  Create retries reuse `operation_id`; updates carry `expected_revision`.
- Publish/cancel carry `expected_revision`. RSVP uses `{going: boolean}`.
- Feature uses `{event_id: string | null, expected_revision}` with the settings
  revision, not the event revision.
- Join returns `{url, kind: external, server_now}` only after fresh authority
  and time checks. The frontend validates HTTPS/no embedded credentials again.
- Event notices carry `notification_type` (`event_reminder`, `event_changed`,
  `event_cancelled`), `event_id`, `org_id`, `notification_id`. They contain no
  meeting destination. The existing inbox remains the delivery source of truth.

Hosts are selected from the existing organisation users endpoint with server
search. Existing RBAC maps `can_view_events`, `can_manage_events` and
`can_feature_events` to the corresponding event keys; the backend capabilities
remain authoritative. No permissions catalog or default role data is invented.

## Local Cypress checks

Use project-pinned pnpm 10.27.0. The harness is stored only under Cypress
fixtures; it is never part of the production route tree. Create it temporarily:

```sh
mkdir -p 'src/app/(events-test)/events-test'
cp cypress/fixtures/events/harness-page.txt 'src/app/(events-test)/events-test/page.tsx'
pnpm dev --port 3012
```

In a second terminal:

```sh
pnpm exec cypress run --spec 'cypress/e2e/events/*.cy.ts' --config baseUrl=http://localhost:3012,video=false,screenshotsFolder=/private/tmp/events-fe-screens
```

Stop the local server and remove the harness before checking or committing:

```sh
rm 'src/app/(events-test)/events-test/page.tsx'
rmdir 'src/app/(events-test)/events-test' 'src/app/(events-test)'
pnpm check-format
pnpm check-lint
pnpm check-types
pnpm build
```

Fixtures intercept only event APIs and the unrelated optional analytics script.
No authenticated live organisation is seeded or spammed. These checks exercise
production components; they do not prove deployed API or worker behaviour.

## Review and deployment prerequisites

No push, PR, merge, migration, feature activation or deployment is authorised by
this local implementation. Before upstream review:

1. Obtain approved ticket IDs and rename/split this descriptive local branch
   into sequential review slices of about 400 meaningful lines. Submit only
   ticket branches to `zedu-hng/zedu-fe:dev`; keep one PR open per author.
2. A maintainer must allow `src/app/(client)/[org]/events/page.tsx` in the review
   configuration. Protected `.github/` files are intentionally unchanged.
3. Verify backend/frontend deployment origins and revisions, pilot organisation
   ID/slug, operator access, migrations and the active notice executor.
4. Deploy and verify backend APIs/migrations/notices with the feature OFF, then
   deploy the frontend and enable only the authorised pilot organisation.
5. Use member/host/lead/non-member accounts in two independent browsers for
   create/publish/discover/RSVP/refresh/closed-browser reminder/Join, then
   reschedule/cancel/revoke/cross-org/mobile/keyboard checks and API restart.

The default-OFF gate handles older backends. External HTTPS meetings and
persistent in-app notifications are the first-release workarounds; native
scheduled Buzz and optional browser push are outside this acceptance.

## Implementation decisions

The navigation link lives in the shared primary sidebar, so it is reachable
from Events and Notifications as well as channel pages. The channel-specific
`Nav.tsx` is not the owner of navigation on all organisation routes.

Edit forms retain their initial event identity and revision during background
refresh. Revision conflicts retain input and require explicit reload/review.
Join capabilities refresh at known server-time boundaries. No browser timer
creates reminder records. Background polling and focus refresh reconcile shared
state when WebSocket delivery is unavailable.

## Local verification evidence

- pnpm 10.27.0; format, ESLint and TypeScript checks passed.
- Production build passed with `/{org}/events` and the temporary harness absent.
  TypeScript was checked separately because production build skips validation.
- Feature Cypress: 24 passing checks across capability/discovery, member and
  organiser workflows, refresh regressions, mobile and notification routing.
- Built HTML uses the existing `/mainapp/_next/` asset prefix and no demo
  controls. Generic organisation routing can also match `demo` as an org slug;
  it still uses normal authentication and event capabilities, never demo state.
- Real backend, deployment, two-account and closed-browser worker acceptance
  remain unverified until the deployment prerequisites above are satisfied.

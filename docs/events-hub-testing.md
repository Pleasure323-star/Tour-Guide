# Events Hub frontend testing

Implementation branch: `feat/events-hub-frontend`, based on `dev`.

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
- Event notices carry `notification_type` (`event_reminder`, `event_updated`,
  `event_cancelled`), `event_id`, `org_id`, `notification_id`. They contain no
  meeting destination. The existing inbox remains the delivery source of truth.

Hosts are selected from the existing organisation users endpoint with server
search. Existing RBAC maps `can_view_events`, `can_manage_events` and
`can_feature_events` to the corresponding event keys; the backend capabilities
remain authoritative. No permissions catalog or default role data is invented.

## Cypress checks

Use project-pinned pnpm 10.27.0. The harness is stored only under Cypress
fixtures; it is never part of the production route tree. Create it temporarily:

```sh
mkdir -p 'src/app/(events-test)/events-test'
cp cypress/fixtures/events/harness-page.txt 'src/app/(events-test)/events-test/page.tsx'
pnpm dev --port 3012
```

In a second terminal, set `EVENTS_TEST_BASE_URL` to the running frontend
origin before executing the checks:

```sh
pnpm exec cypress run --spec 'cypress/e2e/events/*.cy.ts' --config baseUrl="$EVENTS_TEST_BASE_URL",video=false,screenshotsFolder=/private/tmp/events-fe-screens
```

Stop the development server and remove the harness before checking or committing:

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
this implementation. Before upstream review:

1. Obtain approved ticket IDs and rename/split this feature branch
   into sequential review slices of about 400 meaningful lines. Submit only
   ticket branches to `zedu-hng/zedu-fe:dev`; keep one PR open per author.
2. The page uses the existing approved settings route tree at
   `src/app/(client)/[org]/settings/events/page.tsx`; the main sidebar opens
   it as Learning / Events Hub. Protected `.github/` files remain unchanged.
3. Verify backend/frontend deployment origins and revisions, pilot organisation
   ID/slug, operator access, migrations and the active notice executor.
4. Deploy and verify backend APIs/migrations/notices, then deploy the frontend.
   Events defaults ON for this staging integration and organisation settings
   initialise automatically; no manual activation query is required.
5. Use member/host/lead/non-member accounts in two independent browsers for
   create/publish/discover/RSVP/refresh/closed-browser reminder/Join, then
   reschedule/cancel/revoke/cross-org/mobile/keyboard checks and API restart.

The capability gate handles unavailable backends and explicit disabling. External HTTPS meetings and
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

## Verification evidence

- pnpm 10.27.0; format, ESLint and TypeScript checks passed.
- Production build passed with `/{org}/settings/events` and the temporary harness absent.
  TypeScript was checked separately because production build skips validation.
- Feature Cypress: 24 passing checks across capability/discovery, member and
  organiser workflows, refresh regressions, mobile and notification routing.
- Built HTML uses the existing `/mainapp/_next/` asset prefix.
- Real backend, deployment, two-account and closed-browser worker acceptance
  remain unverified until the deployment prerequisites above are satisfied.

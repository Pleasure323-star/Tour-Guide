# Events Hub frontend presentation

Branch: `feat/009-events-hub-frontend-only`. Deploy only this frontend to the team's testing URL. Existing Zedu login and organisation access still use the existing backend. No new Events API, migration, flag activation or worker deployment is required.

The Events page is `/{org}/settings/events`, reached through Learning / Events Hub. It starts with two example sessions and one draft. Each signed-in account and organisation has separate browser storage. The interface states that events and RSVPs do not sync between people. All testers can try organiser actions; this is not server-enforced event permission management.

Try creating and publishing a draft, editing, featuring, filtering, RSVP, refresh, cancellation and Join. Supply your own HTTPS meeting destination. Join opens 15 minutes before the scheduled start and closes at the end, using the browser clock. Reminder and change/cancellation notices appear inside Events Hub while the page is open; they do not run after the browser closes or enter the shared backend inbox.

The backend-connected implementation is preserved on `feat/009-events-hub-frontend` and `feat/009-events-hub-backend`. A main-website rollout will be broken into approved tickets and reviewable PRs for shared persistence, permissions, delivery and frontend integration.

## Checks

Run the required format, lint, types and production build checks with pnpm 10.27.0. Targeted Cypress browser-storage checks exercise real production components without intercepting Events API responses.

To run the Cypress harness, temporarily copy `cypress/fixtures/events/harness-page.txt` into `src/app/(events-test)/events-test/page.tsx`, start the frontend, and run `cypress/e2e/events/browser-storage.cy.ts`. Remove the temporary route before building or committing. The harness must not ship.

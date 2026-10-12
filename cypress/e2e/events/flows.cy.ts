/// <reference types="cypress" />
export {};
beforeEach(() =>
  cy.intercept("GET", "**/events-test?id=*", {
    body: "",
    headers: { "content-type": "application/javascript" },
  })
);
const now = "2026-10-12T14:00:00Z";
const event = {
  id: "session-1",
  organisation_id: "org-a",
  title: "Designing better team experiences",
  description: "A practical workshop",
  category: "Workshop",
  host: { id: "host-1", name: "Ada", role_label: "Host" },
  audience: { organisation_id: "org-a", label: "Team A" },
  status: "published",
  starts_at: "2026-10-12T14:10:00Z",
  ends_at: "2026-10-12T15:10:00Z",
  organiser_time_zone: "Africa/Lagos",
  revision: 1,
  schedule_version: 1,
  featured: false,
  going: false,
  destination: {
    kind: "external",
    url: "https://meeting.example.test/session",
  },
  capabilities: {
    can_manage: true,
    can_feature: true,
    can_rsvp: true,
    can_join: true,
  },
  join_opens_at: "2026-10-12T13:55:00Z",
  join_closes_at: "2026-10-12T15:10:00Z",
  reminder_at: "2026-10-12T13:40:00Z",
};
const list = {
  items: [event],
  featured_event: null,
  pagination: {
    current_page: 1,
    limit: 20,
    total_items: 1,
    total_pages_count: 1,
  },
  server_now: now,
  featured_revision: 0,
};
function setup(record = event) {
  cy.intercept("GET", "**/events/capabilities", {
    body: {
      data: {
        enabled: true,
        can_view: true,
        can_manage: true,
        can_feature: true,
        server_now: now,
      },
    },
  });
  cy.intercept("GET", /\/events\?.*/, {
    body: { data: { ...list, items: [record] } },
  }).as("list");
  cy.intercept("GET", "**/events/session-1", {
    body: { data: { event: record, server_now: now, featured_revision: 0 } },
  });
  cy.visit("/events-test");
  cy.wait("@list");
}
describe("Shared Events workflows", () => {
  it("sends search, date, tab and pagination to the server", () => {
    setup();
    cy.intercept("GET", /\/events\?.*q=design(?:&|$)/, {
      body: { data: list },
    }).as("search");
    cy.get('[aria-label="Search events"]').type("design");
    cy.wait("@search").its("request.url").should("include", "q=design");
    cy.intercept("GET", /\/events\?tab=my-rsvps/, { body: { data: list } }).as(
      "rsvps"
    );
    cy.contains("button", "My RSVPs").click();
    cy.wait("@rsvps").its("request.url").should("include", "tab=my-rsvps");
    cy.intercept("GET", /\/events\?.*date=2026-10-13/, {
      body: { data: list },
    }).as("date");
    cy.get('[aria-label="Filter by date"]').type("2026-10-13");
    cy.wait("@date").its("request.url").should("include", "date=2026-10-13");
  });
  it("preserves confirmed RSVP after failure and selects independently by URL", () => {
    setup();
    cy.intercept("PUT", "**/events/session-1/rsvp", {
      statusCode: 503,
      body: { message: "Try again" },
    }).as("rsvp");
    cy.contains("button", event.title).click();
    cy.location("search").should("include", "event=session-1");
    cy.contains("button", /^RSVP$/).click();
    cy.wait("@rsvp");
    cy.contains("button", /^RSVP$/).should("be.enabled");
    cy.contains("Going").should("not.exist");
    cy.contains("button", "Back to events").click();
    cy.location("search").should("not.include", "event=");
  });
  it("clears detail after permission revocation", () => {
    setup();
    cy.contains("button", event.title).click();
    cy.intercept("PUT", "**/events/session-1/rsvp", {
      statusCode: 403,
      body: { message: "Access revoked" },
    });
    cy.contains("button", /^RSVP$/).click();
    cy.contains(event.description).should("not.exist");
  });
  it("rejects an old organisation response after switching", () => {
    setup();
    cy.intercept("GET", /\/organisations\/org-a\/events\?.*/, {
      delay: 700,
      body: { data: list },
    });
    cy.get('[aria-label="Search events"]').type("old");
    cy.intercept("GET", /\/organisations\/org-b\/events\?.*/, {
      body: { data: { ...list, items: [] } },
    });
    cy.contains("button", "Switch test organisation").click();
    cy.contains("No events found").should("be.visible");
    cy.wait(900);
    cy.contains(event.title).should("not.exist");
  });
  it("saves an incomplete draft and retains input on revision conflict", () => {
    setup();
    cy.intercept("GET", "**/organisations/org-a/users?*", {
      body: {
        data: [{ id: "host-1", name: "Ada" }],
        pagination: { total_pages: 1 },
      },
    });
    cy.intercept("POST", "**/events", {
      statusCode: 201,
      body: {
        data: {
          event: { ...event, status: "draft", title: "New session" },
          server_now: now,
          featured_revision: 0,
        },
      },
    }).as("create");
    cy.contains("button", "Host an event").click();
    cy.get('[name="title"]').type("New session");
    cy.contains("button", "Save draft").click();
    cy.wait("@create")
      .its("request.body")
      .should("have.property", "operation_id");
    cy.get("@create")
      .its("request.body")
      .should("not.have.property", "host_id");
    cy.contains("button", event.title).click();
    cy.contains("button", "Edit event").click();
    cy.intercept("PATCH", "**/events/session-1", {
      statusCode: 409,
      body: { message: "Changed by another organiser" },
    });
    cy.get('[name="title"]').clear().type("My edit");
    cy.contains("button", "Save changes").click();
    cy.get('[role="dialog"] [role="alert"]')
      .scrollIntoView()
      .should("contain", "Changed by another organiser");
    cy.get('[name="title"]').should("have.value", "My edit");
  });
  it("keeps long titles and details usable at 360px", () => {
    cy.viewport(360, 740);
    const longTitle = "Building better experiences with your team "
      .repeat(4)
      .slice(0, 160);
    setup({ ...event, title: longTitle });
    cy.contains("button", longTitle).click();
    cy.contains("button", "Back to events").should("be.visible");
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(360)
    );
  });
});

describe("Event lifecycle and authorised handoff", () => {
  for (const [time, enabled] of [
    ["2026-10-12T13:54:59Z", false],
    ["2026-10-12T13:55:00Z", true],
    ["2026-10-12T15:10:00Z", false],
  ] as const) {
    it(`presents the Join boundary at ${time}`, () => {
      setup();
      cy.intercept("GET", "**/events/session-1", {
        body: { data: { event, server_now: time, featured_revision: 0 } },
      });
      cy.contains("button", event.title).click();
      cy.contains("button", "Join session").should(
        enabled ? "be.enabled" : "be.disabled"
      );
    });
  }
  it("authorises Join before exposing the destination and offers popup continuation", () => {
    setup();
    cy.window().then((win) => cy.stub(win, "open").returns(null));
    cy.intercept("POST", "**/events/session-1/join", {
      body: {
        data: {
          url: "https://meeting.example.test/authorised",
          kind: "external",
          server_now: now,
        },
      },
    }).as("join");
    cy.contains("button", event.title).click();
    cy.get('a[href*="meeting.example.test"]').should("not.exist");
    cy.contains("button", "Join session").click();
    cy.wait("@join");
    cy.contains("a", "Continue to authorised meeting")
      .should("have.attr", "href", "https://meeting.example.test/authorised")
      .and("have.attr", "rel", "noopener noreferrer");
  });
  it("keeps confirmed attendance and prevents duplicate clicks until RSVP completes", () => {
    setup();
    cy.intercept("PUT", "**/events/session-1/rsvp", {
      delay: 500,
      body: {
        data: {
          event: { ...event, going: true },
          server_now: now,
          featured_revision: 0,
        },
      },
    }).as("going");
    cy.contains("button", event.title).click();
    cy.contains("button", /^RSVP$/).click();
    cy.contains("button", "Please wait…").should("be.disabled");
    cy.wait("@going");
    cy.contains("button", "Cancel RSVP").should("be.enabled");
    cy.contains("span", /^Going$/).should("be.visible");
  });
  it("requires confirmation to cancel and disables member actions afterwards", () => {
    setup();
    cy.intercept("POST", "**/events/session-1/cancel", {
      body: {
        data: {
          event: { ...event, status: "cancelled" },
          server_now: now,
          featured_revision: 0,
        },
      },
    }).as("cancel");
    cy.contains("button", event.title).click();
    cy.contains("button", "Cancel event").click();
    cy.contains("Cancel this event?").should("be.visible");
    cy.contains("button", "Confirm cancellation").click();
    cy.wait("@cancel");
    cy.contains("button", "Join session").should("not.exist");
    cy.contains("button", /^RSVP$/).should("not.exist");
  });
  it("renders list errors and empty state without inventing a featured event", () => {
    setup();
    cy.contains("Featured session").should("not.exist");
    cy.intercept("GET", /\/events\?.*/, {
      statusCode: 503,
      body: { message: "Events temporarily unavailable" },
    });
    cy.contains("button", "Past").click();
    cy.contains("Events temporarily unavailable").should("be.visible");
    cy.intercept("GET", /\/events\?.*/, {
      body: { data: { ...list, items: [] } },
    });
    cy.contains("button", "Retry").click();
    cy.contains("No events found").should("be.visible");
  });
  it("uses stable server paging and preserves filters on detail close", () => {
    setup();
    cy.intercept("GET", /\/events\?.*/, {
      body: {
        data: {
          ...list,
          pagination: { ...list.pagination, total_pages_count: 2 },
        },
      },
    }).as("pages");
    cy.contains("button", "Past").click();
    cy.wait("@pages");
    cy.intercept("GET", /\/events\?.*page=2/, {
      body: {
        data: {
          ...list,
          pagination: {
            ...list.pagination,
            current_page: 2,
            total_pages_count: 2,
          },
        },
      },
    }).as("next");
    cy.contains("button", "Next page").click();
    cy.wait("@next").its("request.url").should("include", "tab=past");
    cy.contains("button", event.title).click();
    cy.contains("button", "Back to events").click();
    cy.contains("button", "Past").should("have.attr", "aria-selected", "true");
    cy.contains("Page 2 of 2").should("be.visible");
  });
});

describe("Refresh regressions", () => {
  it("keeps an edit bound to its original event during a delayed refresh", () => {
    setup();
    cy.contains("button", event.title).click();
    cy.contains("button", "Edit event").click();
    cy.get('[name="title"]').clear().type("Preserved edit");
    cy.intercept("GET", "**/events/session-1", {
      delay: 1500,
      body: {
        data: {
          event: { ...event, revision: 2 },
          server_now: now,
          featured_revision: 0,
        },
      },
    });
    cy.intercept("PATCH", "**/events/session-1", {
      body: {
        data: {
          event: { ...event, title: "Preserved edit", revision: 2 },
          server_now: now,
          featured_revision: 0,
        },
      },
    }).as("edit");
    cy.window().then((win) => win.dispatchEvent(new Event("focus")));
    cy.wait(100);
    cy.get('[role="dialog"] h2').then((title) =>
      expect(title.text()).to.equal("Edit event")
    );
    cy.contains("button", "Save changes").click();
    cy.wait("@edit")
      .its("request.body")
      .should("have.property", "expected_revision", 1);
  });
  it("refreshes selected featured state immediately after feature success", () => {
    setup();
    cy.contains("button", event.title).click();
    cy.contains("button", "Feature event").should("be.visible");
    cy.intercept("PUT", "**/events/featured", {
      body: { data: { featured_revision: 1 } },
    }).as("feature");
    cy.intercept("GET", "**/events/session-1", {
      body: {
        data: {
          event: { ...event, featured: true },
          server_now: now,
          featured_revision: 1,
        },
      },
    });
    cy.contains("button", "Feature event").click();
    cy.wait("@feature");
    cy.contains("button", "Remove featured").should("be.visible");
  });
  it("refreshes a false Join capability at the exact opening boundary", () => {
    cy.clock(Date.parse("2026-10-12T13:54:59Z"));
    setup();
    cy.intercept("GET", "**/events/session-1", {
      body: {
        data: {
          event: {
            ...event,
            capabilities: { ...event.capabilities, can_join: false },
          },
          server_now: "2026-10-12T13:54:59Z",
          featured_revision: 0,
        },
      },
    });
    cy.contains("button", event.title).click();
    cy.contains("button", "Join session").should("be.disabled");
    cy.intercept("GET", "**/events/session-1", {
      body: {
        data: {
          event,
          server_now: "2026-10-12T13:55:00Z",
          featured_revision: 0,
        },
      },
    }).as("boundary");
    cy.tick(1050);
    cy.wait("@boundary");
    cy.contains("button", "Join session").should("be.enabled");
  });
});

describe("Capability revalidation", () => {
  it("closes discovery when capability verification becomes unavailable", () => {
    setup();
    cy.intercept("GET", "**/events/capabilities", {
      statusCode: 503,
      body: { message: "Event access unavailable" },
    }).as("accessFailure");
    cy.window().then((win) => win.dispatchEvent(new Event("focus")));
    cy.wait("@accessFailure");
    cy.contains("Host an event").should("not.exist");
    cy.contains(event.title).should("not.exist");
    cy.contains("button", "Retry").should("be.visible");
  });
});

describe("Detail focus restoration", () => {
  it("returns focus to the selected agenda event after mobile Back", () => {
    cy.viewport(360, 740);
    setup();
    cy.contains("button", event.title).click();
    cy.contains("button", "Back to events").click();
    cy.focused().should("have.text", event.title);
  });
});

describe("Backend contract regressions", () => {
  it("shows singular backend validation errors on the matching field", () => {
    setup();
    cy.intercept("GET", "**/organisations/org-a/users?*", {
      body: { data: [] },
    });
    cy.intercept("POST", "**/events", {
      statusCode: 422,
      body: {
        message: "Please check the request",
        error: { title: "Use a shorter event title" },
      },
    }).as("invalidDraft");
    cy.contains("button", "Host an event").click();
    cy.get('[name="title"]').type("New session");
    cy.contains("button", "Save draft").click();
    cy.wait("@invalidDraft");
    cy.contains("Use a shorter event title")
      .scrollIntoView()
      .should("be.visible");
  });
  it("offers publication rather than cancellation for a draft", () => {
    setup({ ...event, status: "draft" });
    cy.contains("button", event.title).click();
    cy.contains("button", "Publish event").should("be.visible");
    cy.contains("button", "Cancel event").should("not.exist");
  });
});

/// <reference types="cypress" />
export {};
beforeEach(() => {
  cy.intercept("GET", "**/events-test?id=*", {
    body: "",
    headers: { "content-type": "application/javascript" },
  });
  cy.intercept("GET", "**/events/capabilities", {
    body: {
      data: {
        enabled: false,
        can_view: false,
        server_now: new Date().toISOString(),
      },
    },
  });
  cy.visit("/events-test");
  cy.contains("Events Hub is unavailable").should("be.visible");
});
describe("Persistent event notice presentation", () => {
  it("routes a reminder to an event after refresh using current organisation context", () => {
    cy.reload();
    cy.contains("button", "Show test notification").click();
    cy.contains("Event reminder").should("be.visible");
    cy.contains("a", "View event").should(
      "have.attr",
      "href",
      "/team-a/events?event=session-1"
    );
  });
  it("refuses to route a notice from a different organisation", () => {
    cy.contains("button", "Switch test organisation").click();
    cy.contains("button", "Show test notification").click();
    cy.contains("a", "View event").should("not.exist");
  });
  it("deduplicates a nested event publication by stable notification identity", () => {
    cy.contains("button", "Receive nested notice").click().click();
    cy.get('[aria-label="Notice badge"]').should("have.text", "1");
  });
});

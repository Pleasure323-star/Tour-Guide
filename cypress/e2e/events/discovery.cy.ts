/// <reference types="cypress" />
export {};
beforeEach(() =>
  cy.intercept("GET", "**/events-test?id=*", {
    body: "",
    headers: { "content-type": "application/javascript" },
  })
);
describe("Events capability gate", () => {
  it("keeps discovery closed when the organisation flag is OFF", () => {
    cy.intercept("GET", "**/events/capabilities", {
      body: {
        data: {
          enabled: false,
          can_view: true,
          server_now: new Date().toISOString(),
        },
      },
    });
    cy.visit("/events-test");
    cy.contains("Events Hub is unavailable").should("be.visible");
    cy.contains("Host an event").should("not.exist");
  });
  it("offers retry without exposing events when capabilities fail", () => {
    cy.intercept("GET", "**/events/capabilities", {
      statusCode: 503,
      body: { message: "Service unavailable" },
    });
    cy.visit("/events-test");
    cy.contains("Retry").should("be.visible");
    cy.contains("Host an event").should("not.exist");
  });
});

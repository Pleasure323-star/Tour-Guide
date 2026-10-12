/// <reference types="cypress" />
export {};
beforeEach(() =>
  cy.intercept("GET", "**/events-test?id=*", {
    body: "",
    headers: { "content-type": "application/javascript" },
  })
);
const visit = () => {
  cy.clearAllLocalStorage();
  return cy.visit("/events-test");
};
beforeEach(() => cy.viewport(1280, 900));
describe("Browser-stored Events Hub", () => {
  it("opens without event APIs and persists attendance after refresh", () => {
    let calls = 0;
    cy.intercept("**/organisations/**/events*", (req) => {
      calls++;
      req.reply({ statusCode: 503 });
    });
    visit();
    cy.contains("Community learning session").should("be.visible");
    cy.contains("button", "Community learning session").click();
    cy.contains("button", /^RSVP$/).click();
    cy.window().should((win) => {
      const entries = Object.keys(win.localStorage).filter((k) =>
        k.startsWith("zedu-events-browser")
      );
      const rows = entries.flatMap(
        (k) => JSON.parse(win.localStorage.getItem(k) || "{}").events || []
      );
      expect(
        rows.some((e) => e.going),
        JSON.stringify(rows.map((e) => ({ title: e.title, going: e.going })))
      ).to.eq(true);
    });
    cy.contains("Going").should("be.visible");
    cy.reload();
    cy.contains("Going").should("be.visible");
    cy.then(() => expect(calls).to.eq(0));
  });
  it("saves an incomplete draft and keeps it scoped to the organisation", () => {
    visit();
    cy.contains("button", "Host an event").click();
    cy.get('[name="title"]').type("Browser workshop");
    cy.contains("button", "Save draft").click();
    cy.contains("button", "Edit event").should("be.visible");
    cy.contains("button", "Cancel event").should("not.exist");
    cy.reload();
    cy.contains("Browser workshop").should("be.visible");
    cy.contains("button", "Switch test organisation").click();
    cy.contains('[role="tab"]', "Drafts").click();
    cy.contains("Browser workshop").should("not.exist");
    cy.contains("button", "Switch test organisation").click();
    cy.contains('[role="tab"]', "Drafts").click();
    cy.contains("Browser workshop").should("be.visible");
  });
  it("edits, features and cancels a session without a backend", () => {
    visit();
    cy.contains("button", "Community learning session").click();
    cy.contains("button", "Edit event").click();
    cy.get('[name="title"]').clear().type("Updated session");
    cy.get('[name="url"]').type("https://meeting.example.test/session");
    cy.contains("button", "Save changes").click();
    cy.contains("Updated session").should("be.visible");
    cy.contains("button", "Join session").should("be.enabled");
    cy.contains("button", /^RSVP$/).click();
    cy.contains("button", "Cancel event").click();
    cy.contains('[role="alertdialog"] button', "Confirm cancellation").click();
    cy.contains("button", "Join session").should("not.exist");
    cy.contains("Event updates").should("be.visible");
    cy.contains("Updated session was cancelled.").should("be.visible");
  });
});

describe("Mobile pricing comparison", () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.visit("/pricing");
  });

  it("switches plans with the keyboard and labels the selected panel", () => {
    cy.contains('[role="tab"]', "Starter")
      .should("have.attr", "aria-selected", "true")
      .focus()
      .type("{rightarrow}");

    cy.contains('[role="tab"]', "Growth")
      .should("be.focused")
      .and("have.attr", "aria-selected", "true")
      .and("have.attr", "aria-controls", "pricing-plan-panel");

    cy.get('[role="tabpanel"]')
      .should("have.id", "pricing-plan-panel")
      .and("have.attr", "aria-labelledby", "pricing-plan-tab-pro");
  });
});

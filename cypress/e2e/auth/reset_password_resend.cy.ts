describe("reset password resend countdown", () => {
  it("shows the resend action when the countdown expires", () => {
    cy.clock();
    cy.visit("/auth/reset-password?email=test%40example.com");

    cy.contains("Resend code after").should("be.visible");
    cy.tick(60_000);

    cy.contains("Resend code after").should("not.exist");
    cy.contains("button", "Resend code").should("be.visible");
  });
});

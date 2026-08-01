import { test } from "../fixtures/fixtures.js";
import { expect } from "@playwright/test";

const passwordGuideLines = [
  "At least 8 characters",
  "One uppercase letter (A–Z)",
  "One number (0–9)",
  "One special character (!@#$%^&*…)",
];

const randomNumber = Math.floor(Math.random() * 10) + 1;

test.describe("User registration tests", () => {
  test.describe.configure({
    mode: "serial",
  });

  test("should be able to see error messages when user enters wrong or empty details", async ({
    page,
    registrationPage,
  }) => {
    await registrationPage.navigate_to_registration_page();
    await expect(registrationPage.registration_header).toBeVisible();
    expect(await registrationPage.getPasswordGuidelines()).toEqual(
      passwordGuideLines,
    );
    await registrationPage.click_on_create_account_link();

    // Verify that error messages are displayed for email and password fields
    await expect(registrationPage.email_error_message).toBeVisible();
    await expect(registrationPage.password_error_message).toBeVisible();
    await expect(registrationPage.email_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );
    await expect(registrationPage.password_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );

    await registrationPage.password.fill("Test1234");
    await registrationPage.click_on_create_account_link();

    // Verify that error message is displayed for confirm password field
    await expect(registrationPage.confirm_password_error_message).toBeVisible();
    await expect(registrationPage.confirm_password_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );
  });

  test.only("should be able to register a new user successfully", async ({
    page,
    registrationPage,
    apiUtil,
  }) => {
    await registrationPage.navigate_to_registration_page();
    await expect(registrationPage.registration_header).toBeVisible();
    await registrationPage.register_user(
      `zuratoki${randomNumber}@gmail.com`,
      "Testing@123",
    );

    expect(await registrationPage.getPasswordGuidelines()).toEqual(
      passwordGuideLines,
    );

    for (
      let i = 0;
      i < (await registrationPage.password_guidelines.count());
      i++
    ) {
      let guideline = registrationPage.password_guidelines.nth(i);

      await expect(guideline).toHaveCSS("color", "rgb(5, 150, 105)");
    }

    const [registerResponse] = await Promise.all([
      apiUtil.waitForResponse("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    await expect(page).toHaveURL("/");

    const userBody = await registerResponse.json();

    expect(registerResponse.ok()).toBeTruthy();
    expect(registerResponse.status()).toBe(201);
    expect(userBody.success).toBeTruthy();
  });
});

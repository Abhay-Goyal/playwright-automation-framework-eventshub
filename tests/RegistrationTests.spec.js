import { test, expect } from "../fixtures/fixtures.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Load test user credentials from the JSON fixture
const userData = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "../userDetails.json"),
    "utf-8",
  ),
);

// Existing registered user used for negative registration scenarios
const validUser = userData[0].validuser;

// Expected password requirements displayed on the registration page
const passwordGuideLines = [
  "At least 8 characters",
  "One uppercase letter (A–Z)",
  "One number (0–9)",
  "One special character (!@#$%^&*…)",
];

// Generate a unique email so the registration test can run repeatedly without duplicate-user failures.
const randomEmail = `zuratoki-${crypto.randomUUID()}@gmail.com`;

test.describe("User registration tests", () => {
  // Navigate to the registration page before each test
  // and verify the page loads with the expected password guidance.
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.navigate_to_registration_page();

    await expect(registrationPage.registration_header).toBeVisible();

    expect(await registrationPage.getPasswordGuidelines()).toEqual(
      passwordGuideLines,
    );
  });

  test("should be able to see error messages when user enters wrong or empty details", async ({
    page,
    registrationPage,
  }) => {
    // Submit the form without entering any details.
    await registrationPage.click_on_create_account_link();

    // Verify email and password validation messages are displayed.
    await expect(registrationPage.email_error_message).toBeVisible();
    await expect(registrationPage.password_error_message).toBeVisible();

    // Validation messages should be displayed in red.
    await expect(registrationPage.email_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );

    await expect(registrationPage.password_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );

    // Fill only the password to trigger confirm-password validation.
    await registrationPage.password.fill("Test1234");
    await registrationPage.click_on_create_account_link();

    // Verify confirm-password validation is displayed.
    await expect(registrationPage.confirm_password_error_message).toBeVisible();

    await expect(registrationPage.confirm_password_error_message).toHaveCSS(
      "color",
      "rgb(220, 38, 38)",
    );
  });

  test("should be able to register a new user successfully", async ({
    page,
    registrationPage,
    apiUtil,
  }) => {
    // Fill the registration form with valid user details.
    await registrationPage.register_user(randomEmail, "Testing@123");

    // Every password guideline should indicate success.
    for (
      let i = 0;
      i < (await registrationPage.password_guidelines.count());
      i++
    ) {
      const guideline = registrationPage.password_guidelines.nth(i);

      await expect(guideline).toHaveCSS("color", "rgb(5, 150, 105)");
    }

    // Submit the registration form while waiting for the API response.
    const [registerResponse] = await Promise.all([
      apiUtil.waitForResponse("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    // Successful registration redirects the user to the home page.
    await expect(page).toHaveURL("/");

    const userBody = await registerResponse.json();

    // Validate the registration API response.
    expect(registerResponse.ok()).toBeTruthy();
    expect(registerResponse.status()).toBe(201);
    expect(userBody.success).toBeTruthy();
  });

  test("should not be able to register with an existing customer", async ({
    page,
    registrationPage,
    apiUtil,
  }) => {
    // Attempt to register with an account that already exists.
    await registrationPage.register_user(validUser.email, validUser.password);

    const [registerResponse] = await Promise.all([
      apiUtil.waitForResponse("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    const userBody = await registerResponse.json();

    // Verify the backend error is displayed to the user.
    await expect(registrationPage.already_have_an_account_flash).toBeVisible();

    await expect(
      registrationPage.already_have_an_account_flash_message,
    ).toHaveText(userBody.error);

    // User should remain on the registration page.
    await expect(page).toHaveURL("/register");

    // Validate the failed API response.
    expect(registerResponse.ok()).toBeFalsy();
    expect(registerResponse.status()).toBe(400);
    expect(userBody.success).toBeFalsy();
  });

  test("should display a network error when the registration request fails", async ({
    page,
    registrationPage,
    apiUtil,
    mockUtil,
  }) => {
    // Mock a network failure for the registration endpoint.
    await mockUtil.mockNetworkError("register");

    await registrationPage.register_user(validUser.email, validUser.password);

    // Submit the registration request while capturing the outgoing request.
    const [registerRequest] = await Promise.all([
      apiUtil.waitForRequest("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    // Verify the request details.
    expect(registerRequest.method()).toBe("POST");
    expect(registerRequest.url()).toContain("/register");

    // Aborted requests do not receive a response.
    expect(await registerRequest.response()).toBeNull();

    // Verify the application displays a network error.
    await expect(
      registrationPage.already_have_an_account_flash_message,
    ).toHaveText(/Network Error/);
  });
});

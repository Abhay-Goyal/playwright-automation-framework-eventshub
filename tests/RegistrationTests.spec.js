import { test } from "../fixtures/fixtures.js";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const userData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../userDetails.json"), "utf-8"),
);

const validUser = userData[0].validuser;

const passwordGuideLines = [
  "At least 8 characters",
  "One uppercase letter (A–Z)",
  "One number (0–9)",
  "One special character (!@#$%^&*…)",
];

const randomNumber = Math.floor(Math.random() * 10) + 1;

test.describe("User registration tests", () => {
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

  test("should be able to register a new user successfully", async ({
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

  test("should not be able to register with an existing customer", async ({
    page,
    registrationPage,
    apiUtil,
  }) => {
    await registrationPage.navigate_to_registration_page();
    await expect(registrationPage.registration_header).toBeVisible();
    await registrationPage.register_user(validUser.email, validUser.password);

    const [registerResponse] = await Promise.all([
      apiUtil.waitForResponse("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    const userBody = await registerResponse.json();

    await expect(registrationPage.already_have_an_account_flash).toBeVisible();
    await expect(
      registrationPage.already_have_an_account_flash_message,
    ).toHaveText(userBody.error);

    await expect(page).toHaveURL("/register");

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
    await registrationPage.navigate_to_registration_page();

    await mockUtil.mockNetworkError("register");

    await registrationPage.register_user(validUser.email, validUser.password);

    const [registerRequest] = await Promise.all([
      apiUtil.waitForRequest("register", "POST"),
      registrationPage.click_on_create_account_link(),
    ]);

    expect(registerRequest.method()).toBe("POST");
    expect(registerRequest.url()).toContain("/register");
    expect(await registerRequest.response()).toBeNull();
    await expect(
      registrationPage.already_have_an_account_flash_message,
    ).toHaveText(/Network Error/);
  });

  test.only("should get error message when wrong method passed", async ({
    page,
    registrationPage,
    mockUtil,
    apiUtil,
  }) => {
    await registrationPage.navigate_to_registration_page();

    await mockUtil.mockRequest("register");

    await registrationPage.register_user(
      "daisdshajk@kdmaslka.com",
      validUser.password,
    );

    const [registerResponse] = await Promise.all([
      apiUtil.waitForResponse("register", "GET"),
      registrationPage.click_on_create_account_link(),
    ]);

    const userBody = await registerResponse.json();

    await expect(
      registrationPage.already_have_an_account_flash_message,
    ).toHaveText(userBody.error);
  });
});

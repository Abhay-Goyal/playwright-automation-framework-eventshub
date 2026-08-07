import { test, expect } from "../fixtures/fixtures.js";
import fs from "fs";
import path from "path";

// Read the test data from the JSON file
const file = fs.readFileSync(
  path.join(import.meta.dirname, "../userDetails.json"),
  "utf-8",
);

// Parse the JSON data so it can be used in the tests
const userData = JSON.parse(file);

const validUser = userData[0].validuser;
const invalidUser = userData[1].invaliduser;

test.describe("Login Tests", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate_to_login_page();
  });

  test("should login successfully with valid credentials", async ({
    page,
    loginPage,
    apiUtil,
  }) => {
    // Trigger login and wait for the login API response simultaneously

    const [loginResponse] = await Promise.all([
      apiUtil.waitForResponse("login", "POST"),
      loginPage.login(validUser.email, validUser.password),
    ]);

    // Parse the login API response to JSON
    const loginBody = await loginResponse.json();

    // Fetch the authentication token stored in localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem("eventhub_token");
    });

    // Verify the API request was successful
    expect(loginResponse.ok()).toBeTruthy();
    // Verify the success flag returned by the API
    expect(loginBody.success).toBeTruthy();
    // Validate that the stored token matches the API response
    expect(token).toBe(loginBody.token);

    // Verify that after login user is navigated to the homepage
    await expect(page).not.toHaveURL(/login/);
  });

  test("should display a network error when the login request fails", async ({
    page,
    loginPage,
    mockUtil,
    apiUtil,
  }) => {
    // Mock a network failure for the login API
    await mockUtil.mockNetworkError("login");

    // Trigger login and wait for the login request to be sent
    const [loginRequest] = await Promise.all([
      apiUtil.waitForRequest("login", "POST"),
      loginPage.login(validUser.email, validUser.password),
    ]);

    // Verify the login request was sent
    expect(loginRequest.method()).toBe("POST");
    expect(loginRequest.url()).toContain("/login");

    // Verify the network error message is displayed
    await expect(page.getByText("✕Network Error×")).toBeVisible();

    // Verify that after login user remains on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should display an error for invalid login credentials", async ({
    page,
    loginPage,
    apiUtil,
  }) => {
    // Trigger login and wait for the login API response
    const [loginResponse] = await Promise.all([
      apiUtil.waitForResponse("login", "POST"),
      loginPage.login(invalidUser.email, invalidUser.password),
    ]);
    // Parse the response body
    const userBody = await loginResponse.json();

    // Verify that the login request failed
    expect(loginResponse.ok()).toBeFalsy();
    expect(loginResponse.status()).toBe(400);

    // Verify the error message displayed in the UI matches the API response
    await expect(page.locator(".pointer-events-auto>div>p")).toHaveText(
      userBody.error,
    );
    // Verify that after login user remains on the login page
    await expect(page).toHaveURL(/login/);
  });

  test("should display a server error when the server is down", async ({
    page,
    mockUtil,
    loginPage,
    apiUtil,
  }) => {
    // Mock the login API to return a 500 Internal Server Error
    await mockUtil.mockResonse("login", undefined, 500);

    // Trigger login and wait for the login API response
    const [loginResponse] = await Promise.all([
      apiUtil.waitForResponse("login", "POST"),
      loginPage.login(invalidUser.email, invalidUser.password),
    ]);

    // Verify the login request failed with a server error
    expect(loginResponse.status()).toBe(500);

    // Verify the server error message is displayed to the user
    await expect(page.locator(".pointer-events-auto>div>p")).toHaveText(
      "Request failed with status code 500",
    );
    // Verify that after login user remains on the login page
    await expect(page).toHaveURL(/login/);
  });
});

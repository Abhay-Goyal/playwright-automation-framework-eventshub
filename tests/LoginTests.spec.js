import { test } from "../fixtures/fixtures.js";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const file = fs.readFileSync(
  path.join(__dirname, "../userDetails.json"),
  "utf-8",
);
const userData = JSON.parse(file);

test.describe("Login Tests", () => {
  test.describe.configure({
    mode: "serial",
  });

  test("Valid Login Test via the UI", async ({ page, loginPage, apiUtil }) => {
    await loginPage.navigate_to_login_page();
    const loginResponse = apiUtil.waitForResponse("login", "POST");
    await loginPage.login(
      userData[0].validuser.email,
      userData[0].validuser.password,
    );
    const userResponse = await loginResponse;
    const userJSONResponse = await userResponse.json();
     expect(userResponse.ok()).toBeTruthy();

    const token = await page.evaluate(() => {
      return window.localStorage.getItem("eventhub_token");
    });

    expect(token).toBe(userJSONResponse.token);
    expect(userJSONResponse.success).toBeTruthy();
  });

  test("Network Error", async ({ page, loginPage, mockUtil, apiUtil }) => {
    await loginPage.navigate_to_login_page();
    await mockUtil.mockNetworkError("login");
    const loginRequest = apiUtil.waitForRequest("login", "POST");
     await loginPage.login(
      userData[0].validuser.email,
      userData[0].validuser.password,
    );
    const networkRequest = await loginRequest;
    await expect(page.getByText("✕Network Error×")).toBeVisible();
  });

  test("Invalid Login Test via the UI", async ({page,loginPage,apiUtil}) => {
    await loginPage.navigate_to_login_page();
    const loginResponse = apiUtil.waitForResponse("login", "POST");
    await loginPage.login(
      userData[1].invaliduser.email,
      userData[1].invaliduser.password,
    );
    const userResponse = await loginResponse;

    const userJSONResponse = await userResponse.json();

    await expect(page.locator(".pointer-events-auto>div>p")).toHaveText(
      userJSONResponse.error,
    );

    expect(userResponse.ok()).toBeFalsy();
    expect(userJSONResponse.error).toBe("Invalid email or password");
  });

  test("Server Error", async ({ page, mockUtil, loginPage }) => {
    await loginPage.navigate_to_login_page();
    await mockUtil.mockResonse("login", undefined, 500);
    await loginPage.login(
      userData[1].invaliduser.email,
      userData[1].invaliduser.password,
    );
    await expect(page.locator(".pointer-events-auto>div>p")).toHaveText(
      "Request failed with status code 500",
    );
  });
});

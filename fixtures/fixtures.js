import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/Loginpage";
import { APIutil } from "../utils/APIutil";
import { Mockutil } from "../utils/Mockutil";

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  apiUtil: async ({ page, request }, use) => {
    await use(new APIutil(request, page));
  },

  mockUtil : async({page} , use) => {
    await use(new Mockutil(page));
  }
});

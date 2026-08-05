import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/Loginpage.js";
import { APIutil } from "../utils/APIutil.js";
import { Mockutil } from "../utils/Mockutil.js";
import { RegistrationPage } from "../pages/RegistrationPage.js";
import { HomePage } from "../pages/HomePage.js";
import { BookingDetailsPage } from "../pages/BookingDetailsPage.js";


export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  homePage : async({page} , use) => {
    await use(new HomePage(page));
  },

  apiUtil: async ({ page, request }, use) => {
    await use(new APIutil(request, page));
  },

  mockUtil : async({page} , use) => {
    await use(new Mockutil(page));
  },

  bookingDetailsPage : async({page} , use) => {
    await use(new BookingDetailsPage(page))
  }

 
});

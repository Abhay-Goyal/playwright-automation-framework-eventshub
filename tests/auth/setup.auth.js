import { expect } from "allure-playwright";
import{ test as setup } from "../../fixtures/fixtures.js"
import userDetails from "../../userDetails.json" with {type : "json"};
import path from "path";

 const validuser= userDetails[0].validuser;
 const filepath = path.resolve(import.meta.dirname , "../../state.json");

 setup.use({
    headless : true
 })




setup("Authentication" , async ({page , loginPage , homePage}) => {
    await loginPage.navigate_to_login_page();
    await loginPage.login(validuser.email,validuser.password);
    await expect(homePage.logout).toBeVisible();
    await page.context().storageState({path : filepath});

})
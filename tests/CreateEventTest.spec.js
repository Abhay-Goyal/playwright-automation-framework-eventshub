import { test, expect } from "../fixtures/fixtures.js";
import { createEventData } from "../utils/TestDatautil.js";

const eventForm = createEventData();

test.use({
  storageState: "state.json",
});

test("Create an event", async ({
  page,
  homePage,
  eventsPage,
  newEventsPage,
  apiUtil,
}) => {
  await page.goto("/");
  await expect(homePage.logout).toBeVisible();

  await homePage.openEventsPage();
  await expect(page).toHaveURL("/events");
  await expect(eventsPage.addEvent).toBeVisible();
  await eventsPage.clickAddEvent();

  await expect(page).toHaveURL("/admin/events");
  await expect(newEventsPage.pageHeading).toBeVisible();
  await newEventsPage.fillEventCreationForm(eventForm);

  const [response] = await Promise.all([
    apiUtil.waitForResponse("events", "POST"),
    newEventsPage.clickOnAddEvent(),
  ]);

  const responseBody = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(201);


  await expect(page.getByText(/Event created/)).toBeVisible();
  await expect(newEventsPage.myEvent(eventForm.title)).toBeVisible();


});

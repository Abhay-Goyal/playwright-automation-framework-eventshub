import { test, expect } from "../fixtures/fixtures.js";
import { config } from "../config/env.js";
import path from "path";
import fs from "fs";
import { createBookData, createEventData } from "../utils/TestDatautil.js";

// Load valid user credentials from the JSON file for authentication.
const validData = JSON.parse(
  fs.readFileSync(
    path.resolve(import.meta.dirname, "../userDetails.json"),
    "utf-8",
  ),
);

// Available event categories used for generating random event data.
const categories = ["Conference", "Concert", "Sports", "Workshop", "Festival"];

// Retrieve the valid user details from the test data.
const validuser = validData[0].validuser;

/**
 * Formats a given date into a readable format.
 * Example: Monday, 25 December 2026
 */
function dateFormatter(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Authentication payload used for login API.
const data = {
  email: validuser.email,
  password: validuser.password,
};

test("Book an Event", async ({ page, apiUtil, bookingDetailsPage }) => {
  let token;
  let bookingDetails = {};
  // Generate random event data for each test execution.
  const eventData = createEventData(categories);

  // Generate random booking details for the event.
  const bookData = createBookData();

  // Authenticate the user and retrieve the JWT token.
  await test.step("should be able to generate the auth token", async () => {
    const userResponse = await apiUtil.postRequest(
      `${config.API_URL}auth/login`,
      data,
    );

    const userAuth = await userResponse.json();

    expect(userResponse.ok()).toBeTruthy();
    expect(userResponse.status()).toBe(200);

    token = userAuth.token;
  });

  // Create a new event through the API.
  await test.step("should be able to create an event using api", async () => {
    const eventResponse = await apiUtil.postRequest(
      `${config.API_URL}events`,
      eventData,
      { Authorization: `Bearer ${token}` },
    );

    const eventJSON = await eventResponse.json();

    expect(eventResponse.ok()).toBeTruthy();
    expect(eventResponse.status()).toBe(201);

    // Store the created event ID for booking.
    bookData.eventId = eventJSON.data.id;
  });

  // Book the created event through the API.
  await test.step("should be able to book an event using api", async () => {
    const bookResponse = await apiUtil.postRequest(
      `${config.API_URL}bookings`,
      bookData,
      { Authorization: `Bearer ${token}` },
    );

    const JSONbook = await bookResponse.json();

    expect(bookResponse.ok()).toBeTruthy();
    expect(bookResponse.status()).toBe(201);

    // Save booking details for UI validation.
    bookingDetails = JSONbook.data;
  });

  // Validate that the booking details displayed in the UI
  // match the data returned by the booking API.
  await test.step("Validate the details in api with booking details on UI", async () => {
    // Inject authentication token into browser local storage
    // before navigating to the protected page.
    await page.addInitScript((token) => {
      window.localStorage.setItem("eventhub_token", token);
    }, token);

    try {
      // Navigate directly to the booking details page.
      await bookingDetailsPage.navigate_to_booking_details_page(
        bookingDetails.id,
      );

      // Format dates to match the UI display format.
      const expectedEventDate = dateFormatter(bookingDetails.event.eventDate);
      const expectedBookingDate = dateFormatter(bookingDetails.createdAt);

      // Retrieve values that require text parsing from the UI.
      const ticketPrice = await bookingDetailsPage.getTicketPrice();
      const totalPrice = await bookingDetailsPage.getTotalPrice();
      const bookingId = await bookingDetailsPage.getBookingId();

      // Validate all event-related details.
      await expect(bookingDetailsPage.eventName).toHaveText(
        bookingDetails.event.title,
      );
      await expect(bookingDetailsPage.category).toHaveText(
        bookingDetails.event.category,
      );
      await expect(bookingDetailsPage.eventDate).toHaveText(expectedEventDate);
      await expect(bookingDetailsPage.venue).toHaveText(
        bookingDetails.event.venue,
      );
      await expect(bookingDetailsPage.city).toHaveText(
        bookingDetails.event.city,
      );

      // Validate customer details.
      await expect(bookingDetailsPage.customerName).toHaveText(
        bookingDetails.customerName,
      );
      await expect(bookingDetailsPage.customerEmail).toHaveText(
        bookingDetails.customerEmail,
      );
      await expect(bookingDetailsPage.customerPhone).toHaveText(
        bookingDetails.customerPhone,
      );

      // Validate booking information.
      await expect(bookingDetailsPage.numberOfTickets).toHaveText(
        bookingDetails.quantity.toString(),
      );

      expect(ticketPrice).toBe(bookingDetails.event.price);
      expect(totalPrice).toBe(bookingDetails.totalPrice);
      expect(bookingId).toBe(bookingDetails.id.toString());

      await expect(bookingDetailsPage.bookingDate).toHaveText(
        expectedBookingDate,
      );

      // Verify total price calculation.
      expect(Number(bookingDetails.totalPrice)).toBe(
        bookingDetails.event.price * bookingDetails.quantity,
      );
    } finally {
      // Always clean up by deleting the created event,
      // even if any validation fails.
      const deleteResponse = await apiUtil.deleteRequest(
        `${config.API_URL}events/${bookingDetails.eventId}`,
        { Authorization: `Bearer ${token}` },
      );

      expect(deleteResponse.ok()).toBeTruthy();
      expect(deleteResponse.status()).toBe(200);
    }
  });
});

export class HomePage {
  constructor(page) {
    this.page = page;
    this.events = page.getByRole("link", { name: "Events" });
    this.my_bookings = page.getByRole("link", { name: "My Bookings" });
    this.logout = page.getByRole("button", { name: "Logout" });
    this.banner = page.locator("section[class*='text-white overflow-hidden']");
    this.browse_events = page.getByRole("link", { name: /Browse Events/ });
    this.view_all = page.getByRole("link", { name: /View all/ });
    this.featured_events = page.getByTestId("event-card");
    this.book_now = page.getByTestId("book-now-btn");
  }

  async bookSpecificEvent(eventName) {
    const event = this.featured_events.filter({
      hasText: `${eventName}`,
    });
    await event.getByTestId("book-now-btn").click();
  }
}

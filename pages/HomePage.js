export class HomePage {
  constructor(page) {
    this.page = page;
    this.events = page.getByTestId("nav-events");
    this.myBookings = page.getByTestId("nav-bookings");
    this.logout = page.getByTestId("logout-btn");
    this.banner = page.locator("section[class*='text-white overflow-hidden']");
    this.browseEvents =  page.getByText('Browse Events →');
    this.viewAll = page.getByRole("link", { name: /View all/ });
    this.featuredEvents = page.getByTestId("event-card");
  }

  async bookSpecificEvent(eventName) {
    const event = this.featuredEvents.filter({
      hasText: eventName,
    });
    await event.getByTestId("book-now-btn").click();
  }

  async openEventsPage(){
    await this.events.click();
  }
}

export class BookingDetailsPage {
  constructor(page) {
    this.page = page;
    this.eventName = page.locator("//span[text()='Event']/following-sibling::span");
    this.category = page.locator("//span[text()='Category']/following-sibling::span");
    this.eventDate = page.locator("//span[text()='Date']/following-sibling::span");
    this.venue = page.locator("//span[text()='Venue']/following-sibling::span");
    this.city = page.locator("//span[text()='City']/following-sibling::span");
    this.customerName = page.locator("//span[text()='Name']/following-sibling::span");
    this.customerEmail = page.locator("//span[text()='Email']/following-sibling::span");
    this.customerPhone = page.locator("//span[text()='Phone']/following-sibling::span");
    this.numberOfTickets = page.locator("//span[text()='Tickets']/following-sibling::span");
    this.ticketPrice = page.locator("//span[text()='Price per ticket']/following-sibling::span");
    this.totalPrice = page.locator("//span[text()='Total Paid']/following-sibling::span");
    this.bookingID = page.locator("//span[text()='Booking ID']/following-sibling::span");
    this.bookingDate = page .locator("//span[text()='Booked on']/following-sibling::span");
  }

  async navigate_to_booking_details_page(bookingId) {
    await this.page.goto(`/bookings/${bookingId}`);
  }

  getEventTitle(eventTitle) {
    return this.page.getByRole("heading", { name: eventTitle });
  }

  getBookingRef(bookingRef){
    return this.page.getByText(bookingRef);
  }

  async getTicketPrice(){
    const ticketPrice = await this.ticketPrice.textContent()??""
    return ticketPrice.replace(/[^0-9]/g,"");
  }

  async getTotalPrice(){
     const totalPrice = await this.totalPrice.textContent()??""
     return totalPrice.replace(/[^0-9]/g,"");
  }

  async getBookingId(){
     const bookingID = await this.bookingID.textContent()??""
     return bookingID.replace(/[^0-9]/g,"");
  }


}

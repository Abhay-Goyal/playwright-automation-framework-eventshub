export class NewEventsPage {
  constructor(page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: '+ New Event' });
    this.eventTitle = page.getByRole("textbox", { name: /Title/ });
    this.description = page.getByPlaceholder("Describe the event…");
    this.category = page.getByRole("combobox", { name: /Category/ });
    this.city = page.getByRole("textbox", { name: /City/ });
    this.venue = page.getByRole("textbox", { name: /Venue/ });
    this.eventDate = page.locator('//input[contains(@id, "date")]');
    this.price = page.getByRole("spinbutton", { name: /Price/ });
    this.totalSeats = page.getByRole("spinbutton", { name: /Total Seats/ });
    this.addEvent = page.getByTestId("add-event-btn");
    this.eventsDisplayed = page.getByTestId('event-table-row');
  }

  async fillEventCreationForm(formObject = {}) {
    await this.eventTitle.fill(formObject.title);
    await this.description.fill(formObject.description);
    await this.category.selectOption({ value: formObject.category });
    await this.city.fill(formObject.city);
    await this.venue.fill(formObject.venue);
    await this.eventDate.fill(formObject.eventDate.slice(0, 16));
    await this.price.fill(String(formObject.price));
    await this.totalSeats.fill(String(formObject.totalSeats));
  }

  async clickOnAddEvent() {
    await this.addEvent.click();
  }

   myEvent(eventName){
  return this.eventsDisplayed.filter({
    hasText : eventName
  })
  }

}

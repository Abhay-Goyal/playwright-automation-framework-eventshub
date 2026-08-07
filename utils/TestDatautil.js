import { faker } from "@faker-js/faker";

const categories = ["Conference", "Concert", "Sports", "Workshop", "Festival"];

export function createBookData() {
  return {
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email({ provider: "gmail.com" }),
    customerPhone: faker.phone.number({ style: "mobile" }),
    quantity: faker.number.int({ min: 1, max: 10 }),
  };
}

export function createEventData(data = categories) {
  return {
    title: faker.company.name(),
    description: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(data),
    venue: faker.location.streetAddress(),
    city: faker.location.city(),
    eventDate: faker.date.future().toISOString(),
    price: faker.number.int({ min: 500, max: 10000}),
    totalSeats: faker.number.int({ min: 500, max: 1000 }),
  };
}

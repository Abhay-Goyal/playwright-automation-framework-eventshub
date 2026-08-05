import { faker } from "@faker-js/faker";

export function createBookData() {
  return {
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email({ provider: "gmail.com" }),
    customerPhone: faker.phone.number({ style: "mobile" }),
    quantity: faker.number.int({ min: 1, max: 10 }),
  };
}

export function createEventData(categories) {
  return {
    title: faker.company.name(),
    description: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(categories),
    venue: faker.location.streetAddress(),
    city: faker.location.city(),
    eventDate: faker.date.future().toISOString(),
    price: faker.finance.amount({ min: 500, max: 10000, dec: 0 }),
    totalSeats: faker.number.int({ min: 500, max: 1000 }),
  };
}

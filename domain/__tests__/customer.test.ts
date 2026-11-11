import { Customer } from "../customer";

const address = {
  streetLine1: "123 Main St",
  city: "Toronto",
  stateOrProvince: "ON",
  postalCode: "M5V 1A1",
  country: "Canada",
};

const photo = {
  id: "photo-1",
  url: "https://example.com/photo.jpg",
};

const measurements = {
  unit: "in" as const,
  chest: 40,
  waist: 34,
};

function createCustomer() {
  return new Customer({
    id: "customer-1",
    name: "Priyam",
    phoneNumber: "555-0100",
    photo,
    address,
    bodyMeasurements: measurements,
  });
}

describe("Customer", () => {
  it("updates customer profile fields", () => {
    const customer = createCustomer();

    customer.update({
      name: "Updated Customer",
      phoneNumber: "555-0101",
    });

    expect(customer.name).toBe("Updated Customer");
    expect(customer.phoneNumber).toBe("555-0101");
  });

  it("requires at least one changed field for customer updates", () => {
    const customer = createCustomer();

    expect(() => customer.update({})).toThrow(
      "A customer update must include at least one changed field.",
    );
  });
});

import { Order } from "../order";
import { Business } from "../business";
import { Customer } from "../customer";
import { OrderItem, type OrderItems } from "../order-item";
import { PaymentStatus } from "../payment";

const address = {
  streetLine1: "123 Main St",
  city: "Toronto",
  stateOrProvince: "ON",
  postalCode: "M5V 1A1",
  country: "Canada",
};

const measurements = {
  unit: "in" as const,
  chest: 40,
};

const photo = {
  id: "photo-1",
  url: "https://example.com/photo.jpg",
};

const items: OrderItems = [
  {
    id: "item-1",
    title: "Custom gown",
    status: OrderItem.Status.Created,
    amountOwing: 700,
    amountPaid: 0,
    measurements,
    inspirationPhotos: [photo],
  },
];

const business = new Business({
  id: "business-1",
  name: "Tailor Shop",
  description: "Custom tailoring",
  address,
});

describe("Business", () => {
  it("creates an order and records the order created event", () => {
    const occurredAt = new Date("2026-09-15T10:00:00.000Z");
    const expectedDueDate = new Date("2026-10-01T10:00:00.000Z");

    const order = business.createOrder({
      customerId: "customer-1",
      notes: "Use navy fabric.",
      items,
      expectedDueDate,
      deliveryAddress: address,
      occurredAt,
    });

    expect(order.customerId).toBe("customer-1");
    expect(order.status).toBe(Order.Status.Created);
    expect(order.paymentStatus).toBe(PaymentStatus.Unpaid);
    expect(order.history).toEqual([
      {
        type: "order_created",
        occurredAt,
        customerId: "customer-1",
        notes: "Use navy fabric.",
        items,
        expectedDueDate,
        status: Order.Status.Created,
        paymentStatus: PaymentStatus.Unpaid,
        paymentMethod: undefined,
        deliveryAddress: address,
      },
    ]);
  });

  it("records the derived creation status and preserves initial item history after cancellation", () => {
    const order = business.createOrder({
      customerId: "customer-1",
      items: [{ ...items[0], status: OrderItem.Status.InProgress }],
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
      deliveryAddress: address,
    });

    expect(order.status).toBe(Order.Status.InProgress);
    expect(order.history[0]).toMatchObject({
      type: "order_created",
      status: Order.Status.InProgress,
    });

    order.cancel();

    expect(order.status).toBe(Order.Status.Cancelled);
    expect(order.history[0]).toMatchObject({
      type: "order_created",
      status: Order.Status.InProgress,
      items: [expect.objectContaining({ status: OrderItem.Status.InProgress })],
    });
    expect(order.history[1]).toMatchObject({
      type: "order_cancelled",
      occurredAt: expect.any(Date),
      items: [expect.objectContaining({ status: OrderItem.Status.Cancelled })],
    });
  });

  it("requires at least one order item when creating an order", () => {
    expect(() =>
      business.createOrder({
        customerId: "customer-1",
        items: [] as unknown as OrderItems,
        expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
        deliveryAddress: address,
      }),
    ).toThrow("An order must have at least one order item.");
  });

  it("creates a customer that can be used to place an order", () => {
    const customer = business.createCustomer({
      id: "customer-2",
      name: "New Customer",
      phoneNumber: "555-0101",
      photo,
      address,
      bodyMeasurements: measurements,
    });
    const order = business.createOrder({
      customerId: customer.id,
      items,
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
      deliveryAddress: customer.address,
    });

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.name).toBe("New Customer");
    expect(order.customerId).toBe(customer.id);
    expect(order.id).toBeUndefined();
    expect(order.history[0]).toMatchObject({
      type: "order_created",
      customerId: customer.id,
      occurredAt: expect.any(Date),
    });
  });
});

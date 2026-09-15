import { Customer } from "../customer";
import type { OrderItems } from "../order-item";
import { OrderStatus } from "../order-status";
import { PaymentStatus } from "../payment";

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

const orderItems: OrderItems = [
  {
    id: "item-1",
    title: "Custom suit",
    amount: 500,
    measurements,
    inspirationPhotos: [photo],
  },
];

function createCustomer() {
  return new Customer({
    id: "customer-1",
    name: "Priyam",
    phoneNumber: "555-0100",
    photo,
    address,
    bodyMeasurements: measurements,
    orders: [],
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

  it("creates an order and records the order created event", () => {
    const customer = createCustomer();
    const occurredAt = new Date("2026-09-15T10:00:00.000Z");
    const expectedDueDate = new Date("2026-10-01T10:00:00.000Z");

    const order = customer.createOrder({
      id: "order-1",
      notes: "Use navy fabric.",
      items: orderItems,
      expectedDueDate,
      deliveryAddress: address,
      occurredAt,
    });

    expect(customer.orders).toEqual([order]);
    expect(order.customerId).toBe(customer.id);
    expect(order.status).toBe(OrderStatus.Created);
    expect(order.paymentStatus).toBe(PaymentStatus.Unpaid);
    expect(order.history).toEqual([
      {
        type: "order_created",
        occurredAt,
        customerId: customer.id,
        notes: "Use navy fabric.",
        items: orderItems,
        expectedDueDate,
        status: OrderStatus.Created,
        paymentStatus: PaymentStatus.Unpaid,
        paymentMethod: undefined,
        deliveryAddress: address,
      },
    ]);
  });

  it("requires at least one order item when creating an order", () => {
    const customer = createCustomer();

    expect(() =>
      customer.createOrder({
        id: "order-1",
        items: [] as unknown as OrderItems,
        expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
        deliveryAddress: address,
      }),
    ).toThrow("An order must have at least one order item.");
  });

  it("excludes delivered and cancelled orders from active orders and total amount owing", () => {
    const customer = createCustomer();

    const activeOrder = customer.createOrder({
      id: "active-order",
      items: orderItems,
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
      deliveryAddress: address,
    });
    const deliveredOrder = customer.createOrder({
      id: "delivered-order",
      items: [{ ...orderItems[0], id: "item-2", amount: 300 }],
      expectedDueDate: new Date("2026-10-02T10:00:00.000Z"),
      deliveryAddress: address,
    });
    const cancelledOrder = customer.createOrder({
      id: "cancelled-order",
      items: [{ ...orderItems[0], id: "item-3", amount: 200 }],
      expectedDueDate: new Date("2026-10-03T10:00:00.000Z"),
      deliveryAddress: address,
    });

    deliveredOrder.updateStatus({ status: OrderStatus.Delivered });
    cancelledOrder.cancel();

    expect(customer.activeOrders).toEqual([activeOrder]);
    expect(customer.totalAmountOwing).toBe(500);
  });

  it("gets an order by id and throws when it cannot be found", () => {
    const customer = createCustomer();
    const order = customer.createOrder({
      id: "order-1",
      items: orderItems,
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
      deliveryAddress: address,
    });

    expect(customer.getOrder("order-1")).toBe(order);
    expect(() => customer.getOrder("missing-order")).toThrow(
      "Order missing-order was not found for customer customer-1.",
    );
  });
});

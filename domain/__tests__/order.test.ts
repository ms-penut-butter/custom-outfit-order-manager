import { Order } from "../order";
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

const updatedAddress = {
  streetLine1: "456 Queen St",
  city: "Toronto",
  stateOrProvince: "ON",
  postalCode: "M5V 2B2",
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
    amount: 700,
    measurements,
    inspirationPhotos: [photo],
  },
];

function createOrder() {
  return new Order({
    id: "order-1",
    customerId: "customer-1",
    items,
    expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
    status: OrderStatus.Created,
    paymentStatus: PaymentStatus.Unpaid,
    deliveryAddress: address,
    history: [],
  });
}

describe("Order", () => {
  it("calculates total amount from order items", () => {
    const order = new Order({
      id: "order-1",
      customerId: "customer-1",
      items: [
        items[0],
        {
          ...items[0],
          id: "item-2",
          amount: 250,
        },
      ],
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
      status: OrderStatus.Created,
      paymentStatus: PaymentStatus.Unpaid,
      deliveryAddress: address,
      history: [],
    });

    expect(order.totalAmount).toBe(950);
  });

  it("updates order details and records an order updated event", () => {
    const order = createOrder();
    const occurredAt = new Date("2026-09-15T12:00:00.000Z");
    const expectedDueDate = new Date("2026-10-15T10:00:00.000Z");

    order.update({
      occurredAt,
      updates: {
        notes: "Add beadwork.",
        expectedDueDate,
        paymentMethod: "cash",
        deliveryAddress: updatedAddress,
      },
    });

    expect(order.notes).toBe("Add beadwork.");
    expect(order.expectedDueDate).toBe(expectedDueDate);
    expect(order.paymentMethod).toBe("cash");
    expect(order.deliveryAddress).toBe(updatedAddress);
    expect(order.history).toEqual([
      {
        type: "order_updated",
        occurredAt,
        updates: {
          notes: "Add beadwork.",
          expectedDueDate,
          paymentMethod: "cash",
          deliveryAddress: updatedAddress,
        },
      },
    ]);
  });

  it("requires at least one changed field for order updates", () => {
    const order = createOrder();

    expect(() => order.update({ updates: {} })).toThrow(
      "An order update must include at least one changed field.",
    );
  });

  it("updates order items and records an order items updated event", () => {
    const order = createOrder();
    const occurredAt = new Date("2026-09-15T13:00:00.000Z");
    const updatedItems: OrderItems = [
      {
        ...items[0],
        id: "item-2",
        amount: 850,
      },
    ];

    order.updateItems({ occurredAt, items: updatedItems });

    expect(order.items).toBe(updatedItems);
    expect(order.totalAmount).toBe(850);
    expect(order.history).toEqual([
      {
        type: "order_items_updated",
        occurredAt,
        items: updatedItems,
      },
    ]);
  });

  it("requires at least one order item when updating items", () => {
    const order = createOrder();

    expect(() =>
      order.updateItems({ items: [] as unknown as OrderItems }),
    ).toThrow("An order must have at least one order item.");
  });

  it("updates status and payment status with events", () => {
    const order = createOrder();
    const statusOccurredAt = new Date("2026-09-15T14:00:00.000Z");
    const paymentOccurredAt = new Date("2026-09-15T15:00:00.000Z");

    order.updateStatus({
      occurredAt: statusOccurredAt,
      status: OrderStatus.ReadyForDelivery,
    });
    order.updatePaymentStatus({
      occurredAt: paymentOccurredAt,
      paymentStatus: PaymentStatus.Paid,
    });

    expect(order.status).toBe(OrderStatus.ReadyForDelivery);
    expect(order.paymentStatus).toBe(PaymentStatus.Paid);
    expect(order.history).toEqual([
      {
        type: "order_status_updated",
        occurredAt: statusOccurredAt,
        status: OrderStatus.ReadyForDelivery,
      },
      {
        type: "order_payment_status_updated",
        occurredAt: paymentOccurredAt,
        paymentStatus: PaymentStatus.Paid,
      },
    ]);
  });

  it("cancels an order through a status update event", () => {
    const order = createOrder();
    const occurredAt = new Date("2026-09-15T16:00:00.000Z");

    order.cancel({ occurredAt });

    expect(order.status).toBe(OrderStatus.Cancelled);
    expect(order.isCancelled).toBe(true);
    expect(order.history).toEqual([
      {
        type: "order_status_updated",
        occurredAt,
        status: OrderStatus.Cancelled,
      },
    ]);
  });

  it("does not cancel delivered or already cancelled orders", () => {
    const deliveredOrder = createOrder();
    deliveredOrder.updateStatus({ status: OrderStatus.Delivered });

    expect(() => deliveredOrder.cancel()).toThrow(
      "Delivered order order-1 cannot be cancelled.",
    );

    const cancelledOrder = createOrder();
    cancelledOrder.cancel();

    expect(() => cancelledOrder.cancel()).toThrow(
      "Order order-1 is already cancelled.",
    );
  });
});

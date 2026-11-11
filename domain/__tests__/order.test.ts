import { Order } from "../order";
import { OrderItem, type OrderItems } from "../order-item";
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
    status: OrderItem.Status.Created,
    amountOwing: 700,
    amountPaid: 0,
    measurements,
    inspirationPhotos: [photo],
  },
];

function createOrder(orderItems: OrderItems = items) {
  return new Order({
    id: "order-1",
    customerId: "customer-1",
    items: orderItems,
    expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
    paymentStatus: PaymentStatus.Unpaid,
    deliveryAddress: address,
    history: [],
  });
}

describe("Order", () => {
  it.each<[OrderItem.Status, Order.Status]>([
    [OrderItem.Status.Created, Order.Status.Created],
    [OrderItem.Status.InProgress, Order.Status.InProgress],
    [OrderItem.Status.ReadyForDelivery, Order.Status.ReadyForDelivery],
    [OrderItem.Status.InDelivery, Order.Status.InDelivery],
    [OrderItem.Status.Delivered, Order.Status.Delivered],
    [OrderItem.Status.Cancelled, Order.Status.Cancelled],
  ])("derives %s item status as %s order status", (itemStatus, expectedStatus) => {
    const order = createOrder([
      { ...items[0], status: itemStatus },
      { ...items[0], id: "item-2", status: itemStatus },
    ]);

    expect(order.status).toBe(expectedStatus);
  });

  it.each<[OrderItem.Status, OrderItem.Status, Order.Status]>([
    [OrderItem.Status.Created, OrderItem.Status.InProgress, Order.Status.InProgress],
    [OrderItem.Status.Created, OrderItem.Status.Delivered, Order.Status.InProgress],
    [OrderItem.Status.InProgress, OrderItem.Status.ReadyForDelivery, Order.Status.InProgress],
    [OrderItem.Status.ReadyForDelivery, OrderItem.Status.InDelivery, Order.Status.ReadyForDelivery],
    [OrderItem.Status.ReadyForDelivery, OrderItem.Status.Delivered, Order.Status.ReadyForDelivery],
    [OrderItem.Status.InDelivery, OrderItem.Status.Delivered, Order.Status.InDelivery],
  ])("combines %s and %s items as %s", (firstStatus, secondStatus, expectedStatus) => {
    const firstItem = { ...items[0], status: firstStatus };
    const secondItem = { ...items[0], id: "item-2", status: secondStatus };

    expect(createOrder([firstItem, secondItem]).status).toBe(expectedStatus);
    expect(createOrder([secondItem, firstItem]).status).toBe(expectedStatus);
  });

  it.each<[OrderItem.Status, Order.Status]>([
    [OrderItem.Status.Created, Order.Status.Created],
    [OrderItem.Status.InProgress, Order.Status.InProgress],
    [OrderItem.Status.ReadyForDelivery, Order.Status.ReadyForDelivery],
    [OrderItem.Status.InDelivery, Order.Status.InDelivery],
    [OrderItem.Status.Delivered, Order.Status.Delivered],
  ])("excludes cancelled items when deriving %s as %s", (itemStatus, expectedStatus) => {
    const order = createOrder([
      { ...items[0], status: itemStatus },
      { ...items[0], id: "item-2", status: OrderItem.Status.Cancelled },
    ]);

    expect(order.status).toBe(expectedStatus);
    expect(order.isCancelled).toBe(false);
  });

  it("prevents directly assigning an order status", () => {
    const order = createOrder();

    expect(Reflect.set(order, "status", Order.Status.Cancelled)).toBe(false);
    expect(order.status).toBe(Order.Status.Created);
  });

  it("requires at least one item when constructing an order", () => {
    expect(() => createOrder([] as unknown as OrderItems)).toThrow(
      "An order must have at least one order item.",
    );
  });

  it("calculates total amount from order items", () => {
    const order = new Order({
      id: "order-1",
      customerId: "customer-1",
      items: [
        items[0],
        {
          ...items[0],
          id: "item-2",
          amountOwing: 250,
        },
      ],
      expectedDueDate: new Date("2026-10-01T10:00:00.000Z"),
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
        amountOwing: 850,
        status: OrderItem.Status.InProgress,
      },
    ];

    order.updateItems({ occurredAt, items: updatedItems });

    expect(order.items).toBe(updatedItems);
    expect(order.totalAmount).toBe(850);
    expect(order.status).toBe(Order.Status.InProgress);
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

  it("updates payment status with an event", () => {
    const order = createOrder();
    const occurredAt = new Date("2026-09-15T15:00:00.000Z");

    order.updatePaymentStatus({ occurredAt, paymentStatus: PaymentStatus.Paid });

    expect(order.paymentStatus).toBe(PaymentStatus.Paid);
    expect(order.history).toEqual([
      {
        type: "order_payment_status_updated",
        occurredAt,
        paymentStatus: PaymentStatus.Paid,
      },
    ]);
  });

  it("cancels every item and records cancellation without modifying earlier item snapshots", () => {
    const previousItems: OrderItems = [
      { ...items[0], status: OrderItem.Status.InProgress },
      { ...items[0], id: "item-2", status: OrderItem.Status.Created },
      { ...items[0], id: "item-3", status: OrderItem.Status.Delivered },
      { ...items[0], id: "item-4", status: OrderItem.Status.Cancelled },
    ];
    const order = createOrder(previousItems);
    const occurredAt = new Date("2026-09-15T16:00:00.000Z");

    order.cancel({ occurredAt });

    expect(order.items.map((item) => item.status)).toEqual([
      OrderItem.Status.Cancelled,
      OrderItem.Status.Cancelled,
      OrderItem.Status.Cancelled,
      OrderItem.Status.Cancelled,
    ]);
    expect(previousItems.map((item) => item.status)).toEqual([
      OrderItem.Status.InProgress,
      OrderItem.Status.Created,
      OrderItem.Status.Delivered,
      OrderItem.Status.Cancelled,
    ]);
    expect(order.status).toBe(Order.Status.Cancelled);
    expect(order.isCancelled).toBe(true);
    expect(order.isCompleted).toBe(false);
    expect(order.history).toEqual([
      { type: "order_cancelled", occurredAt, items: order.items },
    ]);
  });

  it("does not cancel delivered or already cancelled orders", () => {
    const deliveredOrder = createOrder([
      { ...items[0], status: OrderItem.Status.Delivered },
    ]);

    expect(() => deliveredOrder.cancel()).toThrow(
      "Delivered order cannot be cancelled.",
    );

    expect(deliveredOrder.isCompleted).toBe(true);
    expect(deliveredOrder.items[0].status).toBe(OrderItem.Status.Delivered);
    expect(deliveredOrder.history).toEqual([]);

    const cancelledOrder = createOrder();
    cancelledOrder.cancel();

    expect(() => cancelledOrder.cancel()).toThrow(
      "Order is already cancelled.",
    );
    expect(cancelledOrder.history).toHaveLength(1);
  });
});

import type { Address } from "./address";
import type { OrderUpdateFields } from "./order-event";
import { OrderItem, type OrderItems } from "./order-item";
import type { PaymentMethod } from "./payment";
import { PaymentStatus } from "./payment";
import type { OrderEvent } from "./order-event";

export { PaymentStatus } from "./payment";
export type { PaymentMethod } from "./payment";

export class Order {
  readonly id: string | undefined;
  readonly customerId: string;
  notes?: string;
  items: Order.Items;
  expectedDueDate: Date;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryAddress: Address;
  history: OrderEvent[];

  constructor(props: Order.ConstructorArgs) {
    if (props.items.length === 0) {
      throw new Error("An order must have at least one order item.");
    }

    this.id = props.id ?? undefined;
    this.customerId = props.customerId;
    this.notes = props.notes;
    this.items = props.items;
    this.expectedDueDate = props.expectedDueDate;
    this.paymentStatus = props.paymentStatus;
    this.paymentMethod = props.paymentMethod;
    this.deliveryAddress = props.deliveryAddress;
    this.history = props.history;
  }

  get totalAmount() {
    return this.items.reduce((total, item) => total + item.amountOwing, 0);
  }

  get status(): Order.Status {
    if (this.items.every(item => item.status === OrderItem.Status.Cancelled)) {
      return Order.Status.Cancelled;
    }

    if (this.items.every(item => item.status === OrderItem.Status.Delivered)) {
      return Order.Status.Delivered;
    }

    if (this.items.every(item => item.status === OrderItem.Status.InDelivery)) {
      return Order.Status.InDelivery;
    }

    if (this.items.every(item => item.status === OrderItem.Status.ReadyForDelivery)) {
      return Order.Status.ReadyForDelivery;
    }

    if (this.items.every(item => item.status === OrderItem.Status.Created)) {
      return Order.Status.Created;
    }

    return Order.Status.InProgress
  }

  get isCompleted() {
    return this.status === Order.Status.Delivered;
  }

  get isCancelled() {
    return this.status === Order.Status.Cancelled;
  }

  cancel(props: Order.CancelArgs = {}) {
    if (this.isCancelled) {
      throw new Error(`Order is already cancelled.`);
    }

    if (this.isCompleted) {
      throw new Error(`Delivered order cannot be cancelled.`);
    }

    this.items = this.items.map((item) => ({
      ...item,
      status: OrderItem.Status.Cancelled,
    })) as Order.Items;
    this.history.push({
      type: "order_cancelled",
      occurredAt: props.occurredAt ?? new Date(),
      items: this.items,
    });
  }

  update(props: Order.UpdateArgs) {
    if (Object.keys(props.updates).length === 0) {
      throw new Error("An order update must include at least one changed field.");
    }

    if ("notes" in props.updates) {
      this.notes = props.updates.notes;
    }

    if (props.updates.expectedDueDate !== undefined) {
      this.expectedDueDate = props.updates.expectedDueDate;
    }

    if ("paymentMethod" in props.updates) {
      this.paymentMethod = props.updates.paymentMethod;
    }

    if (props.updates.deliveryAddress !== undefined) {
      this.deliveryAddress = props.updates.deliveryAddress;
    }

    this.history.push(
      {
        type: "order_updated",
        occurredAt: props.occurredAt ?? new Date(),
        updates: props.updates,
      },
    );
  }

  updateItems(props: Order.UpdateItemsArgs) {
    if (props.items.length === 0) {
      throw new Error("An order must have at least one order item.");
    }

    this.items = props.items;
    this.history.push(
      {
        type: "order_items_updated",
        occurredAt: props.occurredAt ?? new Date(),
        items: props.items,
      },
    );
  }

  updatePaymentStatus(props: Order.UpdatePaymentStatusArgs) {
    this.paymentStatus = props.paymentStatus;
    this.history.push(
      {
        type: "order_payment_status_updated",
        occurredAt: props.occurredAt ?? new Date(),
        paymentStatus: props.paymentStatus,
      },
    );
  }
}

export namespace Order {
  export enum Status {
    Created = "created",
    InProgress = "in_progress",
    ReadyForDelivery = "ready_for_delivery",
    InDelivery = "in_delivery",
    Delivered = "delivered",
    Cancelled = "cancelled",
  }

  export type Items = OrderItems;

  export type CreateArgs = {
    customerId: string;
    notes?: string;
    items: Items;
    expectedDueDate: Date;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    deliveryAddress: Address;
    occurredAt?: Date;
  };

  export type ConstructorArgs = {
    id?: string;
    customerId: string;
    notes?: string;
    items: Items;
    expectedDueDate: Date;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    deliveryAddress: Address;
    history: OrderEvent[];
  };

  export type CancelArgs = {
    occurredAt?: Date;
  };

  export type UpdateArgs = {
    occurredAt?: Date;
    updates: OrderUpdateFields;
  };

  export type UpdateItemsArgs = {
    occurredAt?: Date;
    items: Items;
  };

  export type UpdatePaymentStatusArgs = {
    occurredAt?: Date;
    paymentStatus: PaymentStatus;
  };
}

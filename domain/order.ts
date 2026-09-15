import type { Address } from "./address";
import type { OrderUpdateFields } from "./order-event";
import type { OrderItems } from "./order-item";
import { OrderStatus } from "./order-status";
import type { PaymentMethod } from "./payment";
import { PaymentStatus } from "./payment";
import type { OrderEvent } from "./order-event";

export { OrderStatus } from "./order-status";
export { PaymentStatus } from "./payment";
export type { PaymentMethod } from "./payment";

export class Order {
  readonly id: string;
  readonly customerId: string;
  notes?: string;
  items: Order.Items;
  expectedDueDate: Date;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryAddress: Address;
  history: OrderEvent[];

  constructor(props: Order.ConstructorArgs) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.notes = props.notes;
    this.items = props.items;
    this.expectedDueDate = props.expectedDueDate;
    this.status = props.status;
    this.paymentStatus = props.paymentStatus;
    this.paymentMethod = props.paymentMethod;
    this.deliveryAddress = props.deliveryAddress;
    this.history = props.history;
  }

  get totalAmount() {
    return this.items.reduce((total, item) => total + item.amount, 0);
  }

  get isCompleted() {
    return this.status === OrderStatus.Delivered;
  }

  get isCancelled() {
    return this.status === OrderStatus.Cancelled;
  }

  cancel(props: Order.CancelArgs = {}) {
    if (this.isCancelled) {
      throw new Error(`Order ${this.id} is already cancelled.`);
    }

    if (this.isCompleted) {
      throw new Error(`Delivered order ${this.id} cannot be cancelled.`);
    }

    this.updateStatus({ status: OrderStatus.Cancelled, occurredAt: props.occurredAt });
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

  updateStatus(props: Order.UpdateStatusArgs) {
    this.status = props.status;
    this.history.push(
      {
        type: "order_status_updated",
        occurredAt: props.occurredAt ?? new Date(),
        status: props.status,
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
  export type Items = OrderItems;

  export type ConstructorArgs = {
    id: string;
    customerId: string;
    notes?: string;
    items: Items;
    expectedDueDate: Date;
    status: OrderStatus;
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

  export type UpdateStatusArgs = {
    occurredAt?: Date;
    status: OrderStatus;
  };

  export type UpdatePaymentStatusArgs = {
    occurredAt?: Date;
    paymentStatus: PaymentStatus;
  };
}

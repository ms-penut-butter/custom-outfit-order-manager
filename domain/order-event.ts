import type { Address } from "./address";
import type { OrderItems } from "./order-item";
import type { Order } from "./order";
import type { PaymentMethod, PaymentStatus } from "./payment";

export type OrderEventBase<TType extends string> = {
  readonly type: TType;
  readonly occurredAt: Date;
};

export type OrderCreated = OrderEventBase<"order_created"> & {
  readonly customerId: string;
  readonly notes?: string;
  readonly items: OrderItems;
  readonly expectedDueDate: Date;
  readonly status: Order.Status;
  readonly paymentStatus: PaymentStatus;
  readonly paymentMethod?: PaymentMethod;
  readonly deliveryAddress: Address;
};

export type OrderUpdateFields = {
  readonly notes?: string;
  readonly expectedDueDate?: Date;
  readonly paymentMethod?: PaymentMethod;
  readonly deliveryAddress?: Address;
};

export type OrderUpdated = OrderEventBase<"order_updated"> & {
  readonly updates: OrderUpdateFields;
};

export type OrderItemsUpdated = OrderEventBase<"order_items_updated"> & {
  readonly items: OrderItems;
};

export type OrderCancelled = OrderEventBase<"order_cancelled"> & {
  readonly items: OrderItems;
};

export type OrderPaymentStatusUpdated =
  OrderEventBase<"order_payment_status_updated"> & {
  readonly paymentStatus: PaymentStatus;
};

export type OrderEvent =
  | OrderCreated
  | OrderUpdated
  | OrderItemsUpdated
  | OrderCancelled
  | OrderPaymentStatusUpdated;

import type { Address } from "./address";
import type { BodyMeasurements } from "./body-measurements";
import { Order } from "./order";
import type { OrderItems } from "./order-item";
import { OrderStatus } from "./order-status";
import type { PaymentMethod } from "./payment";
import { PaymentStatus } from "./payment";
import type { Photo } from "./photo";


export class Customer {
  readonly id: string;
  name: string;
  phoneNumber: string;
  photo: Photo;
  address: Address;
  bodyMeasurements: BodyMeasurements;
  readonly orders: Order[];

  constructor(props: Customer.ConstructorArgs) {
    this.id = props.id;
    this.name = props.name;
    this.phoneNumber = props.phoneNumber;
    this.photo = props.photo;
    this.address = props.address;
    this.bodyMeasurements = props.bodyMeasurements;
    this.orders = props.orders;
  }

  get activeOrders() {
    return this.orders.filter((order) => !order.isCompleted && !order.isCancelled);
  }

  get totalAmountOwing() {
    return this.activeOrders.reduce((total, order) => total + order.totalAmount, 0);
  }

  update(props: Customer.UpdateArgs) {
    if (Object.keys(props).length === 0) {
      throw new Error("A customer update must include at least one changed field.");
    }

    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.phoneNumber !== undefined) {
      this.phoneNumber = props.phoneNumber;
    }

    if (props.photo !== undefined) {
      this.photo = props.photo;
    }

    if (props.address !== undefined) {
      this.address = props.address;
    }

    if (props.bodyMeasurements !== undefined) {
      this.bodyMeasurements = props.bodyMeasurements;
    }
  }

  createOrder(props: Customer.CreateOrderArgs) {
    if (props.items.length === 0) {
      throw new Error("An order must have at least one order item.");
    }

    const status = OrderStatus.Created;
    const paymentStatus = props.paymentStatus ?? PaymentStatus.Unpaid;
    const occurredAt = props.occurredAt ?? new Date();

    const order = new Order({
      id: props.id,
      customerId: this.id,
      notes: props.notes,
      items: props.items,
      expectedDueDate: props.expectedDueDate,
      status,
      paymentStatus,
      paymentMethod: props.paymentMethod,
      deliveryAddress: props.deliveryAddress,
      history: [
        {
          type: "order_created",
          occurredAt,
          customerId: this.id,
          notes: props.notes,
          items: props.items,
          expectedDueDate: props.expectedDueDate,
          status,
          paymentStatus,
          paymentMethod: props.paymentMethod,
          deliveryAddress: props.deliveryAddress,
        },
      ],
    });

    this.orders.push(order);

    return order;
  }

  getOrder(orderId: string) {
    const order = this.orders.find((order) => order.id === orderId);

    if (!order) {
      throw new Error(`Order ${orderId} was not found for customer ${this.id}.`);
    }

    return order;
  }
}

export namespace Customer {
  export type ConstructorArgs = {
    id: string;
    name: string;
    phoneNumber: string;
    photo: Photo;
    address: Address;
    bodyMeasurements: BodyMeasurements;
    orders: Order[];
  };

  export type CreateOrderArgs = {
    id: string;
    notes?: string;
    items: OrderItems;
    expectedDueDate: Date;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    deliveryAddress: Address;
    occurredAt?: Date;
  };

  export type UpdateArgs = {
    name?: string;
    phoneNumber?: string;
    photo?: Photo;
    address?: Address;
    bodyMeasurements?: BodyMeasurements;
  };

  export type CancelOrderArgs = {
    orderId: string;
    occurredAt?: Date;
  };
}

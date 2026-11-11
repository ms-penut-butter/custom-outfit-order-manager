import type { BodyMeasurements } from "./body-measurements";
import type { Photo } from "./photo";

export type OrderItem = {
  readonly id: string;
  readonly title: string;
  readonly status: OrderItem.Status;
  readonly notes?: string;
  readonly amountOwing: number;
  readonly amountPaid: number;
  readonly measurements: BodyMeasurements;
  readonly inspirationPhotos: Photo[];
};

export type OrderItems = [OrderItem, ...OrderItem[]];

export namespace OrderItem {
  export enum Status {
    Created = "created",
    InProgress = "in_progress",
    ReadyForDelivery = "ready_for_delivery",
    InDelivery = "in_delivery",
    Delivered = "delivered",
    Cancelled = "cancelled",
  }
}

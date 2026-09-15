import type { BodyMeasurements } from "./body-measurements";
import type { Photo } from "./photo";

export type OrderItem = {
  readonly id: string;
  readonly title: string;
  readonly notes?: string;
  readonly amount: number;
  readonly measurements: BodyMeasurements;
  readonly inspirationPhotos: Photo[];
};

export type OrderItems = [OrderItem, ...OrderItem[]];

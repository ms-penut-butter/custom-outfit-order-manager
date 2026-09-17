import { Customer } from "@/domain/customer";
import {
  createInitialOrderItemFormModel,
  type OrderItemFormModel,
} from "./create-order-form-model";

export function toNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMeasurement(value?: number) {
  return value === undefined ? "" : String(value);
}

export function createOrderItemFormForCustomer(
  id: string,
  customer: Customer,
): OrderItemFormModel {
  return {
    ...createInitialOrderItemFormModel(id),
    unit: customer.bodyMeasurements.unit,
    chest: formatMeasurement(customer.bodyMeasurements.chest),
    waist: formatMeasurement(customer.bodyMeasurements.waist),
    hip: formatMeasurement(customer.bodyMeasurements.hip),
    shoulder: formatMeasurement(customer.bodyMeasurements.shoulder),
    sleeveLength: formatMeasurement(customer.bodyMeasurements.sleeveLength),
    inseam: formatMeasurement(customer.bodyMeasurements.inseam),
    neck: formatMeasurement(customer.bodyMeasurements.neck),
    height: formatMeasurement(customer.bodyMeasurements.height),
  };
}

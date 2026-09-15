export type CustomerFormModel = {
  name: string;
  phoneNumber: string;
  streetLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  unit: "in" | "cm";
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeveLength: string;
  inseam: string;
  neck: string;
  height: string;
};

export type CreateOrderFormModel = {
  customerId: string;
  notes: string;
  expectedDueDate: string;
  deliveryStreetLine1: string;
  deliveryCity: string;
  deliveryStateOrProvince: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  items: OrderItemFormModel[];
};

export type OrderItemFormModel = {
  id: string;
  title: string;
  amount: string;
  inspirationPhotoUrl: string;
  unit: "in" | "cm";
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeveLength: string;
  inseam: string;
  neck: string;
  height: string;
};

export function createInitialCustomerFormModel(): CustomerFormModel {
  return {
    name: "",
    phoneNumber: "",
    streetLine1: "",
    city: "",
    stateOrProvince: "",
    postalCode: "",
    country: "Canada",
    unit: "in",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeveLength: "",
    inseam: "",
    neck: "",
    height: "",
  };
}

export function createInitialOrderFormModel(): CreateOrderFormModel {
  return {
    customerId: "",
    notes: "",
    expectedDueDate: "",
    deliveryStreetLine1: "",
    deliveryCity: "",
    deliveryStateOrProvince: "",
    deliveryPostalCode: "",
    deliveryCountry: "Canada",
    items: [createInitialOrderItemFormModel("order-item-1")],
  };
}

export function createInitialOrderItemFormModel(
  id: string,
): OrderItemFormModel {
  return {
    id,
    title: "",
    amount: "",
    inspirationPhotoUrl: "",
    unit: "in",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeveLength: "",
    inseam: "",
    neck: "",
    height: "",
  };
}

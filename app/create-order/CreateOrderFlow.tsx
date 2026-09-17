"use client";

import { FormEvent, useMemo, useState } from "react";
import { Customer } from "@/domain/customer";
import type { OrderItems } from "@/domain/order-item";
import { CreateOrderStepper } from "./CreateOrderStepper";
import { CustomerStep } from "./CustomerStep";
import { OrderDetailsStep } from "./OrderDetailsStep";
import { OrderItemsStep } from "./OrderItemsStep";
import { ReviewOrderStep } from "./ReviewOrderStep";
import {
  createInitialOrderFormModel,
  type CustomerFormModel,
  type CreateOrderFormModel,
  type OrderItemFormModel,
} from "./create-order-form-model";
import { createOrderItemFormForCustomer, toNumber } from "./create-order-mappers";

export function CreateOrderFlow() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeStep, setActiveStep] =
    useState<CreateOrderStepper.Step>("customer");
  const [orderForm, setOrderForm] = useState<CreateOrderFormModel>(
    createInitialOrderFormModel,
  );
  const [createdOrderId, setCreatedOrderId] = useState("");
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === orderForm.customerId),
    [customers, orderForm.customerId],
  );

  function selectCustomer(customerId: string) {
    const customer = customers.find((existingCustomer) => {
      return existingCustomer.id === customerId;
    });

    if (!customer) {
      return;
    }

    setOrderForm((current) =>
      CreateOrderFlow.createOrderFormForCustomer(customer, current),
    );
  }

  function saveOrderDetails(detailsForm: OrderDetailsStep.FormModel) {
    setOrderForm((current) => ({
      ...current,
      notes: detailsForm.notes,
      expectedDueDate: detailsForm.expectedDueDate,
      deliveryStreetLine1: detailsForm.deliveryStreetLine1,
      deliveryCity: detailsForm.deliveryCity,
      deliveryStateOrProvince: detailsForm.deliveryStateOrProvince,
      deliveryPostalCode: detailsForm.deliveryPostalCode,
      deliveryCountry: detailsForm.deliveryCountry,
    }));
    goToNextStep("details");
  }

  function saveOrderItems(items: OrderItemFormModel[]) {
    setOrderForm((current) => ({
      ...current,
      items,
    }));
    goToNextStep("items");
  }

  function goToStep(step: CreateOrderStepper.Step) {
    if (step !== "customer" && !selectedCustomer) {
      setActiveStep("customer");
      return;
    }

    setActiveStep(step);
  }

  function goToNextStep(currentStep: CreateOrderStepper.Step) {
    setActiveStep(CreateOrderFlow.getNextStep(currentStep));
  }

  function goToPreviousStep(currentStep: CreateOrderStepper.Step) {
    setActiveStep(CreateOrderFlow.getPreviousStep(currentStep));
  }

  function createCustomer(customerForm: CustomerFormModel) {
    const customer = new Customer({
      id: crypto.randomUUID(),
      name: customerForm.name,
      phoneNumber: customerForm.phoneNumber,
      photo: {
        id: crypto.randomUUID(),
        url: "",
      },
      address: CreateOrderFlow.createAddress(
        customerForm.streetLine1,
        customerForm.city,
        customerForm.stateOrProvince,
        customerForm.postalCode,
        customerForm.country,
      ),
      bodyMeasurements:
        CreateOrderFlow.createMeasurementsFromCustomerForm(customerForm),
      orders: [],
    });

    setCustomers((current) => [...current, customer]);
    setOrderForm((current) =>
      CreateOrderFlow.createOrderFormForCustomer(customer, current),
    );
    goToNextStep("customer");
  }

  function continueWithSelectedCustomer() {
    if (!selectedCustomer) {
      return;
    }

    goToNextStep("customer");
  }

  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCustomer) {
      setActiveStep("customer");
      return;
    }

    const orderItems = orderForm.items.map((item) => {
      return {
        id: crypto.randomUUID(),
        title: item.title,
        amount: toNumber(item.amount),
        measurements: CreateOrderFlow.createMeasurementsFromOrderItem(item),
        inspirationPhotos: item.inspirationPhotoUrl
          ? [
              {
                id: crypto.randomUUID(),
                url: item.inspirationPhotoUrl,
              },
            ]
          : [],
      };
    }) as OrderItems;

    const order = selectedCustomer.createOrder({
      id: `ORD-${Date.now()}`,
      notes: orderForm.notes || undefined,
      items: orderItems,
      expectedDueDate: new Date(`${orderForm.expectedDueDate}T12:00:00`),
      deliveryAddress: CreateOrderFlow.createAddress(
        orderForm.deliveryStreetLine1,
        orderForm.deliveryCity,
        orderForm.deliveryStateOrProvince,
        orderForm.deliveryPostalCode,
        orderForm.deliveryCountry,
      ),
    });

    setCustomers((current) => [...current]);
    setCreatedOrderId(order.id);
  }

  return (
    <section className="formLayout">
      <CreateOrderStepper
        activeStep={activeStep}
        onStepChange={goToStep}
        selectedCustomer={selectedCustomer}
      />

      {activeStep === "customer" ? (
        <CustomerStep
          customers={customers}
          onContinueWithSelectedCustomer={continueWithSelectedCustomer}
          onCreateCustomer={createCustomer}
          onSelectCustomer={selectCustomer}
          orderForm={orderForm}
          selectedCustomer={selectedCustomer}
        />
      ) : null}

      {activeStep === "details" ? (
        <OrderDetailsStep
          initialForm={OrderDetailsStep.createInitialForm(orderForm)}
          onBack={() => goToPreviousStep("details")}
          onContinue={saveOrderDetails}
        />
      ) : null}

      {activeStep === "items" ? (
        <OrderItemsStep
          initialItems={orderForm.items}
          onBack={() => goToPreviousStep("items")}
          onContinue={saveOrderItems}
          selectedCustomer={selectedCustomer}
        />
      ) : null}

      {activeStep === "review" ? (
        <ReviewOrderStep
          createdOrderId={createdOrderId}
          onBack={() => goToPreviousStep("review")}
          onCreateOrder={createOrder}
          orderForm={orderForm}
          selectedCustomer={selectedCustomer}
        />
      ) : null}
    </section>
  );
}

export namespace CreateOrderFlow {
  export const StepOrder: CreateOrderStepper.Step[] = [
    "customer",
    "details",
    "items",
    "review",
  ];

  export function getNextStep(
    currentStep: CreateOrderStepper.Step,
  ): CreateOrderStepper.Step {
    const currentIndex = StepOrder.indexOf(currentStep);
    return StepOrder[Math.min(currentIndex + 1, StepOrder.length - 1)];
  }

  export function getPreviousStep(
    currentStep: CreateOrderStepper.Step,
  ): CreateOrderStepper.Step {
    const currentIndex = StepOrder.indexOf(currentStep);
    return StepOrder[Math.max(currentIndex - 1, 0)];
  }

  export function createAddress(
    streetLine1: string,
    city: string,
    stateOrProvince: string,
    postalCode: string,
    country: string,
  ) {
    return {
      streetLine1,
      city,
      stateOrProvince,
      postalCode,
      country,
    };
  }

  export function createMeasurementsFromCustomerForm(
    customerForm: CustomerFormModel,
  ) {
    return {
      unit: customerForm.unit,
      chest: customerForm.chest ? toNumber(customerForm.chest) : undefined,
      waist: customerForm.waist ? toNumber(customerForm.waist) : undefined,
      hip: customerForm.hip ? toNumber(customerForm.hip) : undefined,
      shoulder: customerForm.shoulder
        ? toNumber(customerForm.shoulder)
        : undefined,
      sleeveLength: customerForm.sleeveLength
        ? toNumber(customerForm.sleeveLength)
        : undefined,
      inseam: customerForm.inseam ? toNumber(customerForm.inseam) : undefined,
      neck: customerForm.neck ? toNumber(customerForm.neck) : undefined,
      height: customerForm.height ? toNumber(customerForm.height) : undefined,
    };
  }

  export function createMeasurementsFromOrderItem(
    orderItem: OrderItemFormModel,
  ) {
    return {
      unit: orderItem.unit,
      chest: orderItem.chest ? toNumber(orderItem.chest) : undefined,
      waist: orderItem.waist ? toNumber(orderItem.waist) : undefined,
      hip: orderItem.hip ? toNumber(orderItem.hip) : undefined,
      shoulder: orderItem.shoulder ? toNumber(orderItem.shoulder) : undefined,
      sleeveLength: orderItem.sleeveLength
        ? toNumber(orderItem.sleeveLength)
        : undefined,
      inseam: orderItem.inseam ? toNumber(orderItem.inseam) : undefined,
      neck: orderItem.neck ? toNumber(orderItem.neck) : undefined,
      height: orderItem.height ? toNumber(orderItem.height) : undefined,
    };
  }

  export function createOrderFormForCustomer(
    customer: Customer,
    currentForm: CreateOrderFormModel = createInitialOrderFormModel(),
  ): CreateOrderFormModel {
    return {
      ...currentForm,
      customerId: customer.id,
      deliveryStreetLine1: customer.address.streetLine1,
      deliveryCity: customer.address.city,
      deliveryStateOrProvince: customer.address.stateOrProvince,
      deliveryPostalCode: customer.address.postalCode,
      deliveryCountry: customer.address.country,
      items: currentForm.items.map((item) => ({
        ...createOrderItemFormForCustomer(item.id, customer),
        title: item.title,
        amount: item.amount,
        inspirationPhotoUrl: item.inspirationPhotoUrl,
      })),
    };
  }
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Address } from "@/domain/address";
import type { BodyMeasurements } from "@/domain/body-measurements";
import { Customer } from "@/domain/customer";
import type { OrderItems } from "@/domain/order-item";
import { Modal } from "../components/Modal";
import {
  createInitialOrderItemFormModel,
  createInitialCustomerFormModel,
  createInitialOrderFormModel,
  type CustomerFormModel,
  type CreateOrderFormModel,
  type OrderItemFormModel,
} from "./create-order-form-model";

function toNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function createAddress(
  streetLine1: string,
  city: string,
  stateOrProvince: string,
  postalCode: string,
  country: string,
): Address {
  return {
    streetLine1,
    city,
    stateOrProvince,
    postalCode,
    country,
  };
}

function formatMeasurement(value?: number) {
  return value === undefined ? "" : String(value);
}

function createMeasurementsFromOrderItem(
  orderItem: OrderItemFormModel,
): BodyMeasurements {
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

function createOrderItemFormForCustomer(
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

function createOrderFormForCustomer(
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

export function CreateOrderFlow() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(true);
  const [isMeasurementsVisible, setIsMeasurementsVisible] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerFormModel>(
    createInitialCustomerFormModel,
  );
  const [orderForm, setOrderForm] = useState<CreateOrderFormModel>(
    createInitialOrderFormModel,
  );
  const [createdOrderId, setCreatedOrderId] = useState("");
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === orderForm.customerId),
    [customers, orderForm.customerId],
  );

  function updateOrderForm(field: keyof CreateOrderFormModel, value: string) {
    setOrderForm((current) => ({ ...current, [field]: value }));
  }

  function updateCustomerForm(field: keyof CustomerFormModel, value: string) {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  }

  function selectCustomer(customerId: string) {
    const customer = customers.find((existingCustomer) => {
      return existingCustomer.id === customerId;
    });

    if (!customer) {
      return;
    }

    setOrderForm((current) => createOrderFormForCustomer(customer, current));
  }

  function updateOrderItem(
    itemId: string,
    field: keyof Omit<OrderItemFormModel, "id" | "unit">,
    value: string,
  ) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addOrderItem() {
    setOrderForm((current) => ({
      ...current,
      items: [
        ...current.items,
        selectedCustomer
          ? createOrderItemFormForCustomer(crypto.randomUUID(), selectedCustomer)
          : createInitialOrderItemFormModel(crypto.randomUUID()),
      ],
    }));
  }

  function updateOrderItemUnit(
    itemId: string,
    unit: OrderItemFormModel["unit"],
  ) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, unit } : item,
      ),
    }));
  }

  function removeOrderItem(itemId: string) {
    setOrderForm((current) => {
      if (current.items.length === 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      };
    });
  }

  function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bodyMeasurements: BodyMeasurements = {
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

    const customer = new Customer({
      id: crypto.randomUUID(),
      name: customerForm.name,
      phoneNumber: customerForm.phoneNumber,
      photo: {
        id: crypto.randomUUID(),
        url: "",
      },
      address: createAddress(
        customerForm.streetLine1,
        customerForm.city,
        customerForm.stateOrProvince,
        customerForm.postalCode,
        customerForm.country,
      ),
      bodyMeasurements,
      orders: [],
    });

    setCustomers((current) => [...current, customer]);
    setOrderForm((current) => createOrderFormForCustomer(customer, current));
    setCustomerForm(createInitialCustomerFormModel());
    setIsMeasurementsVisible(false);
    setIsCustomerModalOpen(false);
  }

  function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCustomer) {
      setIsCustomerModalOpen(true);
      return;
    }

    const orderItems = orderForm.items.map((item) => {
      return {
        id: crypto.randomUUID(),
        title: item.title,
        amount: toNumber(item.amount),
        measurements: createMeasurementsFromOrderItem(item),
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
      deliveryAddress: createAddress(
        orderForm.deliveryStreetLine1,
        orderForm.deliveryCity,
        orderForm.deliveryStateOrProvince,
        orderForm.deliveryPostalCode,
        orderForm.deliveryCountry,
      ),
    });

    setCustomers((current) => [...current]);
    setCreatedOrderId(order.id);
    setOrderForm(createOrderFormForCustomer(selectedCustomer));
  }

  return (
    <>
      <section className="formLayout">
        <aside className="sidePanel">
          <div>
            <h2>Customer</h2>
            <p className="mutedText">
              {selectedCustomer
                ? selectedCustomer.name
                : "Create or select a customer."}
            </p>
          </div>

          <button
            className="secondaryButton"
            onClick={() => setIsCustomerModalOpen(true)}
            type="button"
          >
            Create Customer
          </button>

          {customers.length > 1 ? (
            <label className="field">
              <span>Selected Customer</span>
              <select
                value={orderForm.customerId}
                onChange={(event) => selectCustomer(event.target.value)}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </aside>

        <form className="orderForm" onSubmit={createOrder}>
          <fieldset disabled={!selectedCustomer}>
            <div className="formGrid">
              <label className="field">
                <span>Expected Due Date</span>
                <input
                  required
                  type="date"
                  value={orderForm.expectedDueDate}
                  onChange={(event) =>
                    updateOrderForm("expectedDueDate", event.target.value)
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Notes</span>
              <textarea
                rows={4}
                value={orderForm.notes}
                onChange={(event) => updateOrderForm("notes", event.target.value)}
              />
            </label>

            <div className="sectionHeader formSectionHeader">
              <h2>Delivery Address</h2>
            </div>

            <div className="formGrid">
              <label className="field">
                <span>Street</span>
                <input
                  required
                  value={orderForm.deliveryStreetLine1}
                  onChange={(event) =>
                    updateOrderForm("deliveryStreetLine1", event.target.value)
                  }
                />
              </label>

              <label className="field">
                <span>City</span>
                <input
                  required
                  value={orderForm.deliveryCity}
                  onChange={(event) =>
                    updateOrderForm("deliveryCity", event.target.value)
                  }
                />
              </label>

              <label className="field">
                <span>State / Province</span>
                <input
                  required
                  value={orderForm.deliveryStateOrProvince}
                  onChange={(event) =>
                    updateOrderForm(
                      "deliveryStateOrProvince",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Postal Code</span>
                <input
                  required
                  value={orderForm.deliveryPostalCode}
                  onChange={(event) =>
                    updateOrderForm("deliveryPostalCode", event.target.value)
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Country</span>
              <input
                required
                value={orderForm.deliveryCountry}
                onChange={(event) =>
                  updateOrderForm("deliveryCountry", event.target.value)
                }
              />
            </label>

            <div className="sectionHeader formSectionHeader">
              <h2>Order Items</h2>
              <button className="secondaryButton" onClick={addOrderItem} type="button">
                Add Item
              </button>
            </div>

            <div className="orderItemList">
              {orderForm.items.map((item, index) => (
                <div className="orderItemGroup" key={item.id}>
                  <div className="sectionHeader">
                    <h3>Item {index + 1}</h3>
                    {orderForm.items.length > 1 ? (
                      <button
                        className="secondaryButton"
                        onClick={() => removeOrderItem(item.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="formGrid">
                    <label className="field">
                      <span>Item Title</span>
                      <input
                        required
                        value={item.title}
                        onChange={(event) =>
                          updateOrderItem(item.id, "title", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Amount</span>
                      <input
                        min="0"
                        required
                        step="0.01"
                        type="number"
                        value={item.amount}
                        onChange={(event) =>
                          updateOrderItem(item.id, "amount", event.target.value)
                        }
                      />
                    </label>

                    <label className="field fullWidthField">
                      <span>Inspiration Photo URL</span>
                      <input
                        type="url"
                        value={item.inspirationPhotoUrl}
                        onChange={(event) =>
                          updateOrderItem(
                            item.id,
                            "inspirationPhotoUrl",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="sectionHeader formSectionHeader">
                    <h3>Measurements</h3>
                  </div>

                  <div className="formGrid">
                    <label className="field">
                      <span>Measurement Unit</span>
                      <select
                        value={item.unit}
                        onChange={(event) =>
                          updateOrderItemUnit(
                            item.id,
                            event.target.value as OrderItemFormModel["unit"],
                          )
                        }
                      >
                        <option value="in">Inches</option>
                        <option value="cm">Centimeters</option>
                      </select>
                    </label>

                    <label className="field">
                      <span>Chest</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.chest}
                        onChange={(event) =>
                          updateOrderItem(item.id, "chest", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Waist</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.waist}
                        onChange={(event) =>
                          updateOrderItem(item.id, "waist", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Hip</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.hip}
                        onChange={(event) =>
                          updateOrderItem(item.id, "hip", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Shoulder</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.shoulder}
                        onChange={(event) =>
                          updateOrderItem(item.id, "shoulder", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Sleeve Length</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.sleeveLength}
                        onChange={(event) =>
                          updateOrderItem(
                            item.id,
                            "sleeveLength",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Inseam</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.inseam}
                        onChange={(event) =>
                          updateOrderItem(item.id, "inseam", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Neck</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.neck}
                        onChange={(event) =>
                          updateOrderItem(item.id, "neck", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Height</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.height}
                        onChange={(event) =>
                          updateOrderItem(item.id, "height", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button className="primaryButton" type="submit">
                Create Order
              </button>
            </div>
          </fieldset>

          {createdOrderId ? (
            <p className="successMessage">Created order {createdOrderId}.</p>
          ) : null}
        </form>
      </section>

      {isCustomerModalOpen ? (
        <Modal
          isDismissible={customers.length > 0}
          onClose={() => setIsCustomerModalOpen(false)}
          title="Create Customer"
        >
          <form onSubmit={createCustomer}>
            <div className="modalFormSection">
              <h3>Customer Details</h3>
              <div className="formGrid">
                <label className="field">
                  <span>Name</span>
                  <input
                    required
                    value={customerForm.name}
                    onChange={(event) =>
                      updateCustomerForm("name", event.target.value)
                    }
                  />
                </label>

                <label className="field">
                  <span>Phone Number</span>
                  <input
                    required
                    value={customerForm.phoneNumber}
                    onChange={(event) =>
                      updateCustomerForm("phoneNumber", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className="modalFormSection">
              <h3>Address</h3>
              <div className="formGrid">
                <label className="field">
                  <span>Street</span>
                  <input
                    required
                    value={customerForm.streetLine1}
                    onChange={(event) =>
                      updateCustomerForm("streetLine1", event.target.value)
                    }
                  />
                </label>

                <label className="field">
                  <span>City</span>
                  <input
                    required
                    value={customerForm.city}
                    onChange={(event) =>
                      updateCustomerForm("city", event.target.value)
                    }
                  />
                </label>

                <label className="field">
                  <span>State / Province</span>
                  <input
                    required
                    value={customerForm.stateOrProvince}
                    onChange={(event) =>
                      updateCustomerForm("stateOrProvince", event.target.value)
                    }
                  />
                </label>

                <label className="field">
                  <span>Postal Code</span>
                  <input
                    required
                    value={customerForm.postalCode}
                    onChange={(event) =>
                      updateCustomerForm("postalCode", event.target.value)
                    }
                  />
                </label>

                <label className="field">
                  <span>Country</span>
                  <input
                    required
                    value={customerForm.country}
                    onChange={(event) =>
                      updateCustomerForm("country", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className="modalFormSection">
              <div className="sectionHeader">
                <h3>Measurements</h3>
                {!isMeasurementsVisible ? (
                  <button
                    aria-label="Add measurements"
                    className="iconButton"
                    onClick={() => setIsMeasurementsVisible(true)}
                    type="button"
                  >
                    +
                  </button>
                ) : null}
              </div>

                {isMeasurementsVisible ? (
                  <div className="formGrid">
                    <label className="field">
                      <span>Measurement Unit</span>
                      <select
                        value={customerForm.unit}
                        onChange={(event) =>
                          setCustomerForm((current) => ({
                            ...current,
                            unit: event.target.value as CustomerFormModel["unit"],
                          }))
                        }
                      >
                        <option value="in">Inches</option>
                        <option value="cm">Centimeters</option>
                      </select>
                    </label>

                    <label className="field">
                      <span>Chest</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.chest}
                        onChange={(event) =>
                          updateCustomerForm("chest", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Waist</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.waist}
                        onChange={(event) =>
                          updateCustomerForm("waist", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Hip</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.hip}
                        onChange={(event) =>
                          updateCustomerForm("hip", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Shoulder</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.shoulder}
                        onChange={(event) =>
                          updateCustomerForm("shoulder", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Sleeve Length</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.sleeveLength}
                        onChange={(event) =>
                          updateCustomerForm("sleeveLength", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Inseam</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.inseam}
                        onChange={(event) =>
                          updateCustomerForm("inseam", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Neck</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.neck}
                        onChange={(event) =>
                          updateCustomerForm("neck", event.target.value)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Height</span>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={customerForm.height}
                        onChange={(event) =>
                          updateCustomerForm("height", event.target.value)
                        }
                      />
                    </label>
                  </div>
                ) : null}
              </div>

            <div className="actions">
              <button className="primaryButton" type="submit">
                Save Customer
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

import { FormEvent, useState } from "react";
import type { Customer } from "@/domain/customer";
import type {
  CustomerFormModel,
  CreateOrderFormModel,
} from "./create-order-form-model";
import { createInitialCustomerFormModel } from "./create-order-form-model";

type CustomerStepProps = {
  customers: Customer[];
  onContinueWithSelectedCustomer: () => void;
  onCreateCustomer: (customerForm: CustomerFormModel) => void;
  onSelectCustomer: (customerId: string) => void;
  orderForm: CreateOrderFormModel;
  selectedCustomer?: Customer;
};

export function CustomerStep({
  customers,
  onContinueWithSelectedCustomer,
  onCreateCustomer,
  onSelectCustomer,
  orderForm,
  selectedCustomer,
}: CustomerStepProps) {
  const [customerForm, setCustomerForm] = useState<CustomerFormModel>(
    createInitialCustomerFormModel,
  );
  const [isMeasurementsVisible, setIsMeasurementsVisible] = useState(false);

  function updateCustomerForm(field: keyof CustomerFormModel, value: string) {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  }

  function updateCustomerUnit(unit: CustomerFormModel["unit"]) {
    setCustomerForm((current) => ({ ...current, unit }));
  }

  function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateCustomer(customerForm);
    setCustomerForm(createInitialCustomerFormModel());
  }

  return (
    <div className="orderForm">
      <div className="sectionHeader">
        <div>
          <h2>Customer</h2>
          <p className="mutedText">
            Select an existing customer or create a new one for this order.
          </p>
        </div>
      </div>

      {customers.length > 0 ? (
        <div className="inlinePanel">
          <label className="field">
            <span>Selected Customer</span>
            <select
              value={orderForm.customerId}
              onChange={(event) => onSelectCustomer(event.target.value)}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button
              className="primaryButton"
              disabled={!selectedCustomer}
              onClick={onContinueWithSelectedCustomer}
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

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
                    updateCustomerUnit(
                      event.target.value as CustomerFormModel["unit"],
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
    </div>
  );
}

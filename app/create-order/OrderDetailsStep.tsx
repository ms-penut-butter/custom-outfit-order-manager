import { FormEvent, useState } from "react";
import type { CreateOrderFormModel } from "./create-order-form-model";

type OrderDetailsStepProps = {
  initialForm: OrderDetailsStep.FormModel;
  onBack: () => void;
  onContinue: (form: OrderDetailsStep.FormModel) => void;
};

export function OrderDetailsStep({
  initialForm,
  onBack,
  onContinue,
}: OrderDetailsStepProps) {
  const [form, setForm] = useState<OrderDetailsStep.FormModel>(initialForm);

  function updateForm(field: keyof OrderDetailsStep.FormModel, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function continueToItems(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue(form);
  }

  return (
    <form className="orderForm" onSubmit={continueToItems}>
      <div className="sectionHeader">
        <div>
          <h2>Order Details</h2>
          <p className="mutedText">
            Confirm timing and delivery details before adding items.
          </p>
        </div>
      </div>

      <div className="formGrid">
        <label className="field">
          <span>Expected Due Date</span>
          <input
            required
            type="date"
            value={form.expectedDueDate}
            onChange={(event) =>
              updateForm("expectedDueDate", event.target.value)
            }
          />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) => updateForm("notes", event.target.value)}
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
            value={form.deliveryStreetLine1}
            onChange={(event) =>
              updateForm("deliveryStreetLine1", event.target.value)
            }
          />
        </label>

        <label className="field">
          <span>City</span>
          <input
            required
            value={form.deliveryCity}
            onChange={(event) =>
              updateForm("deliveryCity", event.target.value)
            }
          />
        </label>

        <label className="field">
          <span>State / Province</span>
          <input
            required
            value={form.deliveryStateOrProvince}
            onChange={(event) =>
              updateForm("deliveryStateOrProvince", event.target.value)
            }
          />
        </label>

        <label className="field">
          <span>Postal Code</span>
          <input
            required
            value={form.deliveryPostalCode}
            onChange={(event) =>
              updateForm("deliveryPostalCode", event.target.value)
            }
          />
        </label>
      </div>

      <label className="field">
        <span>Country</span>
        <input
          required
          value={form.deliveryCountry}
          onChange={(event) =>
            updateForm("deliveryCountry", event.target.value)
          }
        />
      </label>

      <div className="actions splitActions">
        <button className="secondaryButton" onClick={onBack} type="button">
          Back
        </button>
        <button className="primaryButton" type="submit">
          Continue
        </button>
      </div>
    </form>
  );
}

export namespace OrderDetailsStep {
  export type FormModel = Pick<
    CreateOrderFormModel,
    | "notes"
    | "expectedDueDate"
    | "deliveryStreetLine1"
    | "deliveryCity"
    | "deliveryStateOrProvince"
    | "deliveryPostalCode"
    | "deliveryCountry"
  >;

  export function createInitialForm(
    orderForm: CreateOrderFormModel,
  ): FormModel {
    return {
      notes: orderForm.notes,
      expectedDueDate: orderForm.expectedDueDate,
      deliveryStreetLine1: orderForm.deliveryStreetLine1,
      deliveryCity: orderForm.deliveryCity,
      deliveryStateOrProvince: orderForm.deliveryStateOrProvince,
      deliveryPostalCode: orderForm.deliveryPostalCode,
      deliveryCountry: orderForm.deliveryCountry,
    };
  }
}

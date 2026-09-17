import { FormEvent, useState } from "react";
import type { Customer } from "@/domain/customer";
import type {
  OrderItemFormModel,
} from "./create-order-form-model";
import { createInitialOrderItemFormModel } from "./create-order-form-model";
import { createOrderItemFormForCustomer } from "./create-order-mappers";

type OrderItemsStepProps = {
  initialItems: OrderItemFormModel[];
  onBack: () => void;
  onContinue: (items: OrderItemFormModel[]) => void;
  selectedCustomer?: Customer;
};

export function OrderItemsStep({
  initialItems,
  onBack,
  onContinue,
  selectedCustomer,
}: OrderItemsStepProps) {
  const [items, setItems] = useState<OrderItemFormModel[]>(initialItems);

  function addOrderItem() {
    setItems((current) => [
      ...current,
      selectedCustomer
        ? createOrderItemFormForCustomer(
            crypto.randomUUID(),
            selectedCustomer,
          )
        : createInitialOrderItemFormModel(crypto.randomUUID()),
    ]);
  }

  function updateOrderItem(
    itemId: string,
    field: keyof Omit<OrderItemFormModel, "id" | "unit">,
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  }

  function updateOrderItemUnit(
    itemId: string,
    unit: OrderItemFormModel["unit"],
  ) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, unit } : item)),
    );
  }

  function removeOrderItem(itemId: string) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== itemId);
    });
  }

  function continueToReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue(items);
  }

  return (
    <form className="orderForm" onSubmit={continueToReview}>
      <div className="sectionHeader">
        <div>
          <h2>Order Items</h2>
          <p className="mutedText">
            Add each garment with pricing, inspiration, and measurements.
          </p>
        </div>
        <button className="secondaryButton" onClick={addOrderItem} type="button">
          Add Item
        </button>
      </div>

      <div className="orderItemList">
        {items.map((item, index) => (
          <div className="orderItemGroup" key={item.id}>
            <div className="sectionHeader">
              <h3>Item {index + 1}</h3>
              {items.length > 1 ? (
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

      <div className="actions splitActions">
        <button className="secondaryButton" onClick={onBack} type="button">
          Back
        </button>
        <button className="primaryButton" type="submit">
          Review Order
        </button>
      </div>
    </form>
  );
}

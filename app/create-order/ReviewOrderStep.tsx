import type { FormEvent } from "react";
import type { Customer } from "@/domain/customer";
import type { CreateOrderFormModel } from "./create-order-form-model";
import { toNumber } from "./create-order-mappers";

type ReviewOrderStepProps = {
  createdOrderId: string;
  onBack: () => void;
  onCreateOrder: (event: FormEvent<HTMLFormElement>) => void;
  orderForm: CreateOrderFormModel;
  selectedCustomer?: Customer;
};

export function ReviewOrderStep({
  createdOrderId,
  onBack,
  onCreateOrder,
  orderForm,
  selectedCustomer,
}: ReviewOrderStepProps) {
  return (
    <form className="orderForm" onSubmit={onCreateOrder}>
      <div className="sectionHeader">
        <div>
          <h2>Review Order</h2>
          <p className="mutedText">
            Check the order before creating it for the customer.
          </p>
        </div>
      </div>

      {createdOrderId ? (
        <p className="successMessage">Created order {createdOrderId}.</p>
      ) : null}

      <div className="reviewGrid">
        <section className="inlinePanel">
          <h3>Customer</h3>
          <dl className="summaryList">
            <div>
              <dt>Name</dt>
              <dd>{selectedCustomer?.name}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{selectedCustomer?.phoneNumber}</dd>
            </div>
          </dl>
        </section>

        <section className="inlinePanel">
          <h3>Delivery</h3>
          <dl className="summaryList">
            <div>
              <dt>Due Date</dt>
              <dd>{orderForm.expectedDueDate}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                {orderForm.deliveryStreetLine1}, {orderForm.deliveryCity},{" "}
                {orderForm.deliveryStateOrProvince}{" "}
                {orderForm.deliveryPostalCode}, {orderForm.deliveryCountry}
              </dd>
            </div>
          </dl>
        </section>

        <section className="inlinePanel fullWidthField">
          <h3>Items</h3>
          <dl className="summaryList">
            {orderForm.items.map((item, index) => (
              <div key={item.id}>
                <dt>Item {index + 1}</dt>
                <dd>
                  {item.title} - ${toNumber(item.amount).toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="actions splitActions">
        <button className="secondaryButton" onClick={onBack} type="button">
          Back
        </button>
        <button className="primaryButton" type="submit">
          Create Order
        </button>
      </div>
    </form>
  );
}

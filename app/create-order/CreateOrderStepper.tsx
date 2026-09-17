import type { Customer } from "@/domain/customer";

type CreateOrderStepperProps = {
  activeStep: CreateOrderStepper.Step;
  onStepChange: (step: CreateOrderStepper.Step) => void;
  selectedCustomer?: Customer;
};

export function CreateOrderStepper({
  activeStep,
  onStepChange,
  selectedCustomer,
}: CreateOrderStepperProps) {
  return (
    <aside className="sidePanel">
      <div>
        <h2>Create Order</h2>
        <p className="mutedText">
          {selectedCustomer
            ? `Order for ${selectedCustomer.name}`
            : "Start by choosing a customer."}
        </p>
      </div>

      <ol className="stepList" aria-label="Create order steps">
        {CreateOrderStepper.Steps.map((step, index) => {
          const isLocked = step.id !== "customer" && !selectedCustomer;

          return (
            <li key={step.id}>
              <button
                aria-current={activeStep === step.id ? "step" : undefined}
                className="stepButton"
                disabled={isLocked}
                onClick={() => onStepChange(step.id)}
                type="button"
              >
                <span className="stepNumber">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <small>{step.summary}</small>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export namespace CreateOrderStepper {
  export type Step = "customer" | "details" | "items" | "review";

  export const Steps: {
    id: Step;
    title: string;
    summary: string;
  }[] = [
    {
      id: "customer",
      title: "Customer",
      summary: "Select or create the customer.",
    },
    {
      id: "details",
      title: "Order Details",
      summary: "Due date, notes, and delivery.",
    },
    {
      id: "items",
      title: "Items",
      summary: "Garments, pricing, and measurements.",
    },
    {
      id: "review",
      title: "Review",
      summary: "Confirm and create the order.",
    },
  ];
}

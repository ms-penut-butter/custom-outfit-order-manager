import Link from "next/link";
import { CreateOrderFlow } from "./CreateOrderFlow";

export default function CreateOrderPage() {
  return (
    <main className="page">
      <div className="topBar">
        <Link className="secondaryButton" href="/">
          Back
        </Link>
      </div>

      <section className="formHeader">
        <p className="eyebrow">Create Order</p>
        <h1>New custom outfit order</h1>
      </section>

      <CreateOrderFlow
        businessDetails={{
          // Temporary local context until business settings are available.
          id: "local-business",
          name: "Order Management",
          description: "",
          address: {
            streetLine1: "",
            city: "",
            stateOrProvince: "",
            postalCode: "",
            country: "Canada",
          },
        }}
      />
    </main>
  );
}

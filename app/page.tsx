const orders = [
  {
    id: "ORD-1048",
    customer: "Northstar Retail",
    status: "Processing",
    total: "$1,284.00",
    date: "Sep 12, 2026",
  },
  {
    id: "ORD-1047",
    customer: "Brightline Foods",
    status: "Shipped",
    total: "$842.50",
    date: "Sep 11, 2026",
  },
  {
    id: "ORD-1046",
    customer: "Apex Office Co.",
    status: "Pending",
    total: "$319.99",
    date: "Sep 11, 2026",
  },
];

const metrics = [
  { label: "Open Orders", value: "128" },
  { label: "Ready To Ship", value: "42" },
  { label: "Revenue Today", value: "$18.4K" },
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Order Management</p>
          <h1>Manage orders from intake to fulfillment.</h1>
          <p className="intro">
            Track order status, monitor fulfillment queues, and keep customer
            activity visible from one focused workspace.
          </p>
        </div>
        <button className="primaryButton">Create Order</button>
      </section>

      <section className="metrics" aria-label="Order metrics">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </section>

      <section className="orders">
        <div className="sectionHeader">
          <h2>Recent Orders</h2>
          <button className="secondaryButton">View All</button>
        </div>
        <div className="table">
          <div className="row heading">
            <span>Order</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span>Date</span>
          </div>
          {orders.map((order) => (
            <div className="row" key={order.id}>
              <span className="orderId">{order.id}</span>
              <span>{order.customer}</span>
              <span>
                <mark>{order.status}</mark>
              </span>
              <span>{order.total}</span>
              <span>{order.date}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

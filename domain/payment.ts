export enum PaymentStatus {
  Unpaid = "unpaid",
  PartiallyPaid = "partially_paid",
  Paid = "paid",
  Refunded = "refunded",
}

export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "e_transfer"
  | "other";

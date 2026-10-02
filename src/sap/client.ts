// Port to the SAP order interface. The demo uses MockSapClient; a real adapter
// (e.g. OData) implements the same interface.

export const ORDER_STATUSES = ['offen', 'in Bearbeitung', 'versendet', 'geliefert', 'storniert'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  /** SAP sales order number */
  id: string;
  customer: string;
  material: string;
  quantity: number;
  amount: number;
  currency: string;
  status: OrderStatus;
  /** ISO date, YYYY-MM-DD */
  orderDate: string;
}

export interface SapClient {
  listOrders(): Promise<Order[]>;
}

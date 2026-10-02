import type { Order, SapClient } from './client.js';

// Fixed demo data; the demo has no real SAP connection.
export const ORDER_FIXTURES: readonly Order[] = Object.freeze([
  {
    id: '4500012345',
    customer: 'Müller Maschinenbau GmbH',
    material: 'Hydraulikpumpe HP-200',
    quantity: 4,
    amount: 12800,
    currency: 'EUR',
    status: 'offen',
    orderDate: '2026-09-01',
  },
  {
    id: '4500012346',
    customer: 'Schneider Logistik AG',
    material: 'Förderband FB-12',
    quantity: 1,
    amount: 45250.5,
    currency: 'EUR',
    status: 'in Bearbeitung',
    orderDate: '2026-09-03',
  },
  {
    id: '4500012347',
    customer: 'Becker & Partner KG',
    material: 'Steuereinheit SE-7',
    quantity: 12,
    amount: 8640,
    currency: 'EUR',
    status: 'versendet',
    orderDate: '2026-09-08',
  },
  {
    id: '4500012348',
    customer: 'Hofmann Energietechnik',
    material: 'Wärmetauscher WT-40',
    quantity: 2,
    amount: 19990,
    currency: 'EUR',
    status: 'geliefert',
    orderDate: '2026-09-12',
  },
  {
    id: '4500012349',
    customer: 'Wagner Bau GmbH',
    material: 'Kompressor K-500',
    quantity: 3,
    amount: 27300,
    currency: 'EUR',
    status: 'storniert',
    orderDate: '2026-09-15',
  },
  {
    id: '4500012350',
    customer: 'Fischer Lebensmittel eG',
    material: 'Kühlaggregat KA-9',
    quantity: 6,
    amount: 15480,
    currency: 'EUR',
    status: 'offen',
    orderDate: '2026-09-20',
  },
]);

export class MockSapClient implements SapClient {
  constructor(private readonly orders: readonly Order[] = ORDER_FIXTURES) {}

  async listOrders(): Promise<Order[]> {
    return this.orders.map((order) => ({ ...order }));
  }
}

import { describe, expect, it } from 'vitest';
import { MockSapClient, ORDER_FIXTURES } from '../../src/sap/mock.js';
import { ORDER_STATUSES } from '../../src/sap/client.js';

describe('MockSapClient', () => {
  it('returns the fixture orders', async () => {
    const orders = await new MockSapClient().listOrders();
    expect(orders).toEqual(ORDER_FIXTURES);
  });

  it('returns copies so callers cannot change the fixtures', async () => {
    const client = new MockSapClient();
    const first = await client.listOrders();
    first[0]!.customer = 'changed';
    first.pop();
    const second = await client.listOrders();
    expect(second).toEqual(ORDER_FIXTURES);
  });

  it('accepts custom fixture data', async () => {
    const custom = [{ ...ORDER_FIXTURES[0]!, id: '1' }];
    expect(await new MockSapClient(custom).listOrders()).toEqual(custom);
  });

  it('only uses known statuses and unique ids', () => {
    const ids = new Set(ORDER_FIXTURES.map((o) => o.id));
    expect(ids.size).toBe(ORDER_FIXTURES.length);
    for (const order of ORDER_FIXTURES) {
      expect(ORDER_STATUSES).toContain(order.status);
    }
  });
});

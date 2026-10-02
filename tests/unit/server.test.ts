import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/server.js';
import { MockSapClient } from '../../src/sap/mock.js';
import type { Order, SapClient } from '../../src/sap/client.js';

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

function serverWith(sapClient: SapClient, version?: string): FastifyInstance {
  app = buildServer({ sapClient, version });
  return app;
}

class FailingSapClient implements SapClient {
  async listOrders(): Promise<Order[]> {
    throw new Error('SAP not reachable');
  }
}

describe('GET /healthz', () => {
  it('reports ok and the deployed version', async () => {
    const res = await serverWith(new MockSapClient(), 'sha256:abc').inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', version: 'sha256:abc' });
  });

  it('reports "dev" when no version is set', async () => {
    const res = await serverWith(new MockSapClient()).inject({ method: 'GET', url: '/healthz' });
    expect(res.json()).toEqual({ status: 'ok', version: 'dev' });
  });
});

describe('GET /api/orders', () => {
  it('returns all orders from the SAP client as JSON', async () => {
    const res = await serverWith(new MockSapClient()).inject({ method: 'GET', url: '/api/orders' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    const body = res.json() as { orders: Order[] };
    expect(body.orders.length).toBeGreaterThanOrEqual(5);
    expect(body.orders[0]).toMatchObject({ id: expect.any(String), customer: expect.any(String) });
  });

  it('answers 502 when the SAP interface fails', async () => {
    const res = await serverWith(new FailingSapClient()).inject({ method: 'GET', url: '/api/orders' });
    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({ error: 'SAP interface unavailable' });
  });
});

describe('GET /', () => {
  it('renders the order overview as HTML', async () => {
    const res = await serverWith(new MockSapClient()).inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('<h1>Auftragsübersicht</h1>');
    expect(res.body).toContain('4500012345');
  });

  it('renders an error page when the SAP interface fails', async () => {
    const res = await serverWith(new FailingSapClient()).inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(502);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('SAP-Schnittstelle nicht erreichbar');
  });
});

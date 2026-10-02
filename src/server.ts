import Fastify, { type FastifyInstance } from 'fastify';
import type { SapClient } from './sap/client.js';
import { renderErrorPage, renderOrdersPage } from './views/orders.js';

export interface ServerOptions {
  sapClient: SapClient;
  /** Image digest or version shown on /healthz */
  version?: string;
  logger?: boolean;
}

export function buildServer({ sapClient, version, logger = false }: ServerOptions): FastifyInstance {
  const app = Fastify({ logger });

  app.get('/healthz', async () => ({ status: 'ok', version: version ?? 'dev' }));

  app.get('/api/orders', async (request, reply) => {
    try {
      return { orders: await sapClient.listOrders() };
    } catch (err) {
      request.log.error({ err }, 'SAP interface failed');
      return reply.code(502).send({ error: 'SAP interface unavailable' });
    }
  });

  app.get('/', async (request, reply) => {
    reply.type('text/html; charset=utf-8');
    try {
      return renderOrdersPage(await sapClient.listOrders());
    } catch (err) {
      request.log.error({ err }, 'SAP interface failed');
      return reply.code(502).send(renderErrorPage('SAP-Schnittstelle nicht erreichbar. Bitte später erneut versuchen.'));
    }
  });

  return app;
}

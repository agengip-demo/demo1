import { pathToFileURL } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { MockSapClient } from './sap/mock.js';
import { buildServer } from './server.js';

export interface Config {
  port: number;
  host: string;
  version: string | undefined;
}

type Env = Record<string, string | undefined>;

export function readConfig(env: Env): Config {
  const port = Number(env.PORT ?? '3000');
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT must be a number between 0 and 65535');
  }
  return { port, host: env.HOST ?? '0.0.0.0', version: env.APP_VERSION };
}

export async function start(env: Env = process.env, logger = true): Promise<FastifyInstance> {
  const config = readConfig(env);
  const app = buildServer({ sapClient: new MockSapClient(), version: config.version, logger });
  await app.listen({ port: config.port, host: config.host });
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}

import { describe, expect, it } from 'vitest';
import { readConfig, start } from '../../src/main.js';

describe('readConfig', () => {
  it('uses defaults', () => {
    expect(readConfig({})).toEqual({ port: 3000, host: '0.0.0.0', version: undefined });
  });

  it('reads PORT, HOST and APP_VERSION', () => {
    expect(readConfig({ PORT: '8080', HOST: '127.0.0.1', APP_VERSION: 'sha256:1' })).toEqual({
      port: 8080,
      host: '127.0.0.1',
      version: 'sha256:1',
    });
  });

  it('rejects an invalid port', () => {
    expect(() => readConfig({ PORT: 'abc' })).toThrow('PORT must be a number between 0 and 65535');
  });
});

describe('start', () => {
  it('listens on the configured port and serves /healthz', async () => {
    const app = await start({ PORT: '0', HOST: '127.0.0.1', APP_VERSION: 'test' }, false);
    try {
      const address = app.server.address();
      if (address === null || typeof address === 'string') throw new Error('no TCP address');
      const res = await fetch(`http://127.0.0.1:${address.port}/healthz`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok', version: 'test' });
    } finally {
      await app.close();
    }
  });
});

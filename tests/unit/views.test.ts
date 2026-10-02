import { describe, expect, it } from 'vitest';
import { escapeHtml, formatAmount, renderErrorPage, renderOrdersPage } from '../../src/views/orders.js';
import type { Order } from '../../src/sap/client.js';

const order: Order = {
  id: '4500000001',
  customer: 'Müller & Söhne <GmbH>',
  material: 'Pumpe P-100',
  quantity: 3,
  amount: 1234.5,
  currency: 'EUR',
  status: 'offen',
  orderDate: '2026-09-01',
};

describe('escapeHtml', () => {
  it('escapes the five HTML special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('formatAmount', () => {
  it('formats amounts in German notation', () => {
    // Intl uses a no-break space between amount and currency sign.
    expect(formatAmount(1234.5, 'EUR')).toBe('1.234,50 €');
  });
});

describe('renderOrdersPage', () => {
  it('renders one table row per order with escaped values', () => {
    const html = renderOrdersPage([order]);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html lang="de">');
    expect(html).toContain('data-testid="order-row"');
    expect(html).toContain('Müller &amp; Söhne &lt;GmbH&gt;');
    expect(html).not.toContain('<GmbH>');
    expect(html).toContain('1.234,50 €');
    expect(html).toContain('data-status="offen"');
    expect(html).toContain('1 Auftrag');
  });

  it('shows the count in plural', () => {
    expect(renderOrdersPage([order, { ...order, id: '2' }])).toContain('2 Aufträge');
  });

  it('shows an empty state without orders', () => {
    const html = renderOrdersPage([]);
    expect(html).toContain('Keine Aufträge vorhanden');
    expect(html).not.toContain('data-testid="order-row"');
  });
});

describe('renderErrorPage', () => {
  it('renders an escaped error message', () => {
    const html = renderErrorPage('<boom>');
    expect(html).toContain('&lt;boom&gt;');
    expect(html).toContain('role="alert"');
  });
});

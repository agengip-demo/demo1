import type { Order } from '../sap/client.js';

// Server-rendered pages. Every dynamic value goes through escapeHtml.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);
}

const STYLE = `
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
  body { margin: 2rem auto; max-width: 72rem; padding: 0 1rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #8884; padding: .5rem; text-align: left; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .status { border-radius: .25rem; padding: .1rem .4rem; background: #8882; }
  [role="alert"] { color: #b00020; }
`;

function layout(body: string): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Auftragsübersicht</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Auftragsübersicht</h1>
${body}
</body>
</html>`;
}

function row(order: Order): string {
  return `<tr data-testid="order-row" data-status="${escapeHtml(order.status)}">
  <td>${escapeHtml(order.id)}</td>
  <td>${escapeHtml(order.customer)}</td>
  <td>${escapeHtml(order.material)}</td>
  <td class="num">${order.quantity}</td>
  <td class="num">${escapeHtml(formatAmount(order.amount, order.currency))}</td>
  <td><span class="status">${escapeHtml(order.status)}</span></td>
  <td>${escapeHtml(order.orderDate)}</td>
</tr>`;
}

export function renderOrdersPage(orders: Order[]): string {
  if (orders.length === 0) {
    return layout('<p>Keine Aufträge vorhanden.</p>');
  }
  const count = orders.length === 1 ? '1 Auftrag' : `${orders.length} Aufträge`;
  return layout(`<p>${count} aus SAP</p>
<table>
<thead><tr><th>Auftrag</th><th>Kunde</th><th>Material</th><th>Menge</th><th>Betrag</th><th>Status</th><th>Datum</th></tr></thead>
<tbody>
${orders.map(row).join('\n')}
</tbody>
</table>`);
}

export function renderErrorPage(message: string): string {
  return layout(`<p role="alert">${escapeHtml(message)}</p>`);
}

import { expect, test } from '@playwright/test';

test('health endpoint answers ok', async ({ request }) => {
  const res = await request.get('/healthz');
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).status).toBe('ok');
});

test('order overview lists the orders from SAP', async ({ page, request }) => {
  const api = await request.get('/api/orders');
  const { orders } = (await api.json()) as { orders: { id: string }[] };

  await page.goto('/');
  await expect(page).toHaveTitle('Auftragsübersicht');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Auftragsübersicht');
  const rows = page.getByTestId('order-row');
  await expect(rows).toHaveCount(orders.length);
  await expect(rows.first()).toContainText(orders[0]!.id);
});

test('order table has German column headers', async ({ page }) => {
  await page.goto('/');
  const headers = page.getByRole('columnheader');
  await expect(headers).toContainText(['Auftrag', 'Kunde', 'Material', 'Menge', 'Betrag', 'Status', 'Datum']);
});

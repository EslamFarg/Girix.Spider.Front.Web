/**
 * Capture Inventory Adjustment Form header area for before/after comparison.
 * Usage: node scripts/capture-inventory-form.mjs [before|after]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const phase = process.argv[2] || 'after';
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots', `inventory-form-${phase}`);
mkdirSync(outDir, { recursive: true });

const mockUser = {
  userId: '1',
  fullName: 'Visual QA',
  email: 'admin@admin.com',
  phoneNumber: '1234567890',
  token: 'qa-token',
  imageUrl: '',
  groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1,
  cashierCollectionAccountName: 'C',
  custodyAccountId: 2,
  custodyAccountName: 'Cu',
  cashPaymentAccountId: 3,
  cashPaymentAccountName: 'Ca',
  bankPaymentAccountId: 4,
  bankPaymentAccountName: 'Ba',
};

const mockProducts = {
  rows: [
    { id: 1, itemId: 1, itemName: 'منتج أ', quantity: 10, unitId: 1, unitName: 'كجم' },
    { id: 2, itemId: 2, itemName: 'منتج ب', quantity: 5.5, unitId: 2, unitName: 'لتر' },
    { id: 3, itemId: 3, itemName: 'منتج ج', quantity: 0, unitId: 1, unitName: 'كgsm' },
  ],
  paginationInfo: { currentPageIndex: 1, totalRowsCount: 3, totalPagesCount: 1 },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

await page.route('**/v1/**', async (route) => {
  const req = route.request();
  const url = req.url();

  if (req.method() === 'POST' && url.includes('/inventory/search')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts),
    });
    return;
  }

  if (req.method() === 'POST' && url.includes('InventorySettlement/search')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        value: { rows: [], paginationInfo: { currentPageIndex: 1, totalRowsCount: 0, totalPagesCount: 0 } },
        isSuccess: true,
        isFailure: false,
        error: { code: '', args: [], errorType: 0 },
      }),
    });
    return;
  }

  await route.continue();
});

const now = Date.now();
await page.goto('http://127.0.0.1:4200/', { waitUntil: 'load', timeout: 60000 });
await page.evaluate(
  ({ user, expireDate }) => {
    localStorage.setItem('expireDate', JSON.stringify(expireDate));
    localStorage.setItem('userDetails', JSON.stringify(user));
  },
  { user: mockUser, expireDate: new Date(now + 365 * 86400000).toISOString() },
);
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => document.querySelector('app-root')?.innerHTML?.trim().length > 100, {
  timeout: 60000,
});

await page.goto('http://127.0.0.1:4200/storage/inventory/add', { waitUntil: 'networkidle', timeout: 90000 });

const form = page.locator('#inventorySettlementForm');
try {
  await form.waitFor({ state: 'visible', timeout: 60000 });
} catch (error) {
  const bodyText = await page.locator('app-root').innerText().catch(() => '');
  console.log('Page text snippet:', bodyText.slice(0, 500));
  await page.screenshot({ path: join(outDir, 'debug-page.png'), fullPage: true });
  throw error;
}

await page.waitForTimeout(1000);
await page.locator('.is-toolbar').screenshot({ path: join(outDir, 'inventory-form-toolbar.png') });
await page.locator('.is-header').first().screenshot({ path: join(outDir, 'inventory-form-header.png') });
await page.screenshot({ path: join(outDir, 'inventory-form-full.png'), fullPage: false });

console.log(`Saved ${phase} screenshots to ${outDir}`);
await browser.close();

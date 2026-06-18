import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');
mkdirSync(outDir, { recursive: true });

const now = Date.now();
const mockTables = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: i === 8 ? 'Very Long Table Name' : `T${i + 1}`,
  isAvailable: i % 4 !== 0,
  reservedTo: new Date(now + 3600000).toISOString(),
  reservedFrom: new Date(now - 1800000).toISOString(),
  orderId: i % 4 === 0 ? i + 1 : 0,
}));

const mockResponse = {
  value: {
    rows: mockTables,
    paginationInfo: { totalRowsCount: 20, totalPagesCount: 1, currentPageIndex: 1 },
  },
  isSuccess: true, isFailure: false,
  error: { code: '', args: [], errorType: 0 },
};

const mockUser = {
  userId: '1', fullName: 'Visual QA', email: 'admin@admin.com', phoneNumber: '1234567890',
  token: 'qa-token', imageUrl: '', groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1, cashierCollectionAccountName: 'C',
  custodyAccountId: 2, custodyAccountName: 'Cu',
  cashPaymentAccountId: 3, cashPaymentAccountName: 'Ca',
  bankPaymentAccountId: 4, bankPaymentAccountName: 'Ba',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.route('**/Table/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResponse) });
      return;
    }
    await route.continue();
  });

  await page.goto('http://127.0.0.1:4200/', { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(({ user, expireDate }) => {
    localStorage.setItem('apiUrlOverride', 'http://localhost-mock/v1');
    localStorage.setItem('expireDate', JSON.stringify(expireDate));
    localStorage.setItem('userDetails', JSON.stringify(user));
  }, { user: mockUser, expireDate: new Date(now + 365 * 86400000).toISOString() });
  await page.reload({ waitUntil: 'load' });

  await page.waitForFunction(
    () => document.querySelector('app-root')?.innerHTML?.trim().length > 100,
    { timeout: 60000 },
  );

  await page.locator('[id="header-link-/invoices"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices"]').click();

  await page.locator('[id="header-link-/invoices/replacements/tables"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices/replacements/tables"]').click();

  await page.waitForSelector('.grid app-table-card', { timeout: 30000 });
  await page.waitForTimeout(1500);

  const fullPath = join(outDir, `tables-switch-${process.argv[2] || 'before'}.png`);
  const gridPath = join(outDir, `tables-grid-${process.argv[2] || 'before'}.png`);
  const singlePath = join(outDir, `tables-single-${process.argv[2] || 'before'}.png`);

  await page.screenshot({ path: fullPath });

  const grid = page.locator('.grid').filter({ has: page.locator('app-table-card') }).first();
  await grid.screenshot({ path: gridPath });

  const card = page.locator('.grid app-table-card').first();
  const box = await card.boundingBox();
  console.log(`Card bounding box: ${JSON.stringify(box)}`);
  await card.screenshot({ path: singlePath });

  await browser.close();
  console.log(`Full: ${fullPath}\nGrid: ${gridPath}\nSingle: ${singlePath}`);
}

main().catch(e => { console.error(e); process.exit(1); });

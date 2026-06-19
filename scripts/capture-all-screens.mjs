/**
 * Full regression audit screenshot capture
 * Captures: Huts, Rooms, Tables screens at 1366x900
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots', 'audit');
mkdirSync(outDir, { recursive: true });

const now = Date.now();

const mockUser = {
  userId: '1', fullName: 'Visual QA', email: 'admin@admin.com', phoneNumber: '1234567890',
  token: 'qa-token', imageUrl: '', groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1, cashierCollectionAccountName: 'C',
  custodyAccountId: 2, custodyAccountName: 'Cu',
  cashPaymentAccountId: 3, cashPaymentAccountName: 'Ca',
  bankPaymentAccountId: 4, bankPaymentAccountName: 'Ba',
};

function makeRows(count, prefix, isHut = false) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: i === 2 ? (isHut ? 'ashrakt' : 'Reserved') : `${prefix}${i + 1}`,
    isAvailable: i !== 2,
    reservedTo: i === 2
      ? new Date(now - 2 * 3600000).toISOString()
      : new Date(now + 3600000).toISOString(),
    reservedFrom: new Date(now - 1800000).toISOString(),
    orderId: i === 2 ? 3 : 0,
    pricePerHour: 50,
  }));
}

function mockResp(rows) {
  return {
    value: { rows, paginationInfo: { totalRowsCount: rows.length, totalPagesCount: 1, currentPageIndex: 1 } },
    isSuccess: true, isFailure: false, error: { code: '', args: [], errorType: 0 },
  };
}

async function setupPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.route('**/Hut/**', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResp(makeRows(12, 'كوخ ', true))) });
    else await route.continue();
  });
  await page.route('**/Room/**', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResp(makeRows(12, 'R'))) });
    else await route.continue();
  });
  await page.route('**/Table/**', async (route) => {
    if (route.request().method() === 'POST')
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResp(makeRows(12, 'T'))) });
    else await route.continue();
  });

  await page.goto('http://127.0.0.1:4200/', { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(({ user, expireDate }) => {
    localStorage.setItem('expireDate', JSON.stringify(expireDate));
    localStorage.setItem('userDetails', JSON.stringify(user));
  }, { user: mockUser, expireDate: new Date(now + 365 * 86400000).toISOString() });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('app-root')?.innerHTML?.trim().length > 100, { timeout: 60000 });
  await page.locator('[id="header-link-/invoices"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices"]').click();
  return page;
}

async function captureScreen(page, navId, cardSelector, gridSelector, label) {
  await page.locator(`[id="${navId}"]`).waitFor({ state: 'visible', timeout: 20000 });
  await page.locator(`[id="${navId}"]`).click();
  await page.waitForSelector(cardSelector, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const fullPath = join(outDir, `${label}-full.png`);
  await page.screenshot({ path: fullPath });

  const grid = page.locator(gridSelector).first();
  const gridPath = join(outDir, `${label}-grid.png`);
  if (await grid.count() > 0) {
    await grid.screenshot({ path: gridPath });
  }

  // measure first card
  const card = page.locator(`${gridSelector} ${cardSelector}`).first();
  const box = await card.boundingBox();
  const card2 = page.locator(`${gridSelector} ${cardSelector}`).nth(1);
  const box2 = await card2.boundingBox();

  console.log(`\n── ${label.toUpperCase()} ──`);
  console.log(`  Card size: ${box?.width?.toFixed(1)} × ${box?.height?.toFixed(1)}px`);
  if (box && box2) {
    const gap = box2.x - (box.x + box.width);
    console.log(`  Col gap (measured): ${gap.toFixed(1)}px`);
  }
  console.log(`  Full:  ${fullPath}`);
  console.log(`  Grid:  ${gridPath}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await setupPage(browser);

    await captureScreen(page,
      'header-link-/invoices/replacements/huts',
      'app-hut-card',
      '.hut-switch-grid',
      'huts');

    await captureScreen(page,
      'header-link-/invoices/replacements/rooms',
      'app-room-card',
      '.room-switch-grid',
      'rooms');

    await captureScreen(page,
      'header-link-/invoices/replacements/tables',
      'app-table-card',
      '.table-switch-grid',
      'tables');

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

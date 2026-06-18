import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');
mkdirSync(outDir, { recursive: true });

const now = Date.now();

const mockHuts = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: i === 2 ? 'ashrakt' : i === 0 ? 'هاله' : `كوخ ${i + 1}`,
  isAvailable: i !== 2,
  reservedTo: i === 2
    ? new Date(now - 25 * 60 * 60 * 1000).toISOString()   // past → on-hold
    : new Date(now + 3600000).toISOString(),
  reservedFrom: new Date(now - 1800000).toISOString(),
  orderId: i === 2 ? 3 : 0,
  pricePerHour: 50,
}));

const mockResponse = {
  value: {
    rows: mockHuts,
    paginationInfo: { totalRowsCount: 12, totalPagesCount: 1, currentPageIndex: 1 },
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

  await page.route('**/Hut/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockResponse) });
    } else await route.continue();
  });

  await page.goto('http://127.0.0.1:4200/', { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(({ user, expireDate }) => {
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
  await page.locator('[id="header-link-/invoices/replacements/huts"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices/replacements/huts"]').click();

  await page.waitForSelector('app-hut-card', { timeout: 30000 });
  await page.waitForTimeout(2000);

  const suffix = process.argv[2] || 'after';

  // Full page
  const fullPath = join(outDir, `huts-restored-${suffix}-full.png`);
  await page.screenshot({ path: fullPath });

  // Grid only
  const grid = page.locator('.hut-switch-grid').first();
  const gridPath = join(outDir, `huts-restored-${suffix}-grid.png`);
  if (await grid.count() > 0) {
    await grid.screenshot({ path: gridPath });
  }

  // Single card — measure its size
  const card = page.locator('.hut-switch-grid app-hut-card').first();
  const box = await card.boundingBox();
  console.log(`Card bounding box: ${JSON.stringify(box)}`);

  // Two cards — measure gap
  const card2 = page.locator('.hut-switch-grid app-hut-card').nth(1);
  const box2 = await card2.boundingBox();
  if (box && box2) {
    const colGap = box2.x - (box.x + box.width);
    console.log(`Column gap between card 0 and 1: ${colGap}px`);
  }

  // Second row — row gap
  const cardRow2 = page.locator('.hut-switch-grid app-hut-card').nth(6);
  const boxRow2 = await cardRow2.boundingBox();
  if (box && boxRow2) {
    const rowGap = boxRow2.y - (box.y + box.height);
    console.log(`Row gap (visual bottom to next card top): ${rowGap}px`);
  }

  const singlePath = join(outDir, `huts-restored-${suffix}-single.png`);
  if (box) await card.screenshot({ path: singlePath });

  await browser.close();

  console.log(`\nScreenshots:`);
  console.log(`  Full:   ${fullPath}`);
  console.log(`  Grid:   ${gridPath}`);
  console.log(`  Single: ${singlePath}`);
}

main().catch(e => { console.error(e); process.exit(1); });

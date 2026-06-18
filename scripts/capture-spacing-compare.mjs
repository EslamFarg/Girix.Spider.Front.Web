import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');
mkdirSync(outDir, { recursive: true });

const now = Date.now();

const mockTables = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: i === 8 ? 'Very Long Table' : `T${i + 1}`,
  isAvailable: i % 4 !== 0,
  reservedTo: new Date(now + 3600000).toISOString(),
  reservedFrom: new Date(now - 1800000).toISOString(),
  orderId: i % 4 === 0 ? i + 1 : 0,
}));

const mockRooms = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: i === 5 ? 'Long Room Name' : `R${i + 1}`,
  isAvailable: i % 3 !== 0,
  reservedTo: new Date(now + 3600000).toISOString(),
  reservedFrom: new Date(now - 1800000).toISOString(),
  orderId: i % 3 === 0 ? i + 1 : 0,
}));

const makeResponse = (rows) => ({
  value: { rows, paginationInfo: { totalRowsCount: rows.length, totalPagesCount: 1, currentPageIndex: 1 } },
  isSuccess: true, isFailure: false, error: { code: '', args: [], errorType: 0 },
});

const mockUser = {
  userId: '1', fullName: 'Visual QA', email: 'admin@admin.com', phoneNumber: '1234567890',
  token: 'qa-token', imageUrl: '', groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1, cashierCollectionAccountName: 'C',
  custodyAccountId: 2, custodyAccountName: 'Cu',
  cashPaymentAccountId: 3, cashPaymentAccountName: 'Ca',
  bankPaymentAccountId: 4, bankPaymentAccountName: 'Ba',
};

async function setupPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.route('**/Table/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeResponse(mockTables)) });
    } else await route.continue();
  });
  await page.route('**/Room/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeResponse(mockRooms)) });
    } else await route.continue();
  });
  // mock token-check/auth endpoints
  await page.route('**/Auth/**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

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

async function captureRooms(page) {
  await page.locator('[id="header-link-/invoices/replacements/rooms"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices/replacements/rooms"]').click();
  await page.waitForSelector('app-room-card', { timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: join(outDir, 'spacing-rooms-full.png') });

  const grid = page.locator('.room-switch-grid').first();
  if (await grid.count() > 0) await grid.screenshot({ path: join(outDir, 'spacing-rooms-grid.png') });

  // measure gap between first two cards
  const cards = page.locator('.room-switch-grid app-room-card');
  const box0 = await cards.nth(0).boundingBox();
  const box1 = await cards.nth(1).boundingBox();
  const box4 = await cards.nth(4).boundingBox();
  const colGap = box1 ? box1.x - (box0.x + box0.width) : 'N/A';
  const rowGap = box4 ? box4.y - (box0.y + box0.height) : 'N/A';
  console.log(`ROOMS → card size: ${box0?.width}×${box0?.height}  col-gap: ${colGap}px  row-gap: ${rowGap}px`);
  console.log(`Rooms full: ${join(outDir, 'spacing-rooms-full.png')}`);
  console.log(`Rooms grid: ${join(outDir, 'spacing-rooms-grid.png')}`);
}

async function captureTables(page) {
  await page.locator('[id="header-link-/invoices/replacements/tables"]').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('[id="header-link-/invoices/replacements/tables"]').click();
  await page.waitForSelector('app-table-card', { timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: join(outDir, 'spacing-tables-full.png') });

  const grid = page.locator('.table-switch-grid').first();
  if (await grid.count() > 0) await grid.screenshot({ path: join(outDir, 'spacing-tables-grid.png') });

  // measure gap between first two cards
  const cards = page.locator('.table-switch-grid app-table-card');
  const box0 = await cards.nth(0).boundingBox();
  const box1 = await cards.nth(1).boundingBox();
  const box5 = await cards.nth(5).boundingBox(); // second row (5 cards per row at 1366px with 175px cards + 12px gaps)
  const colGap = box1 ? box1.x - (box0.x + box0.width) : 'N/A';
  const rowGap = box5 ? box5.y - (box0.y + box0.height) : 'N/A';
  console.log(`TABLES → card size: ${box0?.width}×${box0?.height}  col-gap: ${colGap}px  row-gap: ${rowGap}px`);
  console.log(`Tables full: ${join(outDir, 'spacing-tables-full.png')}`);
  console.log(`Tables grid: ${join(outDir, 'spacing-tables-grid.png')}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await setupPage(browser);
    await captureRooms(page);
    await captureTables(page);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

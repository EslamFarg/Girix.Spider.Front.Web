import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');
mkdirSync(outDir, { recursive: true });

const now = Date.now();
const future = new Date(now + 2 * 60 * 60 * 1000).toISOString();
const past = new Date(now - 30 * 60 * 1000).toISOString();

const mockHuts = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  let isAvailable = true;
  let reservedTo = future;
  if (n % 5 === 0) {
    isAvailable = false;
    reservedTo = future;
  } else if (n % 7 === 0) {
    isAvailable = false;
    reservedTo = past;
  }
  return {
    id: n,
    name: n === 12 ? 'Very Long Hut Name Example Text' : `H${n}`,
    pricePerHour: 50,
    isAvailable,
    reservedTo,
    reservedFrom: past,
    orderId: isAvailable ? 0 : n,
  };
});

const mockSearchResponse = {
  value: {
    rows: mockHuts,
    paginationInfo: {
      totalRowsCount: mockHuts.length,
      totalPagesCount: 1,
      currentPageIndex: 1,
    },
  },
  isSuccess: true,
  isFailure: false,
  error: { code: '', args: [], errorType: 0 },
};

const mockUser = {
  userId: '1',
  fullName: 'Visual QA',
  email: 'admin@admin.com',
  phoneNumber: '1234567890',
  token: 'visual-qa-token',
  imageUrl: '',
  groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1,
  cashierCollectionAccountName: 'Cashier',
  custodyAccountId: 2,
  custodyAccountName: 'Custody',
  cashPaymentAccountId: 3,
  cashPaymentAccountName: 'Cash',
  bankPaymentAccountId: 4,
  bankPaymentAccountName: 'Bank',
};

async function seedAuth(page) {
  await page.evaluate(({ user, expireDate }) => {
    localStorage.setItem('apiUrlOverride', 'http://localhost-mock/v1');
    localStorage.setItem('expireDate', JSON.stringify(expireDate));
    localStorage.setItem('userDetails', JSON.stringify(user));
  }, { user: mockUser, expireDate: new Date(now + 365 * 86400000).toISOString() });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  await page.route('**/Hut/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSearchResponse),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('http://127.0.0.1:4200/', { waitUntil: 'load', timeout: 60000 });
  await seedAuth(page);
  await page.reload({ waitUntil: 'load' });

  await page.waitForFunction(
    () => document.querySelector('app-root')?.innerHTML?.trim().length > 100,
    { timeout: 60000 },
  );

  const invoicesNav = page.locator('[id="header-link-/invoices"]');
  await invoicesNav.waitFor({ state: 'visible', timeout: 30000 });
  await invoicesNav.click();

  const hutsNav = page.locator('[id="header-link-/invoices/replacements/huts"]');
  await hutsNav.waitFor({ state: 'visible', timeout: 30000 });
  await hutsNav.click();

  await page.waitForURL('**/invoices/replacements/huts', { timeout: 30000 });
  await page.waitForSelector('.hut-switch-grid app-hut-card', { timeout: 30000 });
  await page.waitForTimeout(2000);

  const fullPath = join(outDir, 'huts-switch-live-full.png');
  const gridPath = join(outDir, 'huts-switch-live-grid.png');

  await page.screenshot({ path: fullPath, fullPage: false });

  const grid = page.locator('.hut-switch-grid');
  await grid.first().screenshot({ path: gridPath });

  const hutCount = await page.locator('.hut-switch-grid app-hut-card').count();
  console.log(`URL: ${page.url()}`);
  console.log(`Captured ${hutCount} hut cards`);
  console.log(`Full: ${fullPath}`);
  const singlePath = join(outDir, 'huts-switch-live-single.png');
  await page.locator('.hut-switch-grid app-hut-card').nth(4).screenshot({ path: singlePath });
  console.log(`Single: ${singlePath}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

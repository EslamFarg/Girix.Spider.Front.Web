/**
 * Phase 1 verification: capture Huts/Rooms/Tables + measure hut dimensions
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots', 'phase1');
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

async function captureScreen(page, navId, cardSelector, gridSelector, label) {
  await page.locator(`[id="${navId}"]`).waitFor({ state: 'visible', timeout: 20000 });
  await page.locator(`[id="${navId}"]`).click();
  await page.waitForSelector(cardSelector, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const fullPath = join(outDir, `${label}-full.png`);
  await page.screenshot({ path: fullPath });

  const grid = page.locator(gridSelector).first();
  const gridPath = join(outDir, `${label}-grid.png`);
  if (await grid.count() > 0) await grid.screenshot({ path: gridPath });

  const card = page.locator(`${gridSelector} ${cardSelector}`).first();
  const box = await card.boundingBox();

  console.log(`\n── ${label.toUpperCase()} ──`);
  console.log(`  Card bounding box: ${box?.width?.toFixed(1)} × ${box?.height?.toFixed(1)}px`);
  console.log(`  Full: ${fullPath}`);
  console.log(`  Grid: ${gridPath}`);

  return { card, box };
}

async function verifyHuts(page) {
  await page.locator('[id="header-link-/invoices/replacements/huts"]').click();
  await page.waitForSelector('app-hut-card', { timeout: 30000 });
  await page.waitForTimeout(1000);

  const metrics = await page.evaluate(() => {
    const host = document.querySelector('.hut-switch-grid app-hut-card.hut-switch-card');
    if (!host) return null;
    const root = host.shadowRoot ?? host;
    const cardRoot = host.querySelector('.hut-card-root');
    const roof = host.querySelector('.hut-roof');
    const body = host.querySelector('.hut-body');
    const timer = host.querySelector('.hut-timer');
    const grid = document.querySelector('.hut-switch-grid');

    const hostStyle = getComputedStyle(host);
    const rootStyle = cardRoot ? getComputedStyle(cardRoot) : null;
    const roofStyle = roof ? getComputedStyle(roof) : null;
    const gridStyle = grid ? getComputedStyle(grid) : null;

    return {
      hostWidth: parseFloat(hostStyle.width),
      roofWidth: roofStyle ? parseFloat(roofStyle.width) : null,
      rootPaddingTop: rootStyle ? parseFloat(rootStyle.paddingTop) : null,
      gridColumnTemplate: gridStyle?.gridTemplateColumns ?? '',
      gridPaddingTop: gridStyle ? parseFloat(gridStyle.paddingTop) : null,
      timerInsideBody: !!(body && timer && body.contains(timer)),
    };
  });

  console.log('\n── HUTS DIMENSION VERIFICATION ──');
  console.log(JSON.stringify(metrics, null, 2));

  // Hover test on first available hut
  const firstHut = page.locator('.hut-switch-grid app-hut-card').first();
  const root = firstHut.locator('.hut-card-root');

  // Hover on roof area (top of card)
  const box = await firstHut.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + 10);
    await page.waitForTimeout(300);

    const hoverOnRoof = await page.evaluate(() => {
      const host = document.querySelector('.hut-switch-grid app-hut-card');
      const root = host?.querySelector('.hut-card-root');
      return root?.classList.contains('hut-available') && getComputedStyle(root).getPropertyValue('--color').trim() !== 'black';
    });

    // Hover on body
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.6);
    await page.waitForTimeout(300);

    const hoverOnBody = await page.evaluate(() => {
      const host = document.querySelector('.hut-switch-grid app-hut-card');
      const root = host?.querySelector('.hut-card-root');
      const color = getComputedStyle(root).color;
      return { hovered: root?.matches(':hover') || host?.matches(':hover'), color };
    });

    console.log('\n── HUTS HOVER VERIFICATION ──');
    console.log(`  Hover on roof area — color changed: ${hoverOnRoof}`);
    console.log(`  Hover on body area: ${JSON.stringify(hoverOnBody)}`);
  }

  const singlePath = join(outDir, 'huts-single.png');
  await firstHut.screenshot({ path: singlePath });
  console.log(`  Single: ${singlePath}`);

  return metrics;
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

    const hutMetrics = await verifyHuts(page);

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

    // Pass/fail summary
    const pass =
      hutMetrics?.hostWidth === 140 &&
      hutMetrics?.roofWidth === 88 &&
      hutMetrics?.rootPaddingTop === 58 &&
      hutMetrics?.gridPaddingTop === 48 &&
      hutMetrics?.timerInsideBody === true &&
      hutMetrics?.gridColumnTemplate.includes('140px');

    console.log(`\n══ PHASE 1 VERIFICATION: ${pass ? 'PASS' : 'CHECK VALUES ABOVE'} ══`);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

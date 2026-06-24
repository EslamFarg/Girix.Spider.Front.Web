/**
 * TEMP — Root-cause verification for row selection on master-data screens.
 * Run: node scripts/verify-row-selection.mjs
 * Requires: ng serve on http://127.0.0.1:4200, playwright installed
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4200/#';
const MOCK_API = 'http://localhost-mock/v1';
const ROW_COUNT = 15;
const TARGET_DISPLAY_INDEX = 7;
const TARGET_ARRAY_INDEX = TARGET_DISPLAY_INDEX - 1;

const mockUser = {
  userId: '1',
  fullName: 'Verify QA',
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

const screens = [
  { name: 'tables', route: '/classes/tables', entity: 'Table', nameInput: '#tableName', priceInput: null },
  { name: 'rooms', route: '/classes/rooms', entity: 'Room', nameInput: '#roomName', priceInput: null },
  { name: 'huts', route: '/classes/huts', entity: 'Hut', nameInput: '#hutName', priceInput: '#hutPrice' },
];

function buildRows(entity) {
  return Array.from({ length: ROW_COUNT }, (_, i) => {
    const id = i + 1;
    return { id, name: `${entity}-${id}`, pricePerHour: id * 10, isAvailable: true, reservedTo: null, reservedFrom: null, orderId: 0 };
  });
}

function buildSearchResponse(rows) {
  return {
    value: { rows, paginationInfo: { totalRowsCount: rows.length, totalPagesCount: 1, currentPageIndex: 1 } },
    isSuccess: true,
    isFailure: false,
    error: { code: '', args: [], errorType: 0 },
  };
}

function parseVerifyLogs(consoleMessages) {
  const fieldRe = /(\w+):\s*([^,}\]]+)/g;
  return consoleMessages
    .filter((m) => m.text().includes('[ROW-SELECT-VERIFY]'))
    .map((m) => {
      const text = m.text().replace('[ROW-SELECT-VERIFY]', '').trim();
      const obj = { raw: text };
      let match;
      while ((match = fieldRe.exec(text)) !== null) {
        const key = match[1];
        let val = match[2].trim();
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (/^\d+$/.test(val)) val = Number(val);
        else if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        obj[key] = val;
      }
      return obj;
    });
}

async function setupPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push(msg));

  const expireDate = new Date(Date.now() + 365 * 86400000).toISOString();
  await page.addInitScript(
    ({ user, expireDate, mockApi }) => {
      localStorage.setItem('apiUrlOverride', mockApi);
      localStorage.setItem('expireDate', JSON.stringify(expireDate));
      localStorage.setItem('userDetails', JSON.stringify(user));
    },
    { user: mockUser, expireDate, mockApi: MOCK_API },
  );

  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    for (const screen of screens) {
      const prefix = `${MOCK_API}/${screen.entity}`;
      if (url.startsWith(`${prefix}/Search`) && method === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(buildSearchResponse(buildRows(screen.entity))) });
        return;
      }
      // getById endpoint is '/' + id → URL contains double slash: Table//7
      const getMatch = url.match(new RegExp(`${prefix}/+?(\\d+)(?:\\?.*)?$`));
      if (getMatch && method === 'GET') {
        const id = Number(getMatch[1]);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id, name: `${screen.entity}-${id}`, isAvailable: true, reservedFrom: '', orderId: 0 }),
        });
        return;
      }
    }
    await route.continue();
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => document.querySelector('app-root')?.innerHTML?.trim().length > 100, {
    timeout: 90000,
  });
  return { page, consoleMessages };
}

async function testScreen(page, consoleMessages, screen) {
  consoleMessages.length = 0;
  await page.goto(`${BASE}${screen.route}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('app-tables, app-rooms, app-huts', { timeout: 30000 }).catch(() => {});
  await page.waitForSelector('.rest-compact-table tbody tr', { timeout: 45000 });
  await page.waitForTimeout(800);

  const rows = page.locator('.rest-compact-table tbody tr');
  const rowCount = await rows.count();
  const expectedName = `${screen.entity}-${TARGET_DISPLAY_INDEX}`;

  async function readForm() {
    const name = await page.locator(screen.nameInput).inputValue();
    const price = screen.priceInput ? await page.locator(screen.priceInput).inputValue() : null;
    return { name, price };
  }

  async function runInteraction(source, clickFn) {
    consoleMessages.length = 0;
    await page.locator('button[type="reset"]').click();
    await page.waitForTimeout(200);
    await clickFn();
    await page.waitForTimeout(1200);
    const logs = parseVerifyLogs(consoleMessages);
    const form = await readForm();
    return { source, logs, form };
  }

  const rowClick = await runInteraction('row', async () => {
    await rows.nth(TARGET_ARRAY_INDEX).locator('td').nth(1).click();
  });

  const editClick = await runInteraction('edit', async () => {
    await rows.nth(TARGET_ARRAY_INDEX).locator('button.edit').click();
  });

  function summarize(result) {
    const clickLog = result.logs.find((l) => l.phase === 'row-click');
    const beforeLog = result.logs.find((l) => l.phase === 'before-getById');
    const afterLog = result.logs.find((l) => l.phase === 'after-getById');
    return {
      source: result.source,
      clickedRowId: clickLog?.clickedRowId,
      clickedRowName: clickLog?.clickedRowName,
      requestedId: beforeLog?.requestedId,
      returnedId: afterLog?.returnedId,
      returnedName: afterLog?.returnedName,
      idMatch: afterLog?.idMatch,
      formName: result.form.name,
      formPrice: result.form.price,
      formMatchesClickedRow: result.form.name === clickLog?.clickedRowName,
      formMatchesExpectedRow7: result.form.name === expectedName,
    };
  }

  return {
    screen: screen.name,
    rowCount,
    expectedName,
    rowClick: summarize(rowClick),
    editClick: summarize(editClick),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const { page, consoleMessages } = await setupPage(browser);
  const results = [];
  for (const screen of screens) {
    results.push(await testScreen(page, consoleMessages, screen));
  }
  await browser.close();

  console.log('\n========== ROW SELECTION VERIFICATION REPORT ==========\n');
  console.log('Animations: TEMP DISABLED via rest-compact-page.css verification block');
  for (const r of results) {
    console.log(`--- ${r.screen.toUpperCase()} ---`);
    console.log('ROW CLICK:', JSON.stringify(r.rowClick, null, 2));
    console.log('EDIT ICON:', JSON.stringify(r.editClick, null, 2));
  }

  const allRowClickOk = results.every((r) => r.rowClick.formMatchesExpectedRow7);
  const allEditOk = results.every((r) => r.editClick.formMatchesExpectedRow7);
  const rowVsEditSame = results.every((r) => r.rowClick.formName === r.editClick.formName);
  const allIdsCorrect = results.every(
    (r) =>
      r.rowClick.requestedId === r.rowClick.returnedId &&
      r.editClick.requestedId === r.editClick.returnedId,
  );

  console.log('\n========== ANSWERS ==========');
  console.log(`A) Problem gone with animations disabled? rowClick=${allRowClickOk}, edit=${allEditOk}`);
  console.log(`B) Edit vs row click identical? ${rowVsEditSame}`);
  console.log(`C) getById receives correct id? ${allIdsCorrect}`);
  console.log(`D) getById returns correct entity? ${allIdsCorrect}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

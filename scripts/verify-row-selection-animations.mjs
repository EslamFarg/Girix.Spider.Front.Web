/**
 * Compare row selection WITH animations re-enabled (override temp disable block).
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4200/#';
const MOCK_API = 'http://localhost-mock/v1';
const TARGET_INDEX = 6; // display row 7

const ANIMATION_CSS = `
app-tables .main-table.rest-compact-table tbody tr,
app-rooms .main-table.rest-compact-table tbody tr,
app-huts .main-table.rest-compact-table tbody tr {
  animation: showTableRow 0.5s calc(var(--ix) * 0.05s) linear forwards !important;
  opacity: 0 !important;
  transform: none !important;
}
app-tables .main-table.rest-compact-table tbody tr td,
app-rooms .main-table.rest-compact-table tbody tr td,
app-huts .main-table.rest-compact-table tbody tr td {
  animation: showTableRowCell 0.5s calc(var(--ix) * 0.05s) linear forwards !important;
  transform: none !important;
}
app-tables .main-table.rest-compact-table tbody tr td > div,
app-rooms .main-table.rest-compact-table tbody tr td > div,
app-huts .main-table.rest-compact-table tbody tr td > div {
  animation: showTableRowCellContent 0.5s calc(var(--ix) * 0.05s) linear forwards !important;
  opacity: 0 !important;
  transform: translateY(50px) !important;
  max-height: 0 !important;
  overflow: hidden !important;
}
@keyframes showTableRow { from { opacity: 0; } to { opacity: 1; } }
@keyframes showTableRowCell { from { padding: 0 8px; border-bottom-width: 0; } to { padding: 6px 8px; border-bottom-width: 1px; } }
@keyframes showTableRowCellContent { from { opacity: 0; transform: translateY(50px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 100px; } }
`;

const mockUser = {
  userId: '1', fullName: 'Verify QA', email: 'admin@admin.com', phoneNumber: '1234567890',
  token: 'qa-token', imageUrl: '',
  groups: [{ id: 1, name: 'Admin' }],
  setting: { name: 'Rest House', phoneNumber: '1234567890' },
  cashierCollectionAccountId: 1, cashierCollectionAccountName: 'C',
  custodyAccountId: 2, custodyAccountName: 'Cu',
  cashPaymentAccountId: 3, cashPaymentAccountName: 'Ca',
  bankPaymentAccountId: 4, bankPaymentAccountName: 'Ba',
};

function buildRows(entity) {
  return Array.from({ length: 15 }, (_, i) => {
    const id = i + 1;
    return { id, name: `${entity}-${id}`, pricePerHour: id * 10, isAvailable: true, reservedTo: null, reservedFrom: null, orderId: 0 };
  });
}

function buildSearchResponse(rows) {
  return {
    value: { rows, paginationInfo: { totalRowsCount: rows.length, totalPagesCount: 1, currentPageIndex: 1 } },
    isSuccess: true, isFailure: false, error: { code: '', args: [], errorType: 0 },
  };
}

function parseVerifyLogs(consoleMessages) {
  const fieldRe = /(\w+):\s*([^,}\]]+)/g;
  return consoleMessages
    .filter((m) => m.text().includes('[ROW-SELECT-VERIFY]'))
    .map((m) => {
      const text = m.text().replace('[ROW-SELECT-VERIFY]', '').trim();
      const obj = {};
      let match;
      while ((match = fieldRe.exec(text)) !== null) {
        const key = match[1];
        let val = match[2].trim();
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (/^\d+$/.test(val)) val = Number(val);
        obj[key] = val;
      }
      return obj;
    });
}

async function testScreen(page, entity, route, nameInput, waitMs) {
  const consoleMessages = [];
  page.removeAllListeners('console');
  page.on('console', (msg) => consoleMessages.push(msg));

  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('.rest-compact-table tbody tr', { timeout: 45000 });
  await page.addStyleTag({ content: ANIMATION_CSS });
  await page.waitForTimeout(waitMs);

  await page.locator('button[type="reset"]').click();
  await page.waitForTimeout(200);

  const rows = page.locator('.rest-compact-table tbody tr');
  const targetRow = rows.nth(TARGET_INDEX);
  const box = await targetRow.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  } else {
    await targetRow.click();
  }
  await page.waitForTimeout(1200);

  const logs = parseVerifyLogs(consoleMessages);
  const clickLog = logs.find((l) => l.phase === 'row-click');
  const afterLog = logs.find((l) => l.phase === 'after-getById');
  const formName = await page.locator(nameInput).inputValue();

  return {
    entity,
    waitMs,
    clickedRowId: clickLog?.clickedRowId,
    clickedRowName: clickLog?.clickedRowName,
    requestedId: clickLog?.clickedRowId,
    returnedId: afterLog?.returnedId,
    returnedName: afterLog?.returnedName,
    formName,
    expectedName: `${entity}-${TARGET_INDEX + 1}`,
    ok: formName === `${entity}-${TARGET_INDEX + 1}` && clickLog?.clickedRowId === TARGET_INDEX + 1,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

const expireDate = new Date(Date.now() + 365 * 86400000).toISOString();
await page.addInitScript(({ user, expireDate, mockApi }) => {
  localStorage.setItem('apiUrlOverride', mockApi);
  localStorage.setItem('expireDate', JSON.stringify(expireDate));
  localStorage.setItem('userDetails', JSON.stringify(user));
}, { user: mockUser, expireDate, mockApi: MOCK_API });

await page.route('**/*', async (route) => {
  const url = route.request().url();
  const method = route.request().method();
  for (const entity of ['Table', 'Room', 'Hut']) {
    const prefix = `${MOCK_API}/${entity}`;
    if (url.startsWith(`${prefix}/Search`) && method === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(buildSearchResponse(buildRows(entity))) });
      return;
    }
    const getMatch = url.match(new RegExp(`${prefix}/+?(\\d+)(?:\\?.*)?$`));
    if (getMatch && method === 'GET') {
      const id = Number(getMatch[1]);
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ id, name: `${entity}-${id}`, isAvailable: true, reservedFrom: '', orderId: 0, pricePerHour: id * 10 }),
      });
      return;
    }
  }
  await route.continue();
});

console.log('\n========== ANIMATIONS RE-ENABLED (early click @ 400ms) ==========\n');
for (const { entity, route, input } of [
  { entity: 'Table', route: '/classes/tables', input: '#tableName' },
  { entity: 'Room', route: '/classes/rooms', input: '#roomName' },
  { entity: 'Hut', route: '/classes/huts', input: '#hutName' },
]) {
  console.log(entity, await testScreen(page, entity, route, input, 400));
}

console.log('\n========== ANIMATIONS RE-ENABLED (after complete @ 2000ms) ==========\n');
for (const { entity, route, input } of [
  { entity: 'Table', route: '/classes/tables', input: '#tableName' },
  { entity: 'Room', route: '/classes/rooms', input: '#roomName' },
  { entity: 'Hut', route: '/classes/huts', input: '#hutName' },
]) {
  console.log(entity, await testScreen(page, entity, route, input, 2000));
}

await browser.close();

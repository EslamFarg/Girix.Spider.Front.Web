/** Early-click test WITH global table animations (temp disable block commented out). */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4200/#';
const MOCK_API = 'http://localhost-mock/v1';
const TARGET = 6;

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
  return Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `${entity}-${i + 1}`, pricePerHour: (i + 1) * 10, isAvailable: true, reservedTo: null, reservedFrom: null, orderId: 0 }));
}

function buildSearchResponse(rows) {
  return { value: { rows, paginationInfo: { totalRowsCount: rows.length, totalPagesCount: 1, currentPageIndex: 1 } }, isSuccess: true, isFailure: false, error: { code: '', args: [], errorType: 0 } };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const logs = [];
page.on('console', (m) => logs.push(m.text()));

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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id, name: `${entity}-${id}`, isAvailable: true, reservedFrom: '', orderId: 0 }) });
      return;
    }
  }
  await route.continue();
});

for (const [entity, route, input] of [['Table', '/classes/tables', '#tableName'], ['Room', '/classes/rooms', '#roomName'], ['Hut', '/classes/huts', '#hutName']]) {
  logs.length = 0;
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('.rest-compact-table tbody tr', { timeout: 45000 });
  await page.waitForTimeout(350); // click during staggered animation window
  await page.locator('button[type="reset"]').click();
  await page.waitForTimeout(100);
  const row = page.locator('.rest-compact-table tbody tr').nth(TARGET);
  const box = await row.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1500);
  const form = await page.locator(input).inputValue();
  const verify = logs.filter((l) => l.includes('[ROW-SELECT-VERIFY]'));
  console.log(`${entity}: form=${form}, expected=${entity}-7, logs=`, verify);
}

await browser.close();

/**
 * Debug helper for row-selection verification.
 */
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4200/#';
const MOCK_API = 'http://localhost-mock/v1';

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

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const consoleMessages = [];
const apiCalls = [];

page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on('request', (req) => {
  const url = req.url();
  if (url.includes('Table') || url.includes('Room') || url.includes('Hut') || url.includes('localhost-mock')) {
    apiCalls.push({ method: req.method(), url });
  }
});

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
    const getMatch = url.match(new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/+?(\\d+)(?:\\?.*)?$`));
    if (getMatch && method === 'GET') {
      const id = Number(getMatch[1]);
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ id, name: `${entity}-${id}`, isAvailable: true, reservedFrom: '', orderId: 0 }),
      });
      return;
    }
  }
  await route.continue();
});

await page.goto(`${BASE}/classes/tables`, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForSelector('.rest-compact-table tbody tr', { timeout: 45000 });
await page.waitForTimeout(1000);

const rowTexts = await page.locator('.rest-compact-table tbody tr').allTextContents();
console.log('ROW TEXTS (first 3):', rowTexts.slice(0, 3));
console.log('ROW 7 TEXT:', rowTexts[6]);
console.log('API CALLS ON LOAD:', apiCalls);

consoleMessages.length = 0;
apiCalls.length = 0;

await page.locator('button[type="reset"]').click();
await page.waitForTimeout(300);
await page.locator('.rest-compact-table tbody tr').nth(6).click();
await page.waitForTimeout(1500);

const formName = await page.locator('#tableName').inputValue();
console.log('FORM AFTER ROW CLICK:', formName);
console.log('VERIFY CONSOLE:', consoleMessages.filter((m) => m.text.includes('ROW-SELECT')));
console.log('API CALLS AFTER CLICK:', apiCalls);

await browser.close();

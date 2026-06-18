import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

mkdirSync('screenshots', { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const filePath = 'file:///' + resolve('scripts/table-card-size-test.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => ({
    before: {
      host: (() => { const r = document.getElementById('before-host').getBoundingClientRect(); return { w: Math.round(r.width * 10)/10, h: Math.round(r.height * 10)/10 }; })(),
      div:  (() => { const r = document.getElementById('before-div').getBoundingClientRect();  return { w: Math.round(r.width * 10)/10, h: Math.round(r.height * 10)/10 }; })(),
    },
    after: {
      host: (() => { const r = document.getElementById('after-host').getBoundingClientRect(); return { w: Math.round(r.width * 10)/10, h: Math.round(r.height * 10)/10 }; })(),
      div:  (() => { const r = document.getElementById('after-div').getBoundingClientRect();  return { w: Math.round(r.width * 10)/10, h: Math.round(r.height * 10)/10 }; })(),
    },
  }));

  await page.screenshot({ path: 'screenshots/table-card-before-after.png' });
  console.log('Screenshot saved: screenshots/table-card-before-after.png');
  console.log('\n=== BEFORE fix (aspect-square, no child rule, no justify-items-center) ===');
  console.log('  Host:       ', result.before.host.w, '×', result.before.host.h, 'px');
  console.log('  Inner div:  ', result.before.div.w,  '×', result.before.div.h,  'px');
  console.log('\n=== AFTER fix  (child rule width/height:175, justify-items-center) ===');
  console.log('  Host:       ', result.after.host.w, '×', result.after.host.h, 'px');
  console.log('  Inner div:  ', result.after.div.w,  '×', result.after.div.h,  'px');

  const pass = result.after.div.w === 175 && result.after.div.h === 175;
  console.log(pass ? '\n✅ PASS — circle is exactly 175 × 175 px' : `\n❌ FAIL — ${result.after.div.w} × ${result.after.div.h}`);

  await browser.close();
})();

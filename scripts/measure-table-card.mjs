import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('screenshots', { recursive: true });

(async () => {
  // Launch with the user's existing Chrome profile (has app session)
  const browser = await chromium.launchPersistentContext(
    'C:/Users/bg/AppData/Local/Google/Chrome/User Data/Default',
    {
      headless: true,
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    }
  ).catch(() => null);

  if (!browser) {
    console.log('Failed to launch with Chrome profile');
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:4200/invoices/replacements/tables', {
    waitUntil: 'networkidle',
    timeout: 20000,
  });
  await page.waitForTimeout(3000);

  console.log('URL:', page.url());
  await page.screenshot({ path: 'screenshots/tables-after-fix.png' });
  console.log('Screenshot saved');

  // Measure
  const result = await page.evaluate(() => {
    const host = document.querySelector('app-table-card');
    const div = document.querySelector('app-table-card > div');
    if (!host) return { found: false, url: location.href };
    const hr = host.getBoundingClientRect();
    const dr = div ? div.getBoundingClientRect() : null;
    return {
      found: true,
      host: { w: Math.round(hr.width * 10) / 10, h: Math.round(hr.height * 10) / 10 },
      div: dr ? { w: Math.round(dr.width * 10) / 10, h: Math.round(dr.height * 10) / 10 } : null,
    };
  });

  console.log('\n=== MEASUREMENT ===');
  console.log(JSON.stringify(result, null, 2));
  if (result.found && result.div) {
    if (result.div.w === 175 && result.div.h === 175) {
      console.log('✅ PASS: 175 × 175 confirmed');
    } else {
      console.log(`❌ Size is ${result.div.w} × ${result.div.h}`);
    }
  }

  await browser.close();
})();

import { test, expect } from '@playwright/test';

test('Check live production site loading', async ({ page }) => {
  page.on('console', (msg) => console.log('[LIVE LOG]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[LIVE PAGE EXCEPTION]', err));

  await page.goto('https://aqms-qa.vercel.app/');
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('Live page title:', title);

  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Live page body text snippet:', pageText.slice(0, 300));
});

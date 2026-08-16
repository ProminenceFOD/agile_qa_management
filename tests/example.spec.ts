import { test, expect } from '@playwright/test';

test('App page loads and has main title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Quality Assurance Management System/i);
});

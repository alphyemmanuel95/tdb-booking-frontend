import { expect, test } from '@playwright/test';

test('shows the booking page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Book darshan' })).toBeVisible();
});

test('shows the not-found page for unknown routes', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

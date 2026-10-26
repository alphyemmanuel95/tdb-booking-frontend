import { expect, test } from '@playwright/test';

const feedback = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'The example form is easy to use.',
    createdAt: '2026-01-01T10:00:00.000Z',
  },
];

test.beforeEach(async ({ page }) => {
  // No real backend in E2E: answer API calls from the test.
  await page.route('**/api/feedback', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        json: {
          id: '2',
          name: 'Grace Hopper',
          email: 'grace@example.com',
          message: 'Great starter project!',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
      });
      return;
    }
    await route.fulfill({ json: feedback });
  });
});

test('navigates from home to the feedback page with the keyboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'React Starter' })).toBeVisible();

  await page.getByRole('link', { name: 'Try the feedback example' }).focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/feedback$/);
  await expect(page.getByRole('list', { name: 'Feedback' })).toContainText('Ada Lovelace');
});

test('validates and submits the feedback form', async ({ page }) => {
  await page.goto('/feedback');

  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();

  await page.getByLabel('Name').fill('Grace Hopper');
  await page.getByLabel('Email').fill('grace@example.com');
  await page.getByLabel('Message').fill('Great starter project!');
  await page.getByRole('button', { name: 'Send feedback' }).click();

  await expect(page.getByRole('status')).toContainText('Thanks, Grace Hopper!');
});

test('shows the not-found page for unknown routes', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

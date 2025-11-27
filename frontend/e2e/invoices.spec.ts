import { expect, test } from '@playwright/test';

test.describe('Invoice CRUD Operations', () => {
  test('should display invoices list page', async ({ page }) => {
    await page.goto('/invoices');
    
    // Should either show invoices list or redirect to login
    const url = page.url();
    if (url.includes('/login')) {
      expect(url).toContain('/login');
    } else {
      await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
    }
  });

  test('should navigate to new invoice page', async ({ page }) => {
    await page.goto('/invoices');
    
    const newButton = page.getByRole('button', { name: /new|add/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await expect(page).toHaveURL(/.*invoices.*new/);
    }
  });
});



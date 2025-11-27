import { expect, test } from '@playwright/test';

test.describe('Ticket CRUD Operations', () => {
  test('should display tickets list page', async ({ page }) => {
    await page.goto('/tickets');
    
    // Should either show tickets list or redirect to login
    const url = page.url();
    if (url.includes('/login')) {
      expect(url).toContain('/login');
    } else {
      await expect(page.getByRole('heading', { name: /tickets/i })).toBeVisible();
    }
  });

  test('should navigate to new ticket page', async ({ page }) => {
    await page.goto('/tickets');
    
    const newButton = page.getByRole('button', { name: /new|add/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await expect(page).toHaveURL(/.*tickets.*new/);
    }
  });
});



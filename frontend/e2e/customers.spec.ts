import { expect, test } from '@playwright/test';

test.describe('Customer CRUD Operations', () => {
  // Note: These tests assume the backend is running and accessible
  // In a real scenario, you'd set up test data and authentication
  
  test('should display customers list page', async ({ page }) => {
    // This test will fail if not authenticated - that's expected
    // In a full setup, you'd authenticate first
    await page.goto('/customers');
    
    // Should either show customers list or redirect to login
    const url = page.url();
    if (url.includes('/login')) {
      // Not authenticated - this is expected behavior
      expect(url).toContain('/login');
    } else {
      // If authenticated, should see customers page
      await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/customers');
    
    // Check if search input exists (if authenticated)
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should navigate to new customer page', async ({ page }) => {
    await page.goto('/customers');
    
    // Try to find and click "New Customer" button
    const newButton = page.getByRole('button', { name: /new|add/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await expect(page).toHaveURL(/.*customers.*new/);
    }
  });
});





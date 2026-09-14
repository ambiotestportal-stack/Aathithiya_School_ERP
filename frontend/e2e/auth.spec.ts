import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation', () => {
  test('should login successfully as admin', async ({ page }) => {
    await page.goto('/');
    
    // Fill in credentials
    await page.fill('input[placeholder="Enter your username or ID..."]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login
    await page.click('button:has-text("Sign In To Dashboard")');
    
    // Expect navigation to admin dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    
    // Verify a key element on the dashboard exists
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
    
    // Test logout
    await page.click('button:has-text("Logout")'); // Assuming a logout button exists
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder="Enter your username or ID..."]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button:has-text("Sign In To Dashboard")');
    
    await expect(page.locator('text=Invalid username or password')).toBeVisible();
  });
});

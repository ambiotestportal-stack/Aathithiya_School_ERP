import { test, expect } from '@playwright/test';

test.describe('Finance Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[placeholder="Enter your username or ID..."]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In To Dashboard")');
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
  });

  test('admin can assign a fee to entire class and mark it paid', async ({ page }) => {
    // Navigate to Finance
    await page.click('text=Finance');
    await expect(page).toHaveURL(/.*\/admin\/finance/);

    // Ensure we are on "Fee Collection" tab (which is default usually, or click it)
    if (await page.locator('button:has-text("Fee Collection")').isVisible()) {
      await page.locator('button:has-text("Fee Collection")').click();
    }

    // Click Assign Fee
    // Click Assign Fee
    await page.click('button:has-text("Assign Fee")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'finance-debug2.png' });
    
    // Fill Fee Modal
    // Fill Fee Modal
    await expect(page.locator('text=Assign Fee To')).toBeVisible();
    
    // Choose "Entire Class" is default usually, let's select a class
    // We just pick the first available class option
    const classSelect = page.locator('select').nth(0);
    // Find the second option (first is placeholder)
    await classSelect.selectOption({ index: 1 });

    // Unique fee name
    const feeName = `Test Term Fee ${Date.now()}`;

    // Amount, Due Date, Remarks
    await page.fill('input#amount', '500'); // amount
    await page.fill('input#dueDate', '2026-12-31'); // due date
    await page.fill('textarea#remarks', feeName);

    // Submit
    await page.locator('button[form="fee-form"]').click();

    // Verify it disappears
    await expect(page.locator('text=Assign Fee To')).toBeHidden();

    // Verify the fee appears in the table (search for feeName)
    await expect(page.locator(`text=${feeName}`).first()).toBeVisible();

    // Mark as Paid
    const row = page.locator('tr').filter({ hasText: feeName }).first();
    await row.getByRole('button', { name: 'Mark Paid' }).click();

    // Confirm dialog
    await expect(page.locator('h3:has-text("Mark as Paid")')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Wait for the "Paid on" text to appear in that row
    await expect(row.locator('text=Paid on')).toBeVisible();
  });
});

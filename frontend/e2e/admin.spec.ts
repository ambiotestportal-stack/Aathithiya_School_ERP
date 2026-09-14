import { test, expect } from '@playwright/test';

test.describe('Admin Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/');
    await page.fill('input[placeholder="Enter your username or ID..."]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In To Dashboard")');
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
  });

  test('should navigate to staff management and create a teacher', async ({ page }) => {
    // Navigate to Staff
    await page.click('text=Staff');
    await expect(page).toHaveURL(/.*\/admin\/staff/);

    // Click Add Staff
    await page.getByRole('button', { name: 'Add Staff Member', exact: false }).first().click();
    
    // Check modal exists
    await expect(page.locator('h3:has-text("Add New Staff Member")')).toBeVisible();

    // Fill form
    await page.fill('input#name', 'Test Teacher');
    await page.fill('input#email', `teacher_${Date.now()}@school.com`);
    await page.fill('input#employeeId', `EMP${Date.now()}`);
    
    // Select Subject (just picks the second option, since first is default)
    await page.locator('select#subject').selectOption({ index: 1 });
    
    await page.fill('input#designation', 'Senior Teacher');
    await page.fill('input#joiningDate', '2026-09-01');
    await page.fill('input#qualification', 'MSc Physics');
    await page.fill('input#experienceYears', '5');
    await page.fill('input#salary', '50000');

    // Submit
    await page.locator('button[form="staff-form"]').click();

    // Wait for modal to close
    await expect(page.locator('h3:has-text("Add New Staff Member")')).toBeHidden();
    await expect(page.locator('text=Test Teacher').first()).toBeVisible();
  });
});

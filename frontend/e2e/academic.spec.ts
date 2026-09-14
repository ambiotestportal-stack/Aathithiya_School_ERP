import { test, expect } from '@playwright/test';

test.describe('Academic & Attendance', () => {
  let teacherEmail = `teacher_${Date.now()}@school.com`;
  let employeeId = `EMP${Date.now()}`;

  test('admin creates a teacher and teacher logs in to view classes', async ({ page }) => {
    // 1. Admin login
    await page.goto('/');
    await page.fill('input[placeholder="Enter your username or ID..."]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In To Dashboard")');
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // 2. Create Teacher
    await page.click('text=Staff');
    await page.getByRole('button', { name: 'Add Staff Member', exact: false }).first().click();
    
    await expect(page.locator('h3:has-text("Add New Staff Member")')).toBeVisible();
    await page.fill('input#name', 'Academic Teacher');
    await page.fill('input#email', teacherEmail);
    await page.fill('input#employeeId', employeeId);
    await page.locator('select#subject').selectOption({ index: 1 });
    await page.fill('input#designation', 'Academic Staff');
    await page.fill('input#joiningDate', '2026-09-01');
    await page.fill('input#salary', '40000');
    
    await page.locator('button[form="staff-form"]').click();
    await expect(page.locator('h3:has-text("Add New Staff Member")')).toBeHidden();
    
    // 3. Admin Logout
    await page.click('text=Logout'); // Usually in sidebar or header
    // Wait for the modal or confirmation if there is one
    // Assuming it's a direct logout or there's a confirm modal
    // In our system it might just log out. Let's handle generic case:
    if (await page.locator('button:has-text("Confirm")').isVisible()) {
      await page.click('button:has-text("Confirm")');
    }
    await expect(page).toHaveURL('http://localhost:3000/');

    // 4. Teacher Login
    await page.fill('input[placeholder="Enter your username or ID..."]', teacherEmail);
    await page.fill('input[type="password"]', employeeId);
    await page.click('button:has-text("Sign In To Dashboard")');
    
    // 5. Verify Teacher Dashboard
    await expect(page).toHaveURL(/.*\/teacher\/dashboard/);
    await expect(page.locator('h1').filter({ hasText: 'Welcome' })).toBeVisible();

    // 6. Navigate to Attendance
    await page.click('text=Attendance');
    await expect(page).toHaveURL(/.*\/teacher\/attendance/);
    await expect(page.locator('h1').filter({ hasText: 'Attendance Management' })).toBeVisible();
  });
});

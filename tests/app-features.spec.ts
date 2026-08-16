import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Agile QA Management System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('[BROWSER ERROR]', msg.text());
    });
    page.on('pageerror', (err) => console.log('[BROWSER EXCEPTION]', err));

    // Inject active session, demo user and stories into localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem(
        'aqms_session',
        JSON.stringify({
          user: {
            email: 'qa@aqms.com',
            name: 'Damilola Ogunlade',
            role: 'Administrator',
            organizationId: 'demo-org',
            organizationName: 'AQMS Demo Organization',
          },
          timestamp: Date.now(),
        })
      );
      localStorage.setItem(
        'aqms_users',
        JSON.stringify([
          {
            email: 'qa@aqms.com',
            password: 'password123',
            name: 'Damilola Ogunlade',
            role: 'Administrator',
            organizationId: 'demo-org',
            organizationName: 'AQMS Demo Organization',
            canSignOffQA: true,
            canSignOffPM: true,
            id: 'USR-001',
            isActive: true,
          },
        ])
      );
      localStorage.setItem(
        'aqms_stories',
        JSON.stringify([
          {
            id: 'US-101',
            title: 'User Authentication - Login Flow',
            description: 'As a user, I want to log in.',
            acceptanceCriteria: true,
            qaSignOff: true,
            pmApproval: true,
            criteriaDetails: 'Given valid user credentials when I submit login then I access dashboard.',
            assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
            assignedDeveloper: 'James Martinez',
            assignedTester: 'Damilola Ogunlade',
            priority: 'Critical',
            storyPoints: 8,
            sprint: 'Sprint 12',
            status: 'Ready for Dev',
            createdAt: '2026-04-15T00:00:00.000Z',
            updatedAt: '2026-04-20T00:00:00.000Z',
          },
          {
            id: 'US-102',
            title: 'Payment Gateway Integration - Story Without Points',
            description: 'As a user, I want to pay using Stripe.',
            acceptanceCriteria: true,
            qaSignOff: true,
            pmApproval: true,
            criteriaDetails: 'Payment criteria details.',
            assignedQAReviewer: 'Damilola Ogunlade (Head of QA)',
            priority: 'High',
            sprint: 'Sprint 12',
            status: 'Backlog',
            createdAt: '2026-04-15T00:00:00.000Z',
            updatedAt: '2026-04-20T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('/');
    await expect(page.locator('header h1')).toHaveText('Dashboard');
  });

  test('Navbar & Tab Navigation works smoothly', async ({ page }) => {
    // Navigate to Kanban Board
    await page.locator('aside button', { hasText: 'Kanban Board' }).first().click();
    await expect(page.locator('header h1')).toHaveText('Kanban Board');

    // Navigate to Stories / Requirements Triage
    await page.locator('aside button', { hasText: 'Stories' }).first().click();
    await expect(page.locator('header h1')).toHaveText('Stories');
  });

  test('View Story from Requirements Triage opens StoryView properly', async ({ page }) => {
    // Click Stories in sidebar
    await page.locator('aside button', { hasText: 'Stories' }).first().click();
    await expect(page.locator('header h1')).toHaveText('Stories');

    // Click "View" button on the first story in the table
    const viewButton = page.locator('button[title="View story details"]').first();
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    // Verify StoryView details are visible
    await expect(page.getByText('Back to List')).toBeVisible();
    await expect(page.getByText('Quality Gates')).toBeVisible();

    // Click Back to List
    await page.getByText('Back to List').click();
    await expect(page.locator('header h1')).toHaveText('Stories');
  });

  test('View Story from Kanban Board opens StoryView properly even for stories without storyPoints', async ({ page }) => {
    // Click Kanban Board in sidebar
    await page.locator('aside button', { hasText: 'Kanban Board' }).first().click();
    await expect(page.locator('header h1')).toHaveText('Kanban Board');

    // Filter to Stories only to ensure a story card is clicked
    const storiesFilterBtn = page.locator('button', { hasText: 'Stories Only' });
    if (await storiesFilterBtn.isVisible()) {
      await storiesFilterBtn.click();
    }

    // Find story card on board and click it
    const storyCard = page.locator('.group.bg-white', { hasText: 'US-' }).first();
    await expect(storyCard).toBeVisible();
    await storyCard.click();

    // Verify StoryView component is rendered (Back to List & Quality Gates) instead of BugView
    await expect(page.getByText('Back to List')).toBeVisible();
    await expect(page.getByText('Quality Gates')).toBeVisible();

    // Verify clicking Back to List returns to Kanban Board view
    await page.getByText('Back to List').click();
    await expect(page.locator('header h1')).toHaveText('Kanban Board');
  });
});

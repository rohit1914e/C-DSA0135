import { test, expect } from '@playwright/test';

test('Verify Cinematic Intro Screen and Button Interaction', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for entrance animations

  // 1. Verify Intro Typography
  const mainTitle = page.locator('h1', { hasText: 'VOID CINEMA' });
  await expect(mainTitle).toBeVisible();

  const subTitle = page.locator('h2', { hasText: 'Your Smart Ticket Booking Assistant' });
  await expect(subTitle).toBeVisible();

  const developerText = page.locator('text=Rohit • Grace • Jagan');
  await expect(developerText).toBeVisible();

  // 2. Verify Button exists
  const enterButton = page.locator('button', { hasText: 'ENTER VOID CINEMA' });
  await expect(enterButton).toBeVisible();

  // Ensure no movie posters are visible on the first screen
  const firstPoster = page.locator('section#movies img.object-cover').first();
  await expect(firstPoster).not.toBeInViewport();

  // 3. Simulate Click
  await enterButton.click();

  // 4. Verify Scroll behavior
  // After clicking, it triggers `scrollIntoView` for #movies
  await page.waitForTimeout(1500); // Wait for smooth scroll

  const moviesSection = page.locator('section#movies');
  await expect(moviesSection).toBeInViewport();

  console.log('✅ Cinematic Intro rendered perfectly.');
  console.log('✅ Enter Button triggers smooth scroll to Movies section.');
});

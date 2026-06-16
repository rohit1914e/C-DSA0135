import { test, expect } from '@playwright/test';

test('Trace Network and Video Render Path', async ({ page }) => {
  test.setTimeout(90000);
  
  const pageLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('VIDEO') || text.includes('Phase:')) {
      console.log(`[REACT COMPONENT LOG] ${text}`);
      pageLogs.push(text);
    }
  });

  // Track network requests
  page.on('request', request => {
    if (request.url().includes('.mp4') || request.url().includes('video')) {
      console.log(`[NETWORK REQUEST] -> ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('.mp4') || response.url().includes('video')) {
      console.log(`[NETWORK RESPONSE] <- ${response.status()} ${response.url()} (Content-Type: ${response.headers()['content-type']})`);
    }
  });

  // Navigate through booking
  await page.goto('http://localhost:5174/movie/interstellar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.locator('text=/BOOK TICKETS/i').first().click();
  await page.waitForURL(/\/booking\/interstellar/);
  await page.waitForTimeout(1000);

  await page.locator('[data-seat-id="A1"]').click();
  await page.locator('text=/Confirm Booking/i').first().click();
  
  await page.waitForURL(/\/payment\//);
  await page.waitForTimeout(1000);

  const payButton = page.locator('text=/i have completed payment/i');
  await expect(payButton).toBeVisible();

  console.log('\n--- CLICKING "I HAVE COMPLETED PAYMENT" ---');
  await payButton.click();
  
  await page.waitForTimeout(200);

  await page.evaluate(() => {
    const video = document.querySelector('video');
    console.log(`[METRICS] <video> tag exists: ${video !== null}`);
    if (video) {
      console.log(`[METRICS] Exact src attribute: ${video.getAttribute('src')}`);
      console.log(`[METRICS] Exact evaluated src property: ${video.src}`);
    } else {
      console.log(`[METRICS] Exact DOM state: No <video> found.`);
    }
  });

  // Let the test run to capture playback events and network traffic
  await page.waitForTimeout(8000);
});

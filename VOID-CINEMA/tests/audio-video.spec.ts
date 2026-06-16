import { test, expect } from '@playwright/test';

test('Test Audio Enabled Video Playback', async ({ page }) => {
  test.setTimeout(90000);
  
  const pageLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('VIDEO')) {
      console.log(`[Browser Console] ${text}`);
      pageLogs.push(text);
    }
  });

  await page.goto('http://localhost:5173/movie/interstellar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Navigate through booking
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
  
  // Wait to see what happens
  await page.waitForTimeout(500);

  // Check if the overlay appeared
  const overlayText = page.locator('text=/Tap anywhere to continue cinematic playback/i');
  const overlayVisible = await overlayText.isVisible().catch(() => false);

  if (overlayVisible) {
    console.log('[TEST] Chrome blocked autoplay. Audio overlay IS visible.');
    console.log('--- CLICKING OVERLAY TO ENABLE AUDIO ---');
    await overlayText.click();
    await page.waitForTimeout(500);
  } else {
    console.log('[TEST] Audio overlay is NOT visible. Autoplay might have succeeded or failed with a different error.');
  }

  // Check if video is playing and unmuted
  const metrics = await page.evaluate(() => {
    const video = document.querySelector('video');
    return {
      exists: video !== null,
      paused: video ? video.paused : 'N/A',
      muted: video ? video.muted : 'N/A',
      currentTime: video ? video.currentTime : 'N/A',
    };
  });

  console.log(`\n[METRICS] Video playing status:`);
  console.log(`- Exists: ${metrics.exists}`);
  console.log(`- Paused: ${metrics.paused}`);
  console.log(`- Muted: ${metrics.muted}`);
  console.log(`- Current Time: ${metrics.currentTime}`);

  if (metrics.exists && !metrics.paused && !metrics.muted) {
    console.log('\n✅ Audio-enabled playback SUCCEEDED!');
  } else {
    console.log('\n❌ Audio-enabled playback FAILED or is muted.');
  }

  await page.waitForTimeout(2000);
});

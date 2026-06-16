import { test, expect } from '@playwright/test';

test('Strict Video Playback Verification', async ({ page }) => {
  test.setTimeout(90000);
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('VIDEO') || text.includes('REDIRECTING') || text.includes('[TICK') || text.includes('[METRICS]')) {
      console.log(`[Browser Console] ${text}`);
    }
  });

  const TARGET_URL = 'http://localhost:5174/movie/interstellar';
  console.log(`\nNavigating to EXACT URL: ${TARGET_URL}`);
  
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
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
  
  await page.waitForTimeout(100);

  await page.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) {
      console.log('[METRICS] ERROR: NO VIDEO FOUND IN DOM');
      return;
    }
    
    const rect = video.getBoundingClientRect();
    console.log(`[METRICS] BoundingClientRect: width=${rect.width}, height=${rect.height}, top=${rect.top}, left=${rect.left}`);
    
    const centerEl = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    console.log(`[METRICS] elementFromPoint at center: <${centerEl?.tagName.toLowerCase()} class="${centerEl?.className}" id="${centerEl?.id}">`);

    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      const v = document.querySelector('video');
      if (!v) {
        console.log(`[TICK ${tickCount}s] VIDEO ELEMENT UNMOUNTED!`);
        clearInterval(interval);
        return;
      }
      console.log(`[TICK ${tickCount}s] currentTime=${v.currentTime.toFixed(3)}, duration=${v.duration}, readyState=${v.readyState}, paused=${v.paused}`);
    }, 1000);

    video.addEventListener('ended', () => {
      console.log('[METRICS] NATIVE ENDED EVENT FIRED');
      clearInterval(interval);
    });
    setTimeout(() => clearInterval(interval), 12000);
  });

  await page.waitForTimeout(6000);
});

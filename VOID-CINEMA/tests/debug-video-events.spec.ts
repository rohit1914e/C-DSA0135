import { test, expect } from '@playwright/test';

test('Debug Video Render and Media Events', async ({ page }) => {
  test.setTimeout(90000);
  
  const pageLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('VIDEO') || text.includes('[MEDIA EVENT]') || text.includes('[CSS]')) {
      console.log(`[Browser Console] ${text}`);
      pageLogs.push(text);
    }
  });

  await page.goto('http://localhost:5174/movie/interstellar', { waitUntil: 'networkidle' });
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

  // Inject a script to listen for events and check CSS
  await page.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) {
      console.log('[CSS] ERROR: NO VIDEO FOUND IN DOM');
      return;
    }
    
    // 1. Computed CSS
    const computedStyle = window.getComputedStyle(video);
    console.log(`[CSS] width: ${computedStyle.width}`);
    console.log(`[CSS] height: ${computedStyle.height}`);
    console.log(`[CSS] opacity: ${computedStyle.opacity}`);
    console.log(`[CSS] visibility: ${computedStyle.visibility}`);
    console.log(`[CSS] display: ${computedStyle.display}`);
    console.log(`[CSS] transform: ${computedStyle.transform}`);
    console.log(`[CSS] z-index: ${computedStyle.zIndex}`);

    // Bounding client rect for good measure
    const rect = video.getBoundingClientRect();
    console.log(`[CSS] BoundingRect: width=${rect.width}, height=${rect.height}, top=${rect.top}, left=${rect.left}`);

    // 2. Listen for media events
    const logEvent = (eventName: string) => {
      console.log(`[MEDIA EVENT] ${eventName} fired`);
    };

    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'error'].forEach(eventName => {
      video.addEventListener(eventName, (e) => {
        logEvent(eventName);
        if (eventName === 'error') {
          console.log(`[MEDIA EVENT] Error detail: ${video.error?.message || video.error?.code}`);
        }
        
        // Log state on loadedmetadata
        if (eventName === 'loadedmetadata' || eventName === 'canplay') {
          console.log(`[MEDIA EVENT] State at ${eventName}:`, JSON.stringify({
            readyState: video.readyState,
            currentSrc: video.currentSrc,
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            error: video.error ? video.error.code : null
          }));
        }
      });
    });

    // Check immediate state
    console.log('VIDEO READY', JSON.stringify({
      readyState: video.readyState,
      currentSrc: video.currentSrc,
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      error: video.error ? video.error.code : null
    }));
  });

  // Wait to capture all events
  await page.waitForTimeout(6000);
});
